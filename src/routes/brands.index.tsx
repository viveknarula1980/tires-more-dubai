import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getBrands } from "@/lib/catalog.functions";
import { BrandLogo } from "@/components/BrandLogo";
import { StickyBottomSearch } from "@/components/StickyBottomSearch";

export const Route = createFileRoute("/brands/")({
  head: () => ({
    meta: [
      { title: "Tyre Brands — Tires & More UAE" },
      { name: "description", content: "Browse all tyre brands we carry — Michelin, Bridgestone, Continental, Pirelli, Goodyear and more." },
      { property: "og:title", content: "Tyre Brands — Tires & More UAE" },
      { property: "og:description", content: "All premium tyre brands available in Dubai." },
    ],
  }),
  component: BrandsPage,
});

function BrandsPage() {
  const fetchBrands = useServerFn(getBrands);
  const { data, isLoading } = useQuery({ queryKey: ["brands"], queryFn: () => fetchBrands() });

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Tyre Brands</h1>
        <p className="mt-2 text-muted-foreground">Pick a brand to explore its tyres.</p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {data?.map((b: any) => (
            <Link
              key={b.slug}
              to="/brands/$slug"
              params={{ slug: b.slug }}
              className="group aspect-[4/3] rounded-xl border border-border bg-card flex flex-col items-center justify-center p-6 hover:border-brand hover:shadow-lg transition-all"
            >
              <BrandLogo name={b.name} logoUrl={b.logo_url} className="h-12 w-full" textClassName="text-base" />
              <span className="mt-3 text-xs font-semibold text-muted-foreground group-hover:text-brand">
                View tyres →
              </span>
            </Link>
          ))}
        </div>
      )}
      <StickyBottomSearch />
    </div>
  );
}
