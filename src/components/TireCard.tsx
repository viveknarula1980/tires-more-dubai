import { Link } from "@tanstack/react-router";
import {
  Star, ShoppingCart, Sun, Snowflake, CloudSun, Route as RouteIcon,
  Droplet, Volume2, ShieldCheck, Wrench, CheckCircle2, Truck, Minus, Plus,
} from "lucide-react";
import { useState } from "react";
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
  const [qty, setQty] = useState(1);
  const size = `${t.width}/${t.profile} R${t.rim}`;
  const sizeFull = `${size}${t.load_index ? ` ${t.load_index}` : ""}${t.speed_rating ?? ""}`;
  const discount = t.original_price_aed && t.original_price_aed > t.price_aed
    ? Math.round((1 - t.price_aed / Number(t.original_price_aed)) * 100)
    : 0;
  const SeasonIcon = t.season === "winter" ? Snowflake : t.season === "summer" ? Sun : CloudSun;

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add({
      tire_id: t.id, slug: t.slug, name: t.name,
      price_aed: Number(t.price_aed),
      image: t.main_image ?? "/tire-default.jpg", size,
    }, qty);
  };

  return (
    <div className="group relative grid grid-cols-1 md:grid-cols-[42%_1fr] rounded-2xl bg-card border border-border overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.18)] transition-all duration-300">
      {/* LEFT: oversized tire bleeding off the right */}
      <Link
        to="/shop/$slug"
        params={{ slug: t.slug }}
        className="relative block bg-white overflow-hidden aspect-[4/5] md:aspect-auto md:min-h-[520px]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.06)_0%,transparent_70%)]" />

        {discount > 0 && (
          <span className="absolute top-4 left-4 z-20 bg-brand text-brand-foreground text-xs font-bold px-3 py-1.5 rounded-md shadow-md">
            -{discount}%
          </span>
        )}

        <img
          src={t.main_image ?? "/tire-default.jpg"}
          alt={t.name}
          loading="lazy"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[110%] w-auto max-w-none object-contain transition-transform duration-700 group-hover:scale-[1.04] drop-shadow-2xl"
        />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-4 py-2 text-xs font-semibold text-navy shadow-lg border border-border/50">
          View Details
        </div>
      </Link>

      {/* RIGHT: content */}
      <div className="p-5 md:p-6 flex flex-col gap-4">
        {/* Brand row */}
        <div className="flex items-start justify-between gap-3">
          {t.brand?.name && (
            <div className="h-10 w-32 flex items-center">
              <BrandLogo
                name={t.brand.name}
                logoUrl={t.brand.logo_url}
                className="h-full w-full bg-transparent justify-start"
                textClassName="text-base"
              />
            </div>
          )}
        </div>

        {/* Name + rating */}
        <div>
          <Link to="/shop/$slug" params={{ slug: t.slug }}>
            <h3 className="text-navy text-xl md:text-2xl font-bold uppercase tracking-tight leading-tight line-clamp-2 hover:text-brand transition-colors">
              {t.name}
            </h3>
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < 4 ? "fill-current" : "fill-current opacity-40"}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">4.6 (128 reviews)</span>
          </div>
        </div>

        {/* Price */}
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-brand text-3xl font-bold tracking-tight">
              AED {Number(t.price_aed).toFixed(0)}
            </span>
            {discount > 0 && (
              <span className="text-muted-foreground text-base line-through">
                AED {Number(t.original_price_aed).toFixed(0)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Per tyre · VAT included</p>
        </div>

        {/* Size box */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
          <div className="h-10 w-10 rounded-full bg-navy text-navy-foreground flex items-center justify-center shrink-0">
            <RouteIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono font-bold text-sm text-navy">{sizeFull}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
              W:{t.width} · A:{t.profile} · R:{t.rim}
              {t.load_index ? ` · L:${t.load_index}` : ""}
              {t.speed_rating ? ` · S:${t.speed_rating}` : ""}
            </p>
          </div>
        </div>

        {/* Feature chips — 5 across like reference */}
        <div className="grid grid-cols-5 gap-2">
          <FeatureChip icon={SeasonIcon} top={t.season ?? "All"} bottom="Season" />
          <FeatureChip icon={RouteIcon} top="High" bottom="Performance" />
          <FeatureChip icon={Droplet} top="Wet" bottom="Traction" badge="A" badgeColor="bg-emerald-500" />
          <FeatureChip icon={Volume2} top="Low" bottom="Noise" badge="B" badgeColor="bg-amber-500" />
          <FeatureChip icon={ShieldCheck} top="60K" bottom="Warranty" />
        </div>

        {/* Fitting included */}
        <div className="flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5">
          <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Wrench className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide leading-none">Fitting Included</p>
            <p className="text-[11px] text-emerald-700/80 mt-1">Free fitting, balancing & valve installation</p>
          </div>
        </div>

        {/* Stock + delivery */}
        <div className="flex items-center justify-between text-xs border-t border-border pt-3">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> In Stock
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Truck className="h-4 w-4" /> Fast Delivery · 1–2 Days
          </span>
        </div>

        {/* Qty + CTA */}
        <div className="mt-auto flex items-stretch gap-2">
          <div className="inline-flex items-center border border-border rounded-lg bg-background">
            <button
              onClick={(e) => { e.preventDefault(); setQty(Math.max(1, qty - 1)); }}
              className="px-3 h-full hover:bg-muted rounded-l-lg"
              aria-label="Decrease"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-3 font-bold text-sm min-w-[2rem] text-center">{qty}</span>
            <button
              onClick={(e) => { e.preventDefault(); setQty(Math.min(20, qty + 1)); }}
              className="px-3 h-full hover:bg-muted rounded-r-lg"
              aria-label="Increase"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={onAdd}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand text-brand-foreground font-bold py-3 hover:opacity-90 active:scale-[0.99] transition-all uppercase text-sm tracking-wide"
          >
            <ShoppingCart className="h-4 w-4" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureChip({
  icon: Icon, top, bottom, badge, badgeColor,
}: { icon: any; top: string; bottom: string; badge?: string; badgeColor?: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-background px-1 py-2.5">
      <Icon className="h-5 w-5 text-navy" strokeWidth={1.5} />
      <div className="text-center leading-tight">
        <p className="text-[10px] font-bold text-foreground capitalize">{top}</p>
        <p className="text-[9px] text-muted-foreground">{bottom}</p>
      </div>
      {badge && (
        <span className={`absolute top-1.5 right-1.5 h-4 w-4 rounded-full ${badgeColor} text-white text-[9px] font-bold flex items-center justify-center`}>
          {badge}
        </span>
      )}
    </div>
  );
}
