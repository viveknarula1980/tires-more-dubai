import { Link } from "@tanstack/react-router";
import { Star, Sun, Snowflake, CloudSun, Gauge, Droplet, ShieldCheck, Wrench, ShoppingCart, Truck, CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useCart } from "@/lib/cart";

type Tire = {
  id: string; slug: string; name: string;
  width: number; profile: number; rim: number;
  price_aed: number; original_price_aed: number | null;
  main_image: string | null; year_of_production: number | null;
  country_of_origin: string | null;
  season?: string | null; load_index?: string | null; speed_rating?: string | null;
  warranty?: string | null;
  brand?: { name: string; logo_url: string | null } | null;
};

export function TireCard({ t }: { t: Tire }) {
  const { add } = useCart();
  const size = `${t.width}/${t.profile} R${t.rim}`;
  const sizeFull = `${size}${t.load_index ? ` ${t.load_index}` : ""}${t.speed_rating ?? ""}`;
  const discount = t.original_price_aed && t.original_price_aed > t.price_aed
    ? Math.round((1 - t.price_aed / Number(t.original_price_aed)) * 100)
    : 0;
  const SeasonIcon = t.season === "winter" ? Snowflake : t.season === "summer" ? Sun : CloudSun;

  return (
    <div className="group relative flex flex-col h-full rounded-2xl bg-card border border-border overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300">
      <Link to="/shop/$slug" params={{ slug: t.slug }} className="block">
        {/* Image area — oversized tire bleeding off the left edge */}
        <div className="relative aspect-[4/3] bg-white flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.05)_0%,transparent_65%)]" />

          {discount > 0 && (
            <span className="absolute top-3 left-3 z-20 bg-brand text-brand-foreground text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
              -{discount}%
            </span>
          )}
          {t.brand?.name && (
            <div className="absolute top-3 right-3 z-20 bg-white px-3 py-1.5 rounded-md shadow-sm border border-border/50 h-9 min-w-[5rem] flex items-center justify-center">
              <BrandLogo
                name={t.brand.name}
                logoUrl={t.brand.logo_url}
                className="h-full w-full bg-transparent"
                textClassName="text-[11px]"
              />
            </div>
          )}

          <img
            src={t.main_image ?? "/tire-default.jpg"}
            alt={t.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-center scale-[1.6] transition-transform duration-500 group-hover:scale-[1.7] drop-shadow-2xl"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div>
          <Link to="/shop/$slug" params={{ slug: t.slug }}>
            <h3 className="text-navy text-base font-bold uppercase leading-tight tracking-tight line-clamp-2 hover:text-brand transition-colors">
              {t.name}
            </h3>
          </Link>
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            <div className="flex items-center gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < 4 ? "fill-current" : "fill-current opacity-40"}`} />
              ))}
            </div>
            <span className="text-muted-foreground">4.6 (128)</span>
          </div>
        </div>

        {/* Price */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-brand text-2xl font-bold tracking-tight">
              AED {Number(t.price_aed).toFixed(0)}
            </span>
            {discount > 0 && (
              <span className="text-muted-foreground text-sm line-through">
                AED {Number(t.original_price_aed).toFixed(0)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Per tyre · VAT included</p>
        </div>

        {/* Size box */}
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
          <div className="h-8 w-8 rounded-full bg-navy text-navy-foreground flex items-center justify-center shrink-0">
            <Gauge className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-mono font-bold text-sm text-navy leading-none">{sizeFull}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
              W:{t.width} · A:{t.profile} · R:{t.rim}
            </p>
          </div>
        </div>

        {/* Feature icons */}
        <div className="grid grid-cols-4 gap-1.5">
          <FeatureChip icon={SeasonIcon} label={t.season ?? "All"} />
          <FeatureChip icon={Droplet} label="Wet" badge="A" badgeColor="bg-emerald-500" />
          <FeatureChip icon={Gauge} label="Grip" />
          <FeatureChip icon={ShieldCheck} label={t.warranty ? "Warr." : "60K"} />
        </div>

        {/* Fitting included */}
        <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2">
          <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Wrench className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide leading-none">Fitting Included</p>
            <p className="text-[10px] text-emerald-700/80 mt-0.5">Free balancing & valve</p>
          </div>
        </div>

        {/* Stock + delivery */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-3">
          <span className="flex items-center gap-1 font-semibold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> In Stock
          </span>
          <span className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" /> 1–2 Days
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => {
            e.preventDefault();
            add({
              tire_id: t.id, slug: t.slug, name: t.name,
              price_aed: Number(t.price_aed),
              image: t.main_image ?? "/tire-default.jpg", size,
            });
          }}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand text-brand-foreground font-bold py-3 hover:opacity-90 active:scale-[0.99] transition-all uppercase text-sm tracking-wide"
        >
          <ShoppingCart className="h-4 w-4" /> Add to Cart
        </button>
      </div>
    </div>
  );
}

function FeatureChip({
  icon: Icon, label, badge, badgeColor,
}: { icon: any; label: string; badge?: string; badgeColor?: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-1 rounded-md border border-border bg-background px-1 py-2">
      <Icon className="h-4 w-4 text-navy" />
      <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide capitalize">{label}</span>
      {badge && (
        <span className={`absolute -top-1 -right-1 h-4 w-4 rounded-full ${badgeColor} text-white text-[9px] font-bold flex items-center justify-center`}>
          {badge}
        </span>
      )}
    </div>
  );
}
