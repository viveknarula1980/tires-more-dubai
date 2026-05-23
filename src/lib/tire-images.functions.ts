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
const BUCKET = "tire-images";

function fcKey() {
  const k = process.env.FIRECRAWL_API_KEY;
  if (!k) throw new Error("FIRECRAWL_API_KEY is not configured");
  return k;
}

const productListSchema = {
  type: "object",
  properties: {
    products: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          image_url: { type: "string" },
        },
        required: ["name", "image_url"],
      },
    },
  },
  required: ["products"],
};

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(s: string) {
  return normalize(s).split(" ").filter((t) => t.length > 1);
}

// Score = fraction of model tokens found in scraped product name
function matchScore(modelOrName: string, productName: string): number {
  const a = tokens(modelOrName);
  const b = new Set(tokens(productName));
  if (!a.length) return 0;
  const hits = a.filter((t) => b.has(t)).length;
  return hits / a.length;
}

async function downloadAndUpload(
  imageUrl: string,
  brandSlug: string,
  tireSlug: string
): Promise<string> {
  const res = await fetch(imageUrl, {
    headers: { "User-Agent": "Mozilla/5.0 TiresAndMore-ImageSync/1.0" },
  });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const ext =
    contentType.includes("png") ? "png" :
    contentType.includes("webp") ? "webp" :
    contentType.includes("svg") ? "svg" : "jpg";
  const buf = new Uint8Array(await res.arrayBuffer());
  const path = `${brandSlug}/${tireSlug}.${ext}`;
  const { error: upErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buf, { contentType, upsert: true });
  if (upErr) throw new Error(`upload: ${upErr.message}`);
  const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return pub.publicUrl;
}

export const syncTireImages = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((d: { brandSlug: string; sourceUrl: string; onlyMissing?: boolean }) =>
    z
      .object({
        brandSlug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
        sourceUrl: z.string().url().max(500),
        onlyMissing: z.boolean().optional(),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    const { data: brand, error: bErr } = await supabaseAdmin
      .from("brands")
      .select("id, name, slug")
      .eq("slug", data.brandSlug)
      .maybeSingle();
    if (bErr) throw new Error(bErr.message);
    if (!brand) throw new Error(`Brand not found: ${data.brandSlug}`);

    let tireQuery = supabaseAdmin
      .from("tires")
      .select("id, slug, name, model, main_image")
      .eq("brand_id", brand.id);
    if (data.onlyMissing) tireQuery = tireQuery.is("main_image", null);
    const { data: tires, error: tErr } = await tireQuery;
    if (tErr) throw new Error(tErr.message);
    if (!tires || tires.length === 0) {
      return { scrapedCount: 0, results: [], message: "No tires to update for this brand." };
    }

    // Scrape source URL for product list (LLM-extracted)
    const scrapeRes = await fetch(`${FIRECRAWL}/scrape`, {
      method: "POST",
      headers: { Authorization: `Bearer ${fcKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        url: data.sourceUrl,
        onlyMainContent: false,
        formats: [
          {
            type: "json",
            schema: productListSchema,
            prompt:
              `Extract every distinct ${brand.name} tire product/model shown on this page. ` +
              `For each one return: name (the product/model name, e.g. "Turanza T005", "Potenza Sport") ` +
              `and image_url (absolute URL to the main product/hero image of that tire). ` +
              `Resolve relative image paths to absolute URLs. Only include real tire products with a visible image.`,
          },
        ],
      }),
    });
    if (!scrapeRes.ok) {
      throw new Error(`scrape ${scrapeRes.status}: ${await scrapeRes.text()}`);
    }
    const scraped = (await scrapeRes.json()) as {
      success: boolean;
      data?: { json?: { products?: Array<{ name: string; image_url: string }> } };
    };
    const products = (scraped.data?.json?.products ?? []).filter(
      (p) => p?.name && p?.image_url
    );

    type Outcome = {
      tireSlug: string;
      tireName: string;
      ok: boolean;
      matchedProduct?: string;
      score?: number;
      imageUrl?: string;
      error?: string;
      skipped?: boolean;
    };
    const results: Outcome[] = [];

    for (const tire of tires) {
      const candidate = tire.model || tire.name;
      let best: { p: { name: string; image_url: string }; score: number } | null = null;
      for (const p of products) {
        const score = matchScore(candidate, p.name);
        if (!best || score > best.score) best = { p, score };
      }
      if (!best || best.score < 0.6) {
        results.push({
          tireSlug: tire.slug,
          tireName: tire.name,
          ok: false,
          skipped: true,
          error: best
            ? `no good match (best: "${best.p.name}" ${(best.score * 100).toFixed(0)}%)`
            : "no products scraped",
          score: best?.score,
        });
        continue;
      }
      try {
        const publicUrl = await downloadAndUpload(best.p.image_url, brand.slug, tire.slug);
        const { error: updErr } = await supabaseAdmin
          .from("tires")
          .update({ main_image: publicUrl })
          .eq("id", tire.id);
        if (updErr) throw new Error(updErr.message);
        results.push({
          tireSlug: tire.slug,
          tireName: tire.name,
          ok: true,
          matchedProduct: best.p.name,
          score: best.score,
          imageUrl: publicUrl,
        });
      } catch (e) {
        results.push({
          tireSlug: tire.slug,
          tireName: tire.name,
          ok: false,
          matchedProduct: best.p.name,
          score: best.score,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    return { scrapedCount: products.length, results };
  });
