import { createFileRoute, Link, useRouter, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { getBrandBySlug, searchTires } from "@/lib/catalog.functions";
import { BrandLogo } from "@/components/BrandLogo";
import { TireCard } from "@/components/TireCard";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/brands/$slug")({
  loader: async ({ params }) => {
    const brand = await getBrandBySlug({ data: { slug: params.slug } });
    if (!brand) throw notFound();
    return { brand };
  },
  head: ({ loaderData }) => {
    const b = loaderData?.brand;
    const title = b ? `${b.name} Tyres in Dubai — Tires & More UAE` : "Brand — Tires & More UAE";
    const desc = b?.description ?? `Shop ${b?.name ?? ""} tyres at the best Dubai prices.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(b?.logo_url ? [{ property: "og:image", content: b.logo_url }] : []),
      ],
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
  const fetchTires = useServerFn(searchTires);
  const tiresQ = useQuery({
    queryKey: ["tires", { brand: slug }],
    queryFn: () => fetchTires({ data: { brand: slug } }),
  });

  return (
    <div className="container mx-auto px-4 py-10">
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

      {/* Tyres */}
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-3">
        <div>
          <h2 className="text-xl font-bold">{brand.name} tyres</h2>
          <p className="text-sm text-muted-foreground">
            {tiresQ.data ? `${tiresQ.data.length} tyres available` : "Loading…"}
          </p>
        </div>
        <Link to="/shop" search={{ brand: slug } as any} className="text-sm font-semibold text-brand hover:underline">
          Open in shop with filters →
        </Link>
      </div>

      {tiresQ.isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : tiresQ.data && tiresQ.data.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tiresQ.data.map((t: any) => (
            <BrandTireItem key={t.id} t={t} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-lg">
          <p className="font-semibold">No {brand.name} tyres in stock right now</p>
          <p className="text-sm text-muted-foreground mt-1">Contact us — we can usually source them within a few days.</p>
          <Link to="/contact" className="mt-4 inline-block text-brand font-semibold hover:underline">Request a quote →</Link>
        </div>
      )}
    </div>
  );
}

function BrandTireItem({ t }: { t: any }) {
  const { add } = useCart();
  const size = `${t.width}/${t.profile} R${t.rim}`;
  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300">
      <div className="flex-1 flex flex-col">
        <TireCard t={t} />
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          add({
            tire_id: t.id, slug: t.slug, name: t.name, price_aed: Number(t.price_aed),
            image: t.main_image ?? "/tire-default.jpg", size,
          });
        }}
        className="w-full bg-navy hover:bg-navy/90 text-navy-foreground font-semibold py-4 flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="text-sm tracking-wide">Add to quote</span>
      </button>
    </div>
  );
}
