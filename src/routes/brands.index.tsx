import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getBrands } from "@/lib/catalog.functions";
import { BrandLogo } from "@/components/BrandLogo";
import { StickyBottomSearch } from "@/components/StickyBottomSearch";
import { supabase } from "@/integrations/supabase/client";
import foxLogo from "/brands/shocks/fox.png?url";
import dobinsonsLogo from "/brands/shocks/dobinsons.png?url";
import radfloLogo from "/brands/shocks/radflo.png?url";
import falconLogo from "/brands/shocks/falcon.png?url";

const SHOCK_BRANDS = [
  { slug: "fox", name: "Fox", logo_url: foxLogo },
  { slug: "dobinsons", name: "Dobinsons", logo_url: dobinsonsLogo },
  { slug: "radflo", name: "Radflo", logo_url: radfloLogo },
  { slug: "falcon", name: "Falcon", logo_url: falconLogo },
];

export const Route = createFileRoute("/brands/")({
  head: () => ({
    meta: [
      { title: "Tyre & Wheel Brands — Tires & More UAE" },
      { name: "description", content: "Browse all tyre and wheel brands we carry — Michelin, Bridgestone, Pirelli, KMC, Baja Rim, Dakar Forged and more." },
      { property: "og:title", content: "Tyre & Wheel Brands — Tires & More UAE" },
      { property: "og:description", content: "All premium tyre and wheel brands available in Dubai." },
    ],
  }),
  component: BrandsPage,
});

function BrandsPage() {
  const fetchBrands = useServerFn(getBrands);
  const { data, isLoading } = useQuery({ queryKey: ["brands"], queryFn: () => fetchBrands() });

  const { data: rimBrands, isLoading: rimsLoading } = useQuery({
    queryKey: ["rim-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rim_brands")
        .select("slug, name, logo_url")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Tyre Brands</h1>
        <p className="mt-2 text-muted-foreground">Pick a brand to explore its tyres.</p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {data?.map((b: any) => (
            <Link
              key={b.slug}
              to="/brands/$slug"
              params={{ slug: b.slug }}
              className="group rounded-xl border border-border bg-card flex flex-col items-center justify-center px-4 py-3 hover:border-brand hover:shadow-lg transition-all"
            >
              <BrandLogo name={b.name} logoUrl={b.logo_url} className="h-12 w-full" textClassName="text-base" />
              <span className="mt-2 text-xs font-semibold text-muted-foreground group-hover:text-brand">
                View tyres →
              </span>
            </Link>
          ))}
        </div>
      )}

      <header className="mt-14 mb-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Wheel Brands</h2>
        <p className="mt-2 text-muted-foreground">Pick a brand to explore its wheels.</p>
      </header>

      {rimsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {rimBrands?.map((b: any) => (
            <Link
              key={b.slug}
              to="/rims/$slug"
              params={{ slug: b.slug }}
              className="group rounded-xl border border-border bg-card flex flex-col items-center justify-center px-4 py-3 hover:border-brand hover:shadow-lg transition-all"
            >
              <BrandLogo name={b.name} logoUrl={b.logo_url} className="h-12 w-full" textClassName="text-base" />
              <span className="mt-2 text-xs font-semibold text-muted-foreground group-hover:text-brand">
                View wheels →
              </span>
            </Link>
          ))}
        </div>
      )}

      <header className="mt-14 mb-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Shock Brands</h2>
        <p className="mt-2 text-muted-foreground">
          Premium off-road shock absorbers — coming soon.{" "}
          <Link to="/shocks" className="text-brand font-semibold hover:underline">
            Explore the lineup →
          </Link>
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {SHOCK_BRANDS.map((b) => (
          <Link
            key={b.slug}
            to="/shocks"
            hash={b.slug}
            className="group rounded-xl border border-border bg-card flex flex-col items-center justify-center px-4 py-3 hover:border-brand hover:shadow-lg transition-all"
          >
            <BrandLogo name={b.name} logoUrl={b.logo_url} className="h-12 w-full" textClassName="text-base" />
            <span className="mt-2 text-xs font-semibold text-muted-foreground group-hover:text-brand">
              View shocks →
            </span>
          </Link>
        ))}
      </div>

      <StickyBottomSearch />
    </div>
  );
}
