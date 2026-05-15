import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FIRECRAWL = "https://api.firecrawl.dev/v2";
const PITSTOP_BRAND_BASE = "https://www.pitstoparabia.com/en/tyres/brands";
const DISCOUNT = 0.15; // 15% off scraped price

function fcKey() {
  const k = process.env.FIRECRAWL_API_KEY;
  if (!k) throw new Error("FIRECRAWL_API_KEY is not configured");
  return k;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const variantSchema = {
  type: "object",
  properties: {
    model: { type: "string" },
    variants: {
      type: "array",
      items: {
        type: "object",
        properties: {
          size: { type: "string" },
          width: { type: "number" },
          profile: { type: "number" },
          rim: { type: "number" },
          load_index: { type: "string" },
          speed_rating: { type: "string" },
          price_aed: { type: "number" },
          name: { type: "string" },
        },
        required: ["width", "profile", "rim", "price_aed", "name"],
      },
    },
  },
  required: ["model", "variants"],
};

export const discoverBrandModelUrls = createServerFn({ method: "POST" })
  .inputValidator((d: { brandSlug: string }) =>
    z.object({ brandSlug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/) }).parse(d)
  )
  .handler(async ({ data }) => {
    const url = `${PITSTOP_BRAND_BASE}/${data.brandSlug}`;
    const res = await fetch(`${FIRECRAWL}/map`, {
      method: "POST",
      headers: { Authorization: `Bearer ${fcKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, limit: 200 }),
    });
    if (!res.ok) throw new Error(`Firecrawl map failed: ${res.status} ${await res.text()}`);
    const json = (await res.json()) as { success: boolean; links?: Array<{ url: string }> };
    const prefix = `${url}/`;
    const modelUrls = (json.links ?? [])
      .map((l) => l.url)
      .filter((u) => u.startsWith(prefix) && u.replace(prefix, "").split("/").length === 1)
      .filter((u) => !u.endsWith("/"));
    return { urls: Array.from(new Set(modelUrls)) };
  });

type ImportResult = {
  url: string;
  ok: boolean;
  inserted: number;
  updated: number;
  error?: string;
};

export const importBrandBatch = createServerFn({ method: "POST" })
  .inputValidator((d: { brandSlug: string; urls: string[] }) =>
    z
      .object({
        brandSlug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
        urls: z.array(z.string().url()).min(1).max(8),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    const { data: brand, error: brandErr } = await supabaseAdmin
      .from("brands")
      .select("id, name, slug")
      .eq("slug", data.brandSlug)
      .maybeSingle();
    if (brandErr) throw new Error(brandErr.message);
    if (!brand) throw new Error(`Brand not found: ${data.brandSlug}`);

    const results: ImportResult[] = [];

    for (const url of data.urls) {
      const r: ImportResult = { url, ok: false, inserted: 0, updated: 0 };
      try {
        const scrapeRes = await fetch(`${FIRECRAWL}/scrape`, {
          method: "POST",
          headers: { Authorization: `Bearer ${fcKey()}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            onlyMainContent: true,
            formats: [
              {
                type: "json",
                schema: variantSchema,
                prompt:
                  "Extract every tire size variant listed on this page. For each: size (e.g. 225/45R18), width, profile, rim (numbers), load_index, speed_rating, price_aed (numeric AED price after stripping currency), and full name including model and size.",
              },
            ],
          }),
        });
        if (!scrapeRes.ok) throw new Error(`scrape ${scrapeRes.status}: ${await scrapeRes.text()}`);
        const scraped = (await scrapeRes.json()) as {
          success: boolean;
          data?: { json?: { model?: string; variants?: Array<Record<string, unknown>> } };
        };
        const model = scraped.data?.json?.model?.trim() || "";
        const variants = scraped.data?.json?.variants ?? [];
        if (!variants.length) {
          r.ok = true;
          results.push(r);
          continue;
        }

        for (const v of variants) {
          const width = Number(v.width);
          const profile = Number(v.profile);
          const rim = Number(v.rim);
          const scrapedPrice = Number(v.price_aed);
          if (!width || !profile || !rim || !scrapedPrice) continue;

          const finalPrice = Math.round(scrapedPrice * (1 - DISCOUNT) * 100) / 100;
          const modelClean = (model || "").replace(/^continental\s+/i, "").trim();
          const baseName =
            (v.name as string | undefined)?.trim() ||
            `${brand.name} ${modelClean} ${width}/${profile} R${rim}`.trim();
          const slug = slugify(`${brand.slug}-${modelClean}-${width}-${profile}-${rim}`);

          // Try update by slug
          const { data: existing } = await supabaseAdmin
            .from("tires")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();

          const payload = {
            brand_id: brand.id,
            slug,
            name: baseName,
            model: modelClean || null,
            width,
            profile,
            rim,
            load_index: (v.load_index as string | undefined) ?? null,
            speed_rating: (v.speed_rating as string | undefined) ?? null,
            price_aed: finalPrice,
            original_price_aed: scrapedPrice,
            in_stock: true,
          };

          if (existing) {
            const { error } = await supabaseAdmin
              .from("tires")
              .update({
                price_aed: payload.price_aed,
                original_price_aed: payload.original_price_aed,
                load_index: payload.load_index,
                speed_rating: payload.speed_rating,
                name: payload.name,
                model: payload.model,
              })
              .eq("id", existing.id);
            if (error) throw new Error(error.message);
            r.updated++;
          } else {
            const { error } = await supabaseAdmin.from("tires").insert(payload);
            if (error) throw new Error(error.message);
            r.inserted++;
          }
        }
        r.ok = true;
      } catch (e) {
        r.error = e instanceof Error ? e.message : String(e);
      }
      results.push(r);
    }

    return { results };
  });
