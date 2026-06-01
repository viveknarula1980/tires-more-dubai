import { createFileRoute, Link, useRouter, useNavigate, notFound } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { getBrandBySlug, searchTires } from "@/lib/catalog.functions";
import { BrandLogo } from "@/components/BrandLogo";
import { TireCard } from "@/components/TireCard";

type BrandSearch = {
  vehicle_type: "" | "passenger" | "suv";
  season: "" | "summer" | "all-season" | "winter";
  width: number;
  profile: number;
  rim: number;
  sort: "featured" | "price_asc" | "price_desc" | "name";
};

const fetchBrandFilterMeta = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const all = await searchTires({ data: { brand: data.slug, limit: 100 } as any });
    const widths = Array.from(new Set(all.map((t: any) => t.width))).sort((a, b) => a - b);
    const profiles = Array.from(new Set(all.map((t: any) => t.profile))).sort((a, b) => a - b);
    const rims = Array.from(new Set(all.map((t: any) => t.rim))).sort((a, b) => a - b);
    return { widths, profiles, rims };
  });

export const Route = createFileRoute("/brands/$slug")({
  validateSearch: (s: Record<string, unknown>): BrandSearch => ({
    vehicle_type: (s.vehicle_type === "passenger" || s.vehicle_type === "suv") ? s.vehicle_type : "",
    season: (s.season === "summer" || s.season === "all-season" || s.season === "winter") ? s.season : "",
    width: Number(s.width) || 0,
    profile: Number(s.profile) || 0,
    rim: Number(s.rim) || 0,
    sort: (s.sort === "price_asc" || s.sort === "price_desc" || s.sort === "name") ? s.sort : "featured",
  }),
  loader: async ({ params }) => {
    const brand = await getBrandBySlug({ data: { slug: params.slug } });
    if (!brand) throw notFound();
    return { brand };
  },
  head: ({ loaderData, params }) => {
    const b = loaderData?.brand;
    const title = b ? `${b.name} Tyres in Dubai — Tires & More UAE` : "Brand — Tires & More UAE";
    const desc = b?.description ?? `Shop ${b?.name ?? ""} tyres at the best Dubai prices.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `/brands/${params.slug}` },
        ...(b?.logo_url ? [{ property: "og:image", content: b.logo_url }] : []),
      ],
      links: [{ rel: "canonical", href: `/brands/${params.slug}` }],
    };
  },
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-4 text-brand font-semibold hover:underline"
        >
          Retry
        </button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Brand not found</h1>
      <Link to="/brands" className="mt-4 inline-block text-brand font-semibold">← Back to brands</Link>
    </div>
  ),
  component: BrandPage,
});

function BrandPage() {
  const { brand } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/brands/$slug" });
  const fetchTires = useServerFn(searchTires);
  const fetchMeta = useServerFn(fetchBrandFilterMeta);

  const filters = useMemo(() => {
    const f: any = { brand: slug, sort: search.sort };
    if (search.vehicle_type) f.vehicle_type = search.vehicle_type;
    if (search.season) f.season = search.season;
    if (search.width) f.width = search.width;
    if (search.profile) f.profile = search.profile;
    if (search.rim) f.rim = search.rim;
    return f;
  }, [search, slug]);

  const tiresQ = useQuery({
    queryKey: ["tires", filters],
    queryFn: () => fetchTires({ data: filters }),
  });
  const metaQ = useQuery({
    queryKey: ["brand-filter-meta", slug],
    queryFn: () => fetchMeta({ data: { slug } }),
  });

  function update(patch: Partial<BrandSearch>) {
    navigate({ search: (prev: BrandSearch) => ({ ...prev, ...patch }) });
  }

  const activeCount =
    (search.vehicle_type ? 1 : 0) + (search.season ? 1 : 0) +
    (search.width ? 1 : 0) + (search.profile ? 1 : 0) + (search.rim ? 1 : 0);

  return (
    <div className="container mx-auto px-4 py-10 pb-40">
      {/* Brand header badge */}
      <div className="rounded-2xl border border-border bg-card p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 mb-10 shadow-sm">
        <div className="h-24 w-40 shrink-0 rounded-xl bg-background border border-border flex items-center justify-center p-4">
          <BrandLogo name={brand.name} logoUrl={brand.logo_url} className="h-full w-full" textClassName="text-xl" />
        </div>
        <div className="flex-1 min-w-0">
          <nav className="text-xs text-muted-foreground mb-2">
            <Link to="/brands" className="hover:text-brand">Brands</Link>
            <span className="mx-1.5">/</span>
            <span className="text-foreground font-semibold">{brand.name}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{brand.name}</h1>
          {brand.country && (
            <p className="mt-1 text-sm text-muted-foreground">Origin: {brand.country}</p>
          )}
          {brand.description && (
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-3xl">{brand.description}</p>
          )}
        </div>
      </div>

      {/* Tyres header */}
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-3">
        <div>
          <h2 className="text-xl font-bold">{brand.name} tyres</h2>
          <p className="text-sm text-muted-foreground">
            {tiresQ.data ? `${tiresQ.data.length} tyres available` : "Loading…"}
          </p>
        </div>
        <label className="text-sm flex items-center gap-2">
          <span className="text-muted-foreground">Sort:</span>
          <select
            value={search.sort}
            onChange={(e) => update({ sort: e.target.value as any })}
            className="filter-select py-1.5"
          >
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      {tiresQ.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : tiresQ.data && tiresQ.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tiresQ.data.map((t: any) => (
            <TireCard key={t.id} t={t} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-lg">
          <p className="font-semibold">No {brand.name} tyres match these filters</p>
          <p className="text-sm text-muted-foreground mt-1">Try clearing some filters or contact us — we can usually source within a few days.</p>
          {activeCount > 0 && (
            <button
              onClick={() => navigate({ search: { sort: search.sort } as any })}
              className="mt-4 text-brand font-semibold hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* STICKY BOTTOM FILTER BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand text-brand-foreground border-t-2 border-brand shadow-[0_-12px_40px_-10px_rgba(220,38,38,0.45)]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
            <div className="hidden md:flex items-center gap-2 shrink-0 pr-3 border-r border-white/25">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {brand.name} {activeCount > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded">({activeCount})</span>}
              </span>
            </div>

            <select value={search.vehicle_type} onChange={(e) => update({ vehicle_type: e.target.value as any })} className="bg-white text-navy text-sm font-semibold rounded-md border-0 py-2 px-3 flex-1 min-w-[130px] focus:outline-none focus:ring-2 focus:ring-white/60">
              <option value="">All vehicles</option>
              <option value="passenger">Passenger</option>
              <option value="suv">SUV / 4x4</option>
            </select>

            <select value={search.season} onChange={(e) => update({ season: e.target.value as any })} className="bg-white text-navy text-sm font-semibold rounded-md border-0 py-2 px-3 flex-1 min-w-[130px] focus:outline-none focus:ring-2 focus:ring-white/60">
              <option value="">All seasons</option>
              <option value="summer">Summer</option>
              <option value="all-season">All-season</option>
              <option value="winter">Winter</option>
            </select>

            <div className="flex items-center gap-1.5 flex-1 min-w-[260px]">
              <select value={search.width || ""} onChange={(e) => update({ width: Number(e.target.value) || 0 })} className="bg-white text-navy text-sm font-semibold rounded-md border-0 py-2 px-2 flex-1 focus:outline-none focus:ring-2 focus:ring-white/60" aria-label="Width">
                <option value="">Width</option>
                {metaQ.data?.widths.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
              <span className="text-white/80 text-xs font-bold">/</span>
              <select value={search.profile || ""} onChange={(e) => update({ profile: Number(e.target.value) || 0 })} className="bg-white text-navy text-sm font-semibold rounded-md border-0 py-2 px-2 flex-1 focus:outline-none focus:ring-2 focus:ring-white/60" aria-label="Profile">
                <option value="">Profile</option>
                {metaQ.data?.profiles.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <span className="text-white/80 text-xs font-bold">R</span>
              <select value={search.rim || ""} onChange={(e) => update({ rim: Number(e.target.value) || 0 })} className="bg-white text-navy text-sm font-semibold rounded-md border-0 py-2 px-2 flex-1 focus:outline-none focus:ring-2 focus:ring-white/60" aria-label="Rim">
                <option value="">Rim</option>
                {metaQ.data?.rims.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {activeCount > 0 && (
              <button
                onClick={() => navigate({ search: { sort: search.sort } as any })}
                className="shrink-0 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-white/90 hover:text-white hover:bg-white/15 rounded-md px-3 py-2 transition-colors"
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
