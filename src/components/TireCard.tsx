import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";

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
    <Link
      to="/shop/$slug"
      params={{ slug: t.slug }}
      className="group block h-full"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-muted/60 flex items-center justify-center p-6 overflow-hidden">
        {discount > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-brand text-brand-foreground text-[11px] font-bold px-2 py-1 rounded-md tracking-tight">
            -{discount}%
          </span>
        )}
        {t.brand?.name && (
          <div className="absolute top-3 right-3 z-10 bg-white p-2 rounded-lg shadow-sm border border-border/50 h-8 min-w-[3.75rem] flex items-center justify-center">
            <BrandLogo
              name={t.brand.name}
              logoUrl={t.brand.logo_url}
              className="h-full w-full"
              textClassName="text-[10px]"
            />
          </div>
        )}
        <img
          src={t.main_image ?? "/tire-default.jpg"}
          alt={t.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-6 pb-4">
        <div className="flex flex-col gap-1 mb-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            {t.brand?.name}
          </span>
          <h3 className="text-navy font-bold text-base leading-snug line-clamp-2 min-h-[2.5em]">
            {t.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {size}
            </span>
            {t.year_of_production && (
              <span className="text-[11px] text-muted-foreground">{t.year_of_production}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-brand">AED {Number(t.price_aed).toFixed(0)}</span>
            {discount > 0 && (
              <span className="text-sm text-muted-foreground line-through font-medium">
                AED {Number(t.original_price_aed).toFixed(0)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">Including VAT</span>
        </div>
      </div>
    </Link>
  );
}
