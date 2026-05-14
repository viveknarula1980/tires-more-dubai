import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { getTireBySlug } from "@/lib/catalog.functions";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/shop/$slug")({
  component: TireDetail,
});

function TireDetail() {
  const { slug } = Route.useParams();
  const fetchTire = useServerFn(getTireBySlug);
  const { add } = useCart();
  const { data: t, isLoading } = useQuery({
    queryKey: ["tire", slug],
    queryFn: () => fetchTire({ data: { slug } }),
  });

  if (isLoading) return <div className="container mx-auto px-4 py-16">Loading…</div>;
  if (!t) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Tyre not found</h1>
      <Link to="/shop" className="mt-4 inline-block text-brand font-semibold">← Back to shop</Link>
    </div>
  );

  const size = `${t.width}/${t.profile} R${t.rim}`;
  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/shop" className="text-sm text-muted-foreground hover:text-brand">← Back to shop</Link>
      <div className="mt-4 grid md:grid-cols-2 gap-8">
        <img src={t.main_image ?? "/tire-default.jpg"} alt={t.name} className="w-full aspect-square object-cover rounded-lg bg-muted" />
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{(t as any).brand?.name}</p>
          <h1 className="text-3xl font-bold mt-1">{t.name}</h1>
          <p className="font-mono mt-2 text-lg">{size}</p>
          <p className="mt-4 text-3xl font-bold text-brand">AED {Number(t.price_aed).toFixed(0)}</p>
          {t.description && <p className="mt-4 text-muted-foreground">{t.description}</p>}
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {t.year_of_production && <><dt className="text-muted-foreground">Year</dt><dd>{t.year_of_production}</dd></>}
            {t.country_of_origin && <><dt className="text-muted-foreground">Origin</dt><dd>{t.country_of_origin}</dd></>}
            {t.season && <><dt className="text-muted-foreground">Season</dt><dd className="capitalize">{t.season}</dd></>}
            {t.warranty && <><dt className="text-muted-foreground">Warranty</dt><dd>{t.warranty}</dd></>}
          </dl>
          <button
            onClick={() => add({
              tire_id: t.id, slug: t.slug, name: t.name,
              price_aed: Number(t.price_aed), image: t.main_image ?? "/tire-default.jpg", size,
            })}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand text-brand-foreground px-6 py-3 font-semibold hover:opacity-90"
          >
            <ShoppingCart className="h-5 w-5" /> Add to quote
          </button>
        </div>
      </div>
    </div>
  );
}
