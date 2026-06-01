import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SlidersHorizontal, X, MessageCircle } from "lucide-react";
import { getRimBrands, searchRims } from "@/lib/rims.functions";
import { BrandLogo } from "@/components/BrandLogo";

type RimsSearch = {
  brand: string;
  diameter: number;
  width: number;
  finish: string;
  sort: "featured" | "name" | "diameter_asc" | "diameter_desc";
};

export const Route = createFileRoute("/rims/")({
  validateSearch: (s: Record<string, unknown>): RimsSearch => ({
    brand: typeof s.brand === "string" ? s.brand : "",
    diameter: Number(s.diameter) || 0,
    width: Number(s.width) || 0,
    finish: typeof s.finish === "string" ? s.finish : "",
    sort: (s.sort === "name" || s.sort === "diameter_asc" || s.sort === "diameter_desc")
      ? s.sort : "featured",
  }),
  head: () => ({
    meta: [
      { title: "Shop Rims & Alloy Wheels in Dubai — Tires & More UAE" },
      { name: "description", content: "Premium rims from KMC, RRW, Dakar Forged and Baja Rim. Off-road, luxury and performance wheels — request a quote or chat on WhatsApp." },
      { property: "og:title", content: "Shop Rims & Alloy Wheels — Tires & More UAE" },
      { property: "og:description", content: "Premium off-road, forged and performance rims. Quote on request." },
      { property: "og:url", content: "/rims" },
    ],
    links: [{ rel: "canonical", href: "/rims" }],
  }),
  component: RimsPage,
});

const FINISHES = ["Black", "Bronze", "Silver", "Polished", "Chrome", "Anthracite"];

function RimsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/rims/" });
  const fetchRims = useServerFn(searchRims);
  const fetchBrands = useServerFn(getRimBrands);

  const filters = useMemo(() => {
    const f: Record<string, unknown> = { sort: search.sort };
    if (search.brand) f.brand = search.brand;
    if (search.diameter) f.diameter = search.diameter;
    if (search.width) f.width = search.width;
    if (search.finish) f.finish = search.finish;
    return f;
  }, [search]);

  const rimsQ = useQuery({ queryKey: ["rims", filters], queryFn: () => fetchRims({ data: filters as never }) });
  const brandsQ = useQuery({ queryKey: ["rim-brands"], queryFn: () => fetchBrands() });

  function update(patch: Partial<RimsSearch>) {
    navigate({ search: (prev: RimsSearch) => ({ ...prev, ...patch }) });
  }

  const activeCount =
    (search.brand ? 1 : 0) + (search.diameter ? 1 : 0) +
    (search.width ? 1 : 0) + (search.finish ? 1 : 0);

  return (
    <div className="container mx-auto px-4 py-8 pb-40">
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Shop Rims & Alloy Wheels</h1>
          <p className="mt-2 text-muted-foreground">
            {rimsQ.data ? `${rimsQ.data.length} rims available` : "Loading…"} · Quote on request · Free fitment consultation
          </p>
        </div>
        <label className="text-sm flex items-center gap-2">
          <span className="text-muted-foreground">Sort:</span>
          <select value={search.sort} onChange={(e) => update({ sort: e.target.value as RimsSearch["sort"] })} className="filter-select py-1.5 border border-border rounded-md bg-background px-3">
            <option value="featured">Featured</option>
            <option value="name">Name</option>
            <option value="diameter_asc">Diameter: Small → Large</option>
            <option value="diameter_desc">Diameter: Large → Small</option>
          </select>
        </label>
      </div>

      <section>
        {rimsQ.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : rimsQ.data && rimsQ.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rimsQ.data.map((r) => <RimCard key={(r as { id: string }).id} r={r as RimItem} />)}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <p className="font-semibold">No rims match these filters</p>
            <p className="text-sm text-muted-foreground mt-1">Try clearing some filters or contact us — we can source custom fitments.</p>
            <button onClick={() => navigate({ search: { sort: search.sort } as RimsSearch })} className="mt-4 text-brand font-semibold hover:underline">Reset filters</button>
          </div>
        )}
      </section>

      {/* Sticky filter bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-navy text-navy-foreground border-t-2 border-brand shadow-[0_-12px_40px_-10px_rgba(0,0,0,0.45)]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
            <div className="hidden md:flex items-center gap-2 shrink-0 pr-3 border-r border-white/25">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Filters {activeCount > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded">({activeCount})</span>}
              </span>
            </div>

            <select value={search.brand} onChange={(e) => update({ brand: e.target.value })} className="bg-white text-navy text-sm font-semibold rounded-md border-0 py-2 px-3 flex-1 min-w-[140px]">
              <option value="">All brands</option>
              {brandsQ.data?.map((b) => (
                <option key={(b as { slug: string }).slug} value={(b as { slug: string }).slug}>
                  {(b as { name: string }).name}
                </option>
              ))}
            </select>

            <select value={search.diameter || ""} onChange={(e) => update({ diameter: Number(e.target.value) || 0 })} className="bg-white text-navy text-sm font-semibold rounded-md border-0 py-2 px-3 flex-1 min-w-[130px]">
              <option value="">Diameter</option>
              {[15, 16, 17, 18, 19, 20, 21, 22, 24].map((d) => (
                <option key={d} value={d}>{d}"</option>
              ))}
            </select>

            <select value={search.width || ""} onChange={(e) => update({ width: Number(e.target.value) || 0 })} className="bg-white text-navy text-sm font-semibold rounded-md border-0 py-2 px-3 flex-1 min-w-[130px]">
              <option value="">Width</option>
              {[7, 7.5, 8, 8.5, 9, 9.5, 10, 11, 12].map((w) => (
                <option key={w} value={w}>{w}J</option>
              ))}
            </select>

            <select value={search.finish} onChange={(e) => update({ finish: e.target.value })} className="bg-white text-navy text-sm font-semibold rounded-md border-0 py-2 px-3 flex-1 min-w-[130px]">
              <option value="">Finish / Color</option>
              {FINISHES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>

            {activeCount > 0 && (
              <button
                onClick={() => navigate({ search: { sort: search.sort } as RimsSearch })}
                className="shrink-0 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-white/90 hover:text-white hover:bg-white/15 rounded-md px-3 py-2"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type RimItem = {
  id: string;
  slug: string;
  name: string;
  diameter: number;
  width: number | null;
  offset_mm: number | null;
  pcd: string | null;
  color: string | null;
  construction: string | null;
  main_image: string | null;
  brand: { name: string; slug: string; logo_url: string | null } | null;
};

function RimCard({ r }: { r: RimItem }) {
  const wa = `https://wa.me/97142326666?text=${encodeURIComponent(`Hi, I'd like a price for the ${r.name}.`)}`;
  return (
    <article className="group flex flex-col rounded-xl border border-border bg-background overflow-hidden hover:border-brand transition-colors">
      <Link to="/rims/$slug" params={{ slug: r.slug }} className="block aspect-square bg-muted/40 p-6 flex items-center justify-center">
        <img
          src={r.main_image ?? "/rim-default.svg"}
          alt={r.name}
          loading="lazy"
          className="h-[90%] w-[90%] object-contain transition-transform group-hover:scale-105"
        />
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-1">
            <h3 className="font-bold text-base leading-tight">
              <Link to="/rims/$slug" params={{ slug: r.slug }} className="hover:text-brand">{r.name}</Link>
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-muted-foreground">
              <span className="bg-muted px-2 py-0.5 rounded">{r.diameter}"</span>
              {r.width && <span className="bg-muted px-2 py-0.5 rounded">{r.width}J</span>}
              {r.pcd && <span className="bg-muted px-2 py-0.5 rounded">{r.pcd}</span>}
              {r.color && <span className="bg-muted px-2 py-0.5 rounded">{r.color}</span>}
            </div>
          </div>
          {r.brand?.name && (
            <div className="h-8 w-28 flex-shrink-0 flex items-center">
              <BrandLogo
                name={r.brand.name}
                logoUrl={r.brand.logo_url}
                className="h-full w-full bg-transparent"
                textClassName="text-sm"
              />
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border">
          <Link
            to="/rims/$slug" params={{ slug: r.slug }}
            className="flex-1 inline-flex items-center justify-center rounded-md bg-brand text-brand-foreground text-xs font-bold py-2.5 uppercase tracking-wide hover:opacity-90"
          >
            Request Price
          </Link>
          <a
            href={wa} target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-[#25D366] text-white px-3 py-2.5 hover:opacity-90"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
