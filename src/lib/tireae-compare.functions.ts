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
};

function parseListingsFromHtml(
  html: string,
  seen: Set<string>,
  listings: TireAeListing[]
): number {
  const itemRe =
    /\{"item_name":"([^"]+)","affiliation":"[^"]*","item_id":"([^"]+)","price":([\d.]+)/g;
  let m: RegExpExecArray | null;
  let foundOnPage = 0;
  while ((m = itemRe.exec(html)) !== null) {
    const rawName = m[1].replace(/\\\//g, "/");
    const itemId = m[2];
    const price = Number(m[3]);
    if (seen.has(itemId)) continue;
    const sm = rawName.match(SIZE_RE);
    if (!sm) continue;
    const width = Number(sm[1]);
    const profile = Number(sm[2]);
    const rim = Number(sm[3]);
    seen.add(itemId);
    foundOnPage++;
    listings.push({
      itemId,
      name: rawName,
      price,
      size: `${width}/${profile} R${rim}`,
      width,
      profile,
      rim,
    });
  }
  return foundOnPage;
}

async function fetchTireAeBrand(brandSlug: string): Promise<TireAeListing[]> {
  const base = `https://www.tire.ae/en/tyres/${encodeURIComponent(brandSlug)}`;
  const listings: TireAeListing[] = [];
  const seen = new Set<string>();

  // Fetch page 1 to seed the session and compute total pages.
  const firstRes = await fetch(base, { headers: BROWSER_HEADERS, redirect: "follow" });
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
          Referer: page === 2 ? base : `${base}?p=${page - 1}`,
          ...(cookies ? { Cookie: cookies } : {}),
        },
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
