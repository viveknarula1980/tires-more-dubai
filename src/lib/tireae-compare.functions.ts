import { createServerFn, createMiddleware } from "@tanstack/react-start";
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

export type TireAeListing = {
  itemId: string;
  name: string;
  price: number;
  size: string; // e.g. "235/40 R18"
  width: number;
  profile: number;
  rim: number;
  year: string | null;
  origin: string | null;
};

export type TireAeCompareRow = {
  id: string;
  slug: string;
  name: string;
  size: string;
  shopPrice: number;
  inStock: boolean;
  tireAeMin: number | null;
  tireAeMax: number | null;
  tireAeAvg: number | null;
  tireAeCount: number;
  diffVsMin: number | null; // shop - min (negative = we're cheaper)
  discountPctVsMin: number | null; // (min - shop)/min * 100
  matches: { name: string; price: number }[];
};

const SIZE_RE = /(\d{3})\/(\d{2})\s*R?(\d{2})/i;
const COMMERCIAL_SIZE_RE = /(\d{3,4})\s*R(\d{2})C?/i;

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Upgrade-Insecure-Requests": "1",
  "sec-ch-ua":
    '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "same-origin",
  "sec-fetch-user": "?1",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

const TIRE_AE_SITEMAP_URL = "https://www.tire.ae/sitemap_en.xml";

function cleanTireAeText(value: string): string {
  return value
    .replace(/\\\//g, "/")
    .replace(/\\u0026/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function listingKey(listing: TireAeListing): string {
  return `${listing.width}/${listing.profile}/${listing.rim}:${listing.name}`
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, "");
}

function addListing(
  listing: TireAeListing,
  seen: Set<string>,
  listings: TireAeListing[]
): boolean {
  const idKey = `id:${listing.itemId}`;
  const productKey = `product:${listingKey(listing)}`;
  if (seen.has(idKey) || seen.has(productKey)) return false;
  seen.add(idKey);
  seen.add(productKey);
  listings.push(listing);
  return true;
}

function parseTireSize(name: string): Pick<TireAeListing, "size" | "width" | "profile" | "rim"> | null {
  const standard = name.match(SIZE_RE);
  if (standard) {
    const width = Number(standard[1]);
    const profile = Number(standard[2]);
    const rim = Number(standard[3]);
    return { size: `${width}/${profile} R${rim}`, width, profile, rim };
  }

  const commercial = name.match(COMMERCIAL_SIZE_RE);
  if (commercial) {
    const width = Number(commercial[1]);
    const rim = Number(commercial[2]);
    return { size: `${width} R${rim}`, width, profile: 0, rim };
  }

  return null;
}

function extractYearOrigin(segment: string): { year: string | null; origin: string | null } {
  const y = segment.match(/"production_year"\s*:\s*"?([^",}]+)"?/);
  const o = segment.match(/"origin"\s*:\s*"([^"]*)"/);
  return {
    year: y ? cleanTireAeText(y[1]) || null : null,
    origin: o ? cleanTireAeText(o[1]) || null : null,
  };
}

function parseListingsFromHtml(
  html: string,
  seen: Set<string>,
  listings: TireAeListing[]
): number {
  const itemRe =
    /\{"item_name":"([^"]+)","affiliation":"[^"]*","item_id":"([^"]+)","price":([\d.]+)[^}]*\}/g;
  let m: RegExpExecArray | null;
  let foundOnPage = 0;
  while ((m = itemRe.exec(html)) !== null) {
    const rawName = cleanTireAeText(m[1]);
    const itemId = m[2];
    const price = Number(m[3]);
    const parsedSize = parseTireSize(rawName);
    if (!parsedSize) continue;
    const { year, origin } = extractYearOrigin(m[0]);
    const added = addListing({
      itemId,
      name: rawName,
      price,
      ...parsedSize,
      year,
      origin,
    }, seen, listings);
    if (added) foundOnPage++;
  }
  return foundOnPage;
}

function parseProductPageListing(html: string, fallbackUrl: string): TireAeListing | null {
  const itemMatch = html.match(
    /\{"item_name":"([^"]+)","affiliation":"[^"]*","item_id":"([^"]+)","price":([\d.]+)/
  );
  const skuMatch = html.match(/"sku"\s*:\s*"([^"]+)"/);
  const jsonLdPriceMatch = html.match(/"price"\s*:\s*"?([\d.]+)/);
  const nameMatch = html.match(/"name"\s*:\s*"([^"]+)"/);

  const rawName = itemMatch?.[1] ?? nameMatch?.[1] ?? fallbackUrl.split("/").pop() ?? "";
  const name = cleanTireAeText(rawName.replace(/-/g, " "));
  const parsedSize = parseTireSize(name);
  if (!parsedSize) return null;

  const price = Number(itemMatch?.[3] ?? jsonLdPriceMatch?.[1]);
  if (!Number.isFinite(price)) return null;

  const { year, origin } = extractYearOrigin(html);
  return {
    itemId: skuMatch?.[1] ?? itemMatch?.[2] ?? fallbackUrl,
    name,
    price,
    ...parsedSize,
    year,
    origin,
  };
}

