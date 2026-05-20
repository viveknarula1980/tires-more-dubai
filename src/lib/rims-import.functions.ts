import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const userId = (context as { userId?: string }).userId;
    if (!userId) throw new Error("Unauthorized");
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Forbidden: admin role required");
    return next();
  });

const FIRECRAWL = "https://api.firecrawl.dev/v2";

function fcKey() {
  const k = process.env.FIRECRAWL_API_KEY;
  if (!k) throw new Error("FIRECRAWL_API_KEY is not configured");
  return k;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Color suffix in SKU -> human finish/color
const COLOR_MAP: Record<string, { finish: string; color: string }> = {
  BR: { finish: "Bronze", color: "Bronze" },
  GB: { finish: "Gloss Black", color: "Black" },
  BK: { finish: "Satin Black", color: "Black" },
  MF: { finish: "Machined", color: "Machined" },
  MG: { finish: "Satin Anthracite", color: "Anthracite" },
  MB: { finish: "Matte Black", color: "Black" },
  CH: { finish: "Chrome", color: "Chrome" },
  SL: { finish: "Silver", color: "Silver" },
};

// Best-effort PCD mapping for Dakar Forged off-road SKUs
function inferPcd(suffix: string): string | null {
  if (suffix.endsWith("139")) return "6x139.7";
  if (suffix.endsWith("127")) return "5x127";
  if (suffix.endsWith("150")) return "6x150";
  if (suffix.endsWith("114")) return "5x114.3";
  if (suffix.endsWith("120")) return "5x120";
  return null;
}

function parseSku(sku: string) {
  // DF-MODEL-DDWW-ETPCD-COLOR  (DD diameter, WW width*10, ET offset, PCD suffix)
  const m = sku.match(/^DF-([A-Z0-9]+)-(\d{2})(\d{2,3})-(\d{1,3})(\d{2,3})-([A-Z]{2})$/);
  if (!m) return null;
  const [, model, dd, ww, et, pcdNum, color] = m;
  const diameter = Number(dd);
  const width = Number(ww) / 10;
  const offset = Number(et);
  const pcd = inferPcd(pcdNum);
  const bolt = pcd ? Number(pcd.split("x")[0]) : null;
  const finishInfo = COLOR_MAP[color] ?? { finish: color, color };
  return { model, diameter, width, offset, pcd, bolt, ...finishInfo };
}

type Parsed = {
  name: string;
  image: string;
  detailUrl: string;
  sku: string;
};

function parseCards(markdown: string): Parsed[] {
  // Pattern: [![Name](image)](detail_url)  ... [View Details](detail_url_with_sku)
  const out: Parsed[] = [];
  const re =
    /\[!\[([^\]]+)\]\((https:\/\/[^\s)]+)\)\]\((https:\/\/www\.tunerstop\.com\/[^\s)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown))) {
    const name = m[1].trim();
    const image = m[2];
    const detailUrl = m[3];
    const sku = detailUrl.split("/").pop() ?? "";
    if (!sku.startsWith("DF-")) continue;
    // de-dupe by sku
    if (out.some((p) => p.sku === sku)) continue;
    out.push({ name, image, detailUrl, sku });
  }
  return out;
}

export const importDakarForgedRims = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .handler(async () => {
    const url =
      "https://www.tunerstop.com/wheelbrand/Dakar%20Forged?brand=Dakar%20Forged";

    // Get brand id
    const { data: brand, error: bErr } = await supabaseAdmin
      .from("rim_brands")
      .select("id, name, slug")
      .eq("slug", "dakar-forged")
      .maybeSingle();
    if (bErr) throw new Error(bErr.message);
    if (!brand) throw new Error("Rim brand 'dakar-forged' not found");

    // Scrape source page as markdown
    const res = await fetch(`${FIRECRAWL}/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fcKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        onlyMainContent: true,
        formats: ["markdown"],
      }),
    });
    if (!res.ok) {
      throw new Error(`Firecrawl scrape failed: ${res.status} ${await res.text()}`);
    }
    const json = (await res.json()) as {
      data?: { markdown?: string };
    };
    const md = json.data?.markdown ?? "";
    if (!md) throw new Error("No markdown returned from Firecrawl");

    const cards = parseCards(md);
    let inserted = 0;
    let updated = 0;
    const failures: { sku: string; error: string }[] = [];

    for (const c of cards) {
      try {
        const specs = parseSku(c.sku);
        const slug = slugify(`dakar-forged-${c.sku}`);
        const payload = {
          brand_id: brand.id,
          slug,
          name: `Dakar Forged ${c.name}`.replace(/\s+/g, " ").trim(),
          model: specs?.model
            ? specs.model.charAt(0) + specs.model.slice(1).toLowerCase()
            : null,
          diameter: specs?.diameter ?? 17,
          width: specs?.width ?? null,
          offset_mm: specs?.offset ?? null,
          pcd: specs?.pcd ?? null,
          bolt_count: specs?.bolt ?? null,
          finish: specs?.finish ?? null,
          color: specs?.color ?? null,
          construction: "Forged",
          country_of_origin: null,
          main_image: c.image,
          gallery_images: [c.image],
          in_stock: true,
        };

        const { data: existing } = await supabaseAdmin
          .from("rims")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        if (existing) {
          const { error } = await supabaseAdmin
            .from("rims")
            .update(payload)
            .eq("id", existing.id);
          if (error) throw new Error(error.message);
          updated++;
        } else {
          const { error } = await supabaseAdmin.from("rims").insert(payload);
          if (error) throw new Error(error.message);
          inserted++;
        }
      } catch (e) {
        failures.push({
          sku: c.sku,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    return {
      source: url,
      total: cards.length,
      inserted,
      updated,
      failed: failures.length,
      failures,
    };
  });
