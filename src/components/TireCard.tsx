import { Link } from "@tanstack/react-router";

type Tire = {
  id: string; slug: string; name: string;
  width: number; profile: number; rim: number;
  price_aed: number; original_price_aed: number | null;
  main_image: string | null; year_of_production: number | null;
  country_of_origin: string | null; brand?: { name: string; logo_url: string | null } | null;
};

export function TireCard({ t }: { t: Tire }) {
  const size = `${t.width}/${t.profile} R${t.rim}`;
  const discount = t.original_price_aed && t.original_price_aed > t.price_aed
    ? Math.round((1 - t.price_aed / Number(t.original_price_aed)) * 100)
    : 0;
  return (
    <Link to="/shop/$slug" params={{ slug: t.slug }} className="group block rounded-lg border border-border bg-card overflow-hidden hover:border-brand hover:shadow-lg transition-all">
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img src={t.main_image ?? "/tire-default.jpg"} alt={t.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-brand text-brand-foreground text-xs font-bold px-2 py-1 rounded">-{discount}%</span>
        )}
        {t.brand?.logo_url && (
          <div className="absolute top-2 right-2 bg-white rounded p-1 h-8 w-14 flex items-center justify-center">
            <img src={t.brand.logo_url} alt={t.brand.name} className="max-h-full max-w-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{t.brand?.name}</p>
        <h3 className="font-semibold text-sm mt-1 leading-tight line-clamp-2 min-h-[2.5em]">{t.name}</h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono font-semibold text-foreground">{size}</span>
          {t.year_of_production && <span>· {t.year_of_production}</span>}
          {t.country_of_origin && <span>· {t.country_of_origin}</span>}
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-brand">AED {Number(t.price_aed).toFixed(0)}</span>
          {discount > 0 && <span className="text-xs line-through text-muted-foreground">AED {Number(t.original_price_aed).toFixed(0)}</span>}
        </div>
      </div>
    </Link>
  );
}
