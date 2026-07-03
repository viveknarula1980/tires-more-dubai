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

async function fetchTireAeBrand(brandSlug: string): Promise<TireAeListing[]> {
  const base = `https://www.tire.ae/en/tyres/${encodeURIComponent(brandSlug)}`;
  const listings: TireAeListing[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= 20; page++) {
    const url = page === 1 ? base : `${base}?p=${page}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PriceCompareBot/1.0)" },
      redirect: "follow",
    });
    if (!res.ok) break;
    const html = await res.text();

    // dl4Objects contains a GA4 items array with item_id, item_name, price, item_brand.
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

    // Detect if there's a next page. The pager has ?p=N links.
    const maxPage = Math.max(
      1,
      ...Array.from(html.matchAll(/\?p=(\d+)/g)).map((x) => Number(x[1]))
    );
    if (page >= maxPage) break;
    if (foundOnPage === 0) break;
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
