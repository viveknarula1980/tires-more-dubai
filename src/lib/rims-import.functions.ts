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

// ---------- KMC Wheels (kmcwheels.com) ----------

type KmcCard = {
  name: string;
  image: string;
  detailUrl: string;
  slugSuffix: string; // e.g. "kmc-archer"
};

function parseKmcCards(markdown: string): KmcCard[] {
  const out: KmcCard[] = [];
  const re =
    /\[!\[([^\]]+)\]\((https:\/\/www\.kmcwheels\.com\/media\/[^\s)]+)\)\]\((https:\/\/www\.kmcwheels\.com\/[a-z0-9-]+)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown))) {
    const name = m[1].trim();
    const image = m[2];
    const detailUrl = m[3];
    const slugSuffix = detailUrl.split("/").pop() ?? "";
    if (!slugSuffix || slugSuffix === "all-wheels") continue;
    if (out.some((p) => p.slugSuffix === slugSuffix)) continue;
    out.push({ name, image, detailUrl, slugSuffix });
  }
  return out;
}

// Pull all "NN\"" diameters appearing in the small text block after a card
function extractDiametersAfter(md: string, anchor: string): number[] {
  const idx = md.indexOf(anchor);
  if (idx < 0) return [];
  const slice = md.slice(idx, idx + 800);
  const diams = new Set<number>();
  const re = /\b(\d{2})"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(slice))) {
    const n = Number(m[1]);
    if (n >= 14 && n <= 26) diams.add(n);
  }
  return Array.from(diams).sort((a, b) => a - b);
}

function parseKmcImage(imageUrl: string) {
  // Examples seen:
  //   kmc-km732-archer-17x8-5-6-et0-gloss-anthracite-a1-png.png
  //   km708-17x8-et38-bronze_a1-png.png
  //   km719-17x85-et35-5-black-gray_a1-png.png
  //   km5476-6lug-17x9-et-12-matte-bronze-w-blk-lip-a1-png.png
  //   km234-17x85-et0-8lug-black_a1-png.png
  const file = imageUrl.split("/").pop()?.toLowerCase() ?? "";
  const base = file.replace(/\.(png|jpe?g|webp)$/i, "");

  let diameter: number | null = null;
  let width: number | null = null;
  // diameter x width — width may be "8", "85" (=>8.5) or "8-5"
  const size =
    base.match(/(\d{2})x(\d)-(\d)/) ||
    base.match(/(\d{2})x(\d{2})\b/) ||
    base.match(/(\d{2})x(\d)\b/);
  if (size) {
    diameter = Number(size[1]);
    if (size.length === 4) {
      width = Number(`${size[2]}.${size[3]}`);
    } else {
      const w = size[2];
      width = w.length === 2 ? Number(w) / 10 : Number(w);
    }
  }

  let offset: number | null = null;
  const et = base.match(/et-?(\d{1,3})/);
  if (et) {
    // "et-12" means negative, "et0" / "et38" positive
    const neg = /et-\d/.test(base);
    offset = neg ? -Number(et[1]) : Number(et[1]);
  }

  let bolt: number | null = null;
  const blug = base.match(/(\d)lug/) || base.match(/-(\d)-et/);
  if (blug) bolt = Number(blug[1]);

  // Finish keyword extraction
  const FINISH_KEYS: { key: RegExp; finish: string; color: string }[] = [
    { key: /matte-bronze/, finish: "Matte Bronze", color: "Bronze" },
    { key: /matte-black/, finish: "Matte Black", color: "Black" },
    { key: /satin-black/, finish: "Satin Black", color: "Black" },
    { key: /gloss-black/, finish: "Gloss Black", color: "Black" },
    { key: /textured-black/, finish: "Textured Black", color: "Black" },
    { key: /gloss-anthracite/, finish: "Gloss Anthracite", color: "Anthracite" },
    { key: /satin-anthracite/, finish: "Satin Anthracite", color: "Anthracite" },
    { key: /gloss-gunmetal/, finish: "Gloss Gunmetal", color: "Gunmetal" },
    { key: /candy-red/, finish: "Candy Red", color: "Red" },
    { key: /bronze/, finish: "Bronze", color: "Bronze" },
    { key: /gloss-silver/, finish: "Gloss Silver", color: "Silver" },
    { key: /silver/, finish: "Silver", color: "Silver" },
    { key: /machined/, finish: "Machined", color: "Machined" },
    { key: /blackout|black\b/, finish: "Black", color: "Black" },
  ];
  let finish: string | null = null;
  let color: string | null = null;
  for (const f of FINISH_KEYS) {
    if (f.key.test(base)) {
      finish = f.finish;
      color = f.color;
      break;
    }
  }

  return { diameter, width, offset, bolt, finish, color };
}

export const importKmcWheels = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .handler(async () => {
    const url = "https://www.kmcwheels.com/wheels/all-wheels";

    const { data: brand, error: bErr } = await supabaseAdmin
      .from("rim_brands")
      .select("id, name, slug")
      .eq("slug", "kmc")
      .maybeSingle();
    if (bErr) throw new Error(bErr.message);
    if (!brand) throw new Error("Rim brand 'kmc' not found");

    // KMC's listing renders all 40 wheels on one page (?p=48).
    const scrapeUrl = `${url}?product_list_limit=48`;
    const res = await fetch(`${FIRECRAWL}/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fcKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: scrapeUrl,
        onlyMainContent: true,
        formats: ["markdown"],
      }),
    });
    if (!res.ok) {
      throw new Error(`Firecrawl scrape failed: ${res.status} ${await res.text()}`);
    }
    const json = (await res.json()) as { data?: { markdown?: string } };
    const md = json.data?.markdown ?? "";
    if (!md) throw new Error("No markdown returned from Firecrawl");

    const cards = parseKmcCards(md);
    let inserted = 0;
    let updated = 0;
    const failures: { sku: string; error: string }[] = [];

    for (const c of cards) {
      try {
        const specs = parseKmcImage(c.image);
        const diameters = extractDiametersAfter(md, `](${c.detailUrl})`);
        const diameter = specs.diameter ?? diameters[0] ?? 17;
        const slug = slugify(c.slugSuffix); // e.g. "kmc-archer"
        const fitment =
          diameters.length > 1
            ? `Also available in ${diameters.map((d) => `${d}"`).join(", ")}.`
            : null;

        const payload = {
          brand_id: brand.id,
          slug,
          name: `KMC ${c.name}`.replace(/\s+/g, " ").trim(),
          model: c.name
            .toLowerCase()
            .split(/\s+/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          diameter,
          width: specs.width,
          offset_mm: specs.offset,
          pcd: null,
          bolt_count: specs.bolt,
          finish: specs.finish,
          color: specs.color,
          construction: "Cast Aluminum",
          country_of_origin: null,
          fitment_notes: fitment,
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
          sku: c.slugSuffix,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    return {
      source: scrapeUrl,
      total: cards.length,
      inserted,
      updated,
      failed: failures.length,
      failures,
    };
  });
