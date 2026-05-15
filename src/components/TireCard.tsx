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
      <div className="relative aspect-square bg-[hsl(220_14%_96%)] flex items-center justify-center p-8 overflow-hidden">
        {/* Soft radial focus */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.04)_0%,transparent_70%)]" />

        {discount > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-brand text-brand-foreground text-[11px] font-bold px-2 py-0.5 rounded tracking-wide shadow-sm">
            -{discount}%
          </span>
        )}
        {t.brand?.name && (
          <div className="absolute top-3 right-3 z-10 bg-white px-2.5 py-1 rounded shadow-sm border border-border/50 h-7 min-w-[3.75rem] flex items-center justify-center">
            <BrandLogo
              name={t.brand.name}
              logoUrl={t.brand.logo_url}
              className="h-full w-full bg-transparent"
              textClassName="text-[10px]"
            />
          </div>
        )}

        <img
          src={t.main_image ?? "/tire-default.jpg"}
          alt={t.name}
          loading="lazy"
          className="relative max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
          {t.brand?.name}
        </div>

        <h3 className="text-navy text-base font-bold leading-snug mb-3 line-clamp-2 min-h-[2.5em]">
          {t.name}
        </h3>

        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded bg-muted text-navy text-[11px] font-semibold border border-border/50">
            {size}
          </span>
        </div>

        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-brand text-xl font-bold tracking-tight">
            AED {Number(t.price_aed).toFixed(0)}
          </span>
          {discount > 0 && (
            <span className="text-muted-foreground text-sm line-through decoration-1">
              AED {Number(t.original_price_aed).toFixed(0)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
