import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { getBrands, searchTires } from "@/lib/catalog.functions";
import { TireCard } from "@/components/TireCard";
import { useCart } from "@/lib/cart";

type ShopSearch = {
  brand: string;
  vehicle_type: "" | "passenger" | "suv";
  season: "" | "summer" | "all-season" | "winter";
  width: number;
  profile: number;
  rim: number;
  sort: "featured" | "price_asc" | "price_desc" | "name";
};

const fetchFilterMeta = createServerFn({ method: "GET" }).handler(async () => {
  const all = await searchTires({ data: { limit: 100 } as any });
  const widths = Array.from(new Set(all.map((t: any) => t.width))).sort((a, b) => a - b);
  const profiles = Array.from(new Set(all.map((t: any) => t.profile))).sort((a, b) => a - b);
  const rims = Array.from(new Set(all.map((t: any) => t.rim))).sort((a, b) => a - b);
  return { widths, profiles, rims };
});

export const Route = createFileRoute("/shop/")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
    brand: typeof s.brand === "string" ? s.brand : "",
    vehicle_type: (s.vehicle_type === "passenger" || s.vehicle_type === "suv") ? s.vehicle_type : "",
    season: (s.season === "summer" || s.season === "all-season" || s.season === "winter") ? s.season : "",
    width: Number(s.width) || 0,
    profile: Number(s.profile) || 0,
    rim: Number(s.rim) || 0,
    sort: (s.sort === "price_asc" || s.sort === "price_desc" || s.sort === "name") ? s.sort : "featured",
  }),
  head: () => ({
    meta: [
      { title: "Shop Tyres in Dubai — Tires & More UAE" },
      { name: "description", content: "Browse premium tyres from Michelin, Bridgestone, Continental, Pirelli and more. Filter by brand, size and vehicle type. Best prices in Dubai." },
      { property: "og:title", content: "Shop Tyres in Dubai — Tires & More UAE" },
      { property: "og:description", content: "Premium tyres at competitive Dubai prices. Free fitting on most orders." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop/" });
  const fetchTires = useServerFn(searchTires);
  const fetchBrands = useServerFn(getBrands);
  const fetchMeta = useServerFn(fetchFilterMeta);

  const filters = useMemo(() => {
    const f: any = { sort: search.sort };
    if (search.brand) f.brand = search.brand;
    if (search.vehicle_type) f.vehicle_type = search.vehicle_type;
    if (search.season) f.season = search.season;
    if (search.width) f.width = search.width;
    if (search.profile) f.profile = search.profile;
    if (search.rim) f.rim = search.rim;
    return f;
  }, [search]);

  const tiresQ = useQuery({ queryKey: ["tires", filters], queryFn: () => fetchTires({ data: filters }) });
  const brandsQ = useQuery({ queryKey: ["brands"], queryFn: () => fetchBrands() });
  const metaQ = useQuery({ queryKey: ["filter-meta"], queryFn: () => fetchMeta() });

  function update(patch: Partial<typeof search>) {
    navigate({ search: (prev: ShopSearch) => ({ ...prev, ...patch }) });
  }

  const activeCount =
    (search.brand ? 1 : 0) + (search.vehicle_type ? 1 : 0) + (search.season ? 1 : 0) +
    (search.width ? 1 : 0) + (search.profile ? 1 : 0) + (search.rim ? 1 : 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Shop Tyres</h1>
        <p className="mt-2 text-muted-foreground">
          {tiresQ.data ? `${tiresQ.data.length} tyres available` : "Loading…"} · Free fitting on orders over AED 500
        </p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Filters */}
        <aside className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Filters {activeCount > 0 && <span className="text-brand">({activeCount})</span>}</h2>
            {activeCount > 0 && (
              <button
                onClick={() => navigate({ search: { sort: "featured" } as any })}
                className="text-xs text-muted-foreground hover:text-brand inline-flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>

          <FilterGroup label="Brand">
            <select value={search.brand} onChange={(e) => update({ brand: e.target.value })} className="filter-select">
              <option value="">All brands</option>
              {brandsQ.data?.map((b: any) => (
                <option key={b.slug} value={b.slug}>{b.name}</option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup label="Vehicle type">
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: "", l: "All" },
                { v: "passenger", l: "Passenger" },
                { v: "suv", l: "SUV / 4x4" },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => update({ vehicle_type: o.v as any })}
                  className={`text-xs font-semibold px-3 py-2 rounded border transition-colors ${
                    search.vehicle_type === o.v ? "bg-brand text-brand-foreground border-brand" : "bg-card border-border hover:border-brand/50"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Season">
            <select value={search.season} onChange={(e) => update({ season: e.target.value as any })} className="filter-select">
              <option value="">All seasons</option>
              <option value="summer">Summer</option>
              <option value="all-season">All-season</option>
              <option value="winter">Winter</option>
            </select>
          </FilterGroup>

          <FilterGroup label="Tyre size">
            <div className="grid grid-cols-3 gap-2">
              <select value={search.width || ""} onChange={(e) => update({ width: Number(e.target.value) || 0 })} className="filter-select" aria-label="Width">
                <option value="">Width</option>
                {metaQ.data?.widths.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
              <select value={search.profile || ""} onChange={(e) => update({ profile: Number(e.target.value) || 0 })} className="filter-select" aria-label="Profile">
                <option value="">Profile</option>
                {metaQ.data?.profiles.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={search.rim || ""} onChange={(e) => update({ rim: Number(e.target.value) || 0 })} className="filter-select" aria-label="Rim">
                <option value="">Rim</option>
                {metaQ.data?.rims.map((r) => <option key={r} value={r}>R{r}</option>)}
              </select>
            </div>
          </FilterGroup>
        </aside>

        {/* Results */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-border pb-3">
            <Link to="/cart" className="text-sm font-semibold text-brand hover:underline">View quote cart →</Link>
            <label className="text-sm flex items-center gap-2">
              <span className="text-muted-foreground">Sort:</span>
              <select value={search.sort} onChange={(e) => update({ sort: e.target.value as any })} className="filter-select py-1.5">
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>

          {tiresQ.isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : tiresQ.data && tiresQ.data.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {tiresQ.data.map((t: any) => (
                <TireGridItem key={t.id} t={t} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-border rounded-lg">
              <p className="font-semibold">No tyres match these filters</p>
              <p className="text-sm text-muted-foreground mt-1">Try clearing some filters or contact us — we likely have it in stock.</p>
              <button onClick={() => navigate({ search: { sort: "featured" } as any })} className="mt-4 text-brand font-semibold hover:underline">Reset filters</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">{label}</p>
      {children}
    </div>
  );
}

function TireGridItem({ t }: { t: any }) {
  return <TireCard t={t} />;
}