async function fetchFreshHtml(url: string, headers: Record<string, string>): Promise<Response> {
  return fetch(url, {
    headers: {
      ...headers,
      "Cache-Control": "no-cache, no-store, max-age=0",
      Pragma: "no-cache",
    },
    cache: "no-store",
    redirect: "follow",
  });
}

async function fetchTireAeBrandFromSitemap(
  brandSlug: string,
  seen: Set<string>,
  listings: TireAeListing[]
): Promise<number> {
  const sitemapRes = await fetchFreshHtml(TIRE_AE_SITEMAP_URL, BROWSER_HEADERS);
  if (!sitemapRes.ok) return 0;

  const sitemap = await sitemapRes.text();
  const productUrls = Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g))
    .map((match) => cleanTireAeText(match[1]))
    .filter((url) => {
      try {
        const { pathname } = new URL(url);
        return (
          pathname.startsWith(`/en/${brandSlug}-`) &&
          /(\d{3}-\d{2}-r\d{2}|\d{3,4}-r\d{2})/i.test(pathname)
        );
      } catch {
        return false;
      }
    });

  let added = 0;
  const concurrency = 8;
  for (let index = 0; index < productUrls.length; index += concurrency) {
    const batch = productUrls.slice(index, index + concurrency);
    const results = await Promise.all(
      batch.map(async (url) => {
        try {
          const res = await fetchFreshHtml(url, {
            ...BROWSER_HEADERS,
            Referer: `https://www.tire.ae/en/tyres/${encodeURIComponent(brandSlug)}`,
          });
          if (!res.ok) return null;
          return parseProductPageListing(await res.text(), url);
        } catch {
          return null;
        }
      })
    );

    for (const listing of results) {
      if (listing && addListing(listing, seen, listings)) added++;
    }
  }

  return added;
}

async function fetchTireAeBrand(brandSlug: string): Promise<TireAeListing[]> {
  const base = `https://www.tire.ae/en/tyres/${encodeURIComponent(brandSlug)}`;
  const listings: TireAeListing[] = [];
  const seen = new Set<string>();

  // Fetch page 1 to seed the session and compute total pages.
  const firstRes = await fetchFreshHtml(base, BROWSER_HEADERS);
  if (!firstRes.ok) {
    throw new Error(`tire.ae returned ${firstRes.status} for ${brandSlug}`);
  }
  const firstHtml = await firstRes.text();
  parseListingsFromHtml(firstHtml, seen, listings);

  // Compute total pages from the "showing X of Y" toolbar.
  // e.g. <span class="toolbar-number">1</span> <span class="toolbar-number">12</span> <span class="toolbar-number">204</span>
  const nums = Array.from(
    firstHtml.matchAll(/toolbar-number">\s*(\d+)\s*</g)
  ).map((x) => Number(x[1]));
  let perPage = 12;
  let total = 0;
  if (nums.length >= 3) {
    perPage = Math.max(1, nums[1] - nums[0] + 1);
    total = nums[2];
  }
  // Also honor explicit ?p=N links if present.
  const maxPageFromLinks = Math.max(
    1,
    ...Array.from(firstHtml.matchAll(/[?&]p=(\d+)/g)).map((x) => Number(x[1]))
  );
  const totalPages = total > 0 ? Math.ceil(total / perPage) : maxPageFromLinks;

  const cookies = firstRes.headers
    .getSetCookie?.()
    ?.map((c) => c.split(";")[0])
    .join("; ");

  for (let page = 2; page <= Math.max(totalPages, 1); page++) {
    const url = `${base}?p=${page}`;
    let res: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      res = await fetch(url, {
        headers: {
          ...BROWSER_HEADERS,
          "Cache-Control": "no-cache, no-store, max-age=0",
          Pragma: "no-cache",
          Referer: page === 2 ? base : `${base}?p=${page - 1}`,
          ...(cookies ? { Cookie: cookies } : {}),
        },
        cache: "no-store",
        redirect: "follow",
      });
      if (res.ok) break;
      // brief backoff on CF challenges
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
    if (!res || !res.ok) {
      // Skip this page but keep going; other pages may still succeed.
      continue;
    }
    const html = await res.text();
    const found = parseListingsFromHtml(html, seen, listings);
    if (found === 0 && page > totalPages / 2) break;
  }

  // tire.ae blocks direct pagination in some server environments. The sitemap
  // exposes the product detail URLs, so use it as a fresh fallback to collect
  // every product under the brand instead of returning only page 1.
  await fetchTireAeBrandFromSitemap(brandSlug, seen, listings);

  return listings;
}

export const compareBrandWithTireAe = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { brandSlug: string }) => {
    if (!input?.brandSlug || typeof input.brandSlug !== "string") {
      throw new Error("brandSlug is required");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const brandSlug = data.brandSlug.trim().toLowerCase();

    const { data: brand, error: brandErr } = await supabaseAdmin
      .from("brands")
      .select("id, name, slug")
      .eq("slug", brandSlug)
      .maybeSingle();
    if (brandErr) throw new Error(brandErr.message);
    if (!brand) throw new Error(`Brand not found: ${brandSlug}`);

    const { data: tires, error: tiresErr } = await supabaseAdmin
      .from("tires")
      .select("id, slug, name, width, profile, rim, price_aed, in_stock")
      .eq("brand_id", brand.id)
      .order("width")
      .order("profile")
      .order("rim");
    if (tiresErr) throw new Error(tiresErr.message);

    let listings: TireAeListing[] = [];
    let scrapeError: string | null = null;
    try {
      listings = await fetchTireAeBrand(brandSlug);
    } catch (e) {
      scrapeError = e instanceof Error ? e.message : String(e);
    }

    // Group by "w/p Rr"
    const bySize = new Map<string, TireAeListing[]>();
    for (const l of listings) {
      const key = `${l.width}/${l.profile}/${l.rim}`;
      const arr = bySize.get(key) ?? [];
      arr.push(l);
      bySize.set(key, arr);
    }

    const rows: TireAeCompareRow[] = (tires ?? []).map((t) => {
      const key = `${t.width}/${t.profile}/${t.rim}`;
      const matches = bySize.get(key) ?? [];
      const prices = matches.map((m) => m.price).filter((p) => Number.isFinite(p));
      const min = prices.length ? Math.min(...prices) : null;
      const max = prices.length ? Math.max(...prices) : null;
      const avg = prices.length ? prices.reduce((s, p) => s + p, 0) / prices.length : null;
      const shop = Number(t.price_aed);
      return {
        id: t.id,
        slug: t.slug,
        name: t.name,
        size: `${t.width}/${t.profile} R${t.rim}`,
        shopPrice: shop,
        inStock: t.in_stock,
        tireAeMin: min,
        tireAeMax: max,
        tireAeAvg: avg,
        tireAeCount: matches.length,
        diffVsMin: min != null ? shop - min : null,
        discountPctVsMin: min != null && min > 0 ? ((min - shop) / min) * 100 : null,
        matches: matches.map((m) => ({ name: m.name, price: m.price })),
      };
    });

    return {
      brand: { name: brand.name, slug: brand.slug },
      tireAeCount: listings.length,
      rows,
      scrapeError,
    };
  });

function csvEscape(v: string | number | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const exportTireAeCsvForBrand = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { brandSlug: string }) => {
    if (!input?.brandSlug || typeof input.brandSlug !== "string") {
      throw new Error("brandSlug is required");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const brandSlug = data.brandSlug.trim().toLowerCase();

    const { data: brand, error: brandErr } = await supabaseAdmin
      .from("brands")
      .select("name, slug")
      .eq("slug", brandSlug)
      .maybeSingle();
    if (brandErr) throw new Error(brandErr.message);
    if (!brand) throw new Error(`Brand not found: ${brandSlug}`);

    const header = [
      "brand_slug",
      "brand_name",
      "tireae_item_id",
      "tireae_name",
      "price_aed",
      "size",
      "width",
      "profile",
      "rim",
    ];
    const lines: string[] = [header.join(",")];
    let total = 0;

    const listings = await fetchTireAeBrand(brand.slug);
    for (const l of listings) {
      total++;
      lines.push(
        [
          brand.slug,
          brand.name,
          l.itemId,
          l.name,
          l.price,
          l.size,
          l.width,
          l.profile,
          l.rim,
        ]
          .map(csvEscape)
          .join(",")
      );
    }

    return { csv: lines.join("\n"), total, brand: brand.name };
  });

export const exportTireAeCsv = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .handler(async () => {
    const { data: brands, error: brandsErr } = await supabaseAdmin
      .from("brands")
      .select("name, slug")
      .order("name");
    if (brandsErr) throw new Error(brandsErr.message);

    const header = [
      "brand_slug",
      "brand_name",
      "tireae_item_id",
      "tireae_name",
      "price_aed",
      "size",
      "width",
      "profile",
      "rim",
    ];
    const lines: string[] = [header.join(",")];
    const errors: { brand: string; error: string }[] = [];
    let total = 0;

    for (const b of brands ?? []) {
      try {
        const listings = await fetchTireAeBrand(b.slug);
        for (const l of listings) {
          total++;
          lines.push(
            [
              b.slug,
              b.name,
              l.itemId,
              l.name,
              l.price,
              l.size,
              l.width,
              l.profile,
              l.rim,
            ]
              .map(csvEscape)
              .join(",")
          );
        }
      } catch (e) {
        errors.push({ brand: b.slug, error: e instanceof Error ? e.message : String(e) });
      }
    }

    return { csv: lines.join("\n"), total, brandCount: brands?.length ?? 0, errors };
  });
