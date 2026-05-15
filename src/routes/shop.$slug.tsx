import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  ShoppingCart, Check, Truck, ShieldCheck, Wrench, MessageCircle,
  Phone, Star, Snowflake, Sun, CloudSun, Heart, RotateCcw, Lock,
  Droplet, Volume2, Route as RouteIcon, Zap,
  ZoomIn, X, ChevronLeft, ChevronRight, Plus, Minus,
} from "lucide-react";
import { getTireBySlug, searchTires } from "@/lib/catalog.functions";
import { useCart } from "@/lib/cart";
import { TireCard } from "@/components/TireCard";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/shop/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Tires & More UAE` },
      { name: "description", content: "Premium tyre with free fitting in Dubai. Genuine product, latest production year, full warranty." },
    ],
  }),
  component: TireDetail,
});

function TireDetail() {
  const { slug } = Route.useParams();
  const fetchTire = useServerFn(getTireBySlug);
  const fetchRelated = useServerFn(searchTires);
  const { add } = useCart();
  const [qty, setQty] = useState(4);
  const [tab, setTab] = useState<"description" | "specs" | "shipping">("description");
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data: t, isLoading } = useQuery({
    queryKey: ["tire", slug],
    queryFn: () => fetchTire({ data: { slug } }),
  });

  const { data: related } = useQuery({
    enabled: !!t,
    queryKey: ["related", t?.id],
    queryFn: () => fetchRelated({ data: { rim: t!.rim, limit: 8 } as any }),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-muted rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            <div className="h-12 bg-muted rounded w-1/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!t) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Tyre not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-brand font-semibold">← Back to shop</Link>
      </div>
    );
  }

  const size = `${t.width}/${t.profile} R${t.rim}`;
  const brand: any = (t as any).brand;
  const gallery: string[] = [
    t.main_image ?? "/tire-default.jpg",
    ...(((t as any).gallery_images as string[] | null) ?? []),
  ].filter(Boolean);
  const discount = t.original_price_aed && Number(t.original_price_aed) > Number(t.price_aed)
    ? Math.round((1 - Number(t.price_aed) / Number(t.original_price_aed)) * 100)
    : 0;
  const seasonIcon = t.season === "winter" ? Snowflake : t.season === "summer" ? Sun : CloudSun;
  const SeasonIcon = seasonIcon;

  const relatedFiltered = (related ?? []).filter((r: any) => r.id !== t.id).slice(0, 4);

  return (
    <div className="bg-muted/30">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-brand">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-brand">Tires</Link>
          <span className="mx-2">/</span>
          <span className="text-muted-foreground">{size}</span>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">{t.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[80px_1fr_360px] gap-6 lg:gap-8 items-start">
          {/* Vertical thumbnails */}
          {gallery.length > 1 && (
            <div className="hidden lg:flex flex-col gap-3 order-1">
              {gallery.slice(0, 5).map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-md border-2 bg-background overflow-hidden ${
                    activeImg === i ? "border-brand" : "border-border hover:border-brand/50"
                  }`}
                >
                  <img src={g} alt="" className="h-full w-full object-contain p-1.5" />
                </button>
              ))}
            </div>
          )}

          {/* Main image + middle info: span 2 cols on smaller, custom layout */}
          <div className="order-2 lg:contents">
            {/* Image */}
            <div className="relative bg-background rounded-xl border border-border p-6 order-1">
              {discount > 0 && (
                <span className="absolute top-4 left-4 z-10 bg-brand text-brand-foreground text-xs font-bold px-3 py-1.5 rounded-md">
                  Save {discount}%
                </span>
              )}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="group block w-full cursor-zoom-in"
                aria-label="Open full-size image"
              >
                <img
                  src={gallery[activeImg]}
                  alt={t.name}
                  className="w-full aspect-square object-contain transition-transform group-hover:scale-[1.02]"
                />
              </button>
              <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-foreground/80 text-background px-3 py-1.5 text-xs font-semibold backdrop-blur pointer-events-none">
                <ZoomIn className="h-3.5 w-3.5" /> Click to enlarge
              </span>
            </div>

            {/* Middle column: title, price, size, chips */}
            <div className="order-2 lg:px-2">
              {brand?.name && (
                <div className="h-10 w-36 mb-3">
                  <BrandLogo
                    name={brand.name}
                    logoUrl={brand.logo_url}
                    className="h-full w-full bg-transparent justify-start"
                    textClassName="text-lg"
                  />
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-navy">
                {t.name}
              </h1>

              <div className="mt-3 flex items-center gap-3 text-sm">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < 4 ? "fill-current" : "fill-current opacity-40"}`} />
                  ))}
                </div>
                <span className="text-muted-foreground">4.6 (128 reviews)</span>
                <span className="text-border">|</span>
                <a href="#reviews" className="text-brand font-semibold hover:underline">Write a review</a>
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-4xl font-bold text-brand">AED {Number(t.price_aed).toFixed(0)}</span>
                {discount > 0 && (
                  <span className="text-xl line-through text-muted-foreground">
                    AED {Number(t.original_price_aed).toFixed(0)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Per Tire <span className="opacity-70">(VAT included)</span></p>

              <div className="mt-4 flex items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                  <Check className="h-4 w-4" /> In Stock
                </span>
                <span className="text-muted-foreground">SKU: {t.id.slice(0, 6).toUpperCase()}</span>
              </div>

              {/* Size box */}
              <div className="mt-5 flex items-center gap-4 rounded-xl border border-border bg-background p-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <RouteIcon className="h-6 w-6 text-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-base text-navy">
                    {size}{t.load_index ? ` ${t.load_index}` : ""}{t.speed_rating ?? ""}
                  </p>
                  <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    <span>Width: <span className="text-foreground font-semibold">{t.width}</span></span>
                    <span>Aspect: <span className="text-foreground font-semibold">{t.profile}</span></span>
                    <span>Rim: <span className="text-foreground font-semibold">{t.rim}</span></span>
                    {t.load_index && <span>Load: <span className="text-foreground font-semibold">{t.load_index}</span></span>}
                    {t.speed_rating && <span>Speed: <span className="text-foreground font-semibold">{t.speed_rating}</span></span>}
                  </div>
                </div>
              </div>

              {/* Feature chips */}
              <div className="mt-5 grid grid-cols-5 gap-2">
                <FeatureChip icon={SeasonIcon} top={t.season ?? "All"} bottom="Season" />
                <FeatureChip icon={Zap} top="High" bottom="Performance" />
                <FeatureChip icon={Droplet} top="Wet" bottom="Traction" badge="A" badgeColor="bg-emerald-500" />
                <FeatureChip icon={Volume2} top="Low" bottom="Noise" badge="B" badgeColor="bg-amber-500" />
                <FeatureChip icon={ShieldCheck} top={t.warranty ?? "60K"} bottom="Warranty" />
              </div>
            </div>
          </div>

          {/* Right: Sticky checkout card */}
          <aside className="order-3 lg:sticky lg:top-6">
            <div className="rounded-xl border border-border bg-background p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Quantity</span>
                <div className="inline-flex items-center border border-border rounded-md">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2 hover:bg-muted"
                    aria-label="Decrease"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 font-bold text-base min-w-[3rem] text-center">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(20, qty + 1))}
                    className="px-3 py-2 hover:bg-muted"
                    aria-label="Increase"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => add(
                  {
                    tire_id: t.id, slug: t.slug, name: t.name,
                    price_aed: Number(t.price_aed),
                    image: t.main_image ?? "/tire-default.jpg", size,
                  },
                  qty,
                )}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-brand text-brand-foreground font-bold py-3.5 hover:opacity-90 uppercase tracking-wide"
              >
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </button>

              <Link
                to="/cart"
                onClick={() => add(
                  {
                    tire_id: t.id, slug: t.slug, name: t.name,
                    price_aed: Number(t.price_aed),
                    image: t.main_image ?? "/tire-default.jpg", size,
                  },
                  qty,
                )}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md border-2 border-border bg-background text-foreground font-bold py-3 hover:border-brand uppercase tracking-wide"
              >
                Buy Now
              </Link>

              <div className="flex items-start gap-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                <div className="h-9 w-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Wrench className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Fitting Included</p>
                  <p className="text-[11px] text-emerald-700/80 mt-0.5 leading-snug">
                    Free fitting, balancing, and valve installation.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <BenefitRow icon={Truck} title="Fast Delivery" sub="1–2 Days" />
                <BenefitRow icon={Lock} title="Secure Payment" sub="100% Secure Checkout" />
                <BenefitRow icon={RotateCcw} title="Easy Returns" sub="14-Day Return Policy" />
              </div>

              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border py-2.5 text-sm font-semibold hover:border-brand transition-colors"
              >
                <Heart className="h-4 w-4" /> Save for Later
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href="tel:+97142326666" className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background py-2.5 text-sm font-semibold hover:border-brand">
                <Phone className="h-4 w-4" /> Call
              </a>
              <a
                href={`https://wa.me/97142326666?text=${encodeURIComponent(`Hi, I'm interested in ${t.name} (${size})`)}`}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] text-white py-2.5 text-sm font-semibold hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </aside>
        </div>

        {/* Tabs */}
        <div className="mt-12 bg-background rounded-xl border border-border overflow-hidden">
          <div className="flex border-b border-border overflow-x-auto">
            {[
              { id: "description", label: "Description" },
              { id: "specs", label: "Specifications" },
              { id: "shipping", label: "Fitting & Delivery" },
            ].map((x) => (
              <button
                key={x.id}
                onClick={() => setTab(x.id as any)}
                className={`px-5 py-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${
                  tab === x.id ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>
          <div className="p-6 md:p-8">
            {tab === "description" && (
              <div className="grid md:grid-cols-[1fr_280px] gap-8">
                <div className="max-w-3xl">
                  <h3 className="text-lg font-bold uppercase tracking-tight">Built for Excitement. Made to Last.</h3>
                  <p className="mt-3 text-foreground/90 leading-relaxed text-sm">
                    {t.description ?? `The ${brand?.name} ${t.name} is engineered for UAE roads — combining grip, durability and a refined ride. Sourced direct, fitted free at our Al Quoz workshop.`}
                  </p>
                  {t.features && t.features.length > 0 && (
                    <ul className="mt-5 space-y-2">
                      {t.features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-brand mt-0.5 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <aside className="rounded-xl border border-border bg-muted/30 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Need help choosing?</p>
                  <p className="mt-2 text-sm text-foreground/80">
                    Our tyre experts are here to help you find the perfect fit for your vehicle.
                  </p>
                  <div className="mt-4 space-y-2 text-sm">
                    <a href="https://wa.me/97142326666" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand">
                      <MessageCircle className="h-4 w-4 text-emerald-600" /> Chat on WhatsApp
                    </a>
                    <a href="tel:+97142326666" className="flex items-center gap-2 hover:text-brand">
                      <Phone className="h-4 w-4 text-brand" /> Call Us: +971 4 232 6666
                    </a>
                  </div>
                </aside>
              </div>
            )}
            {tab === "specs" && (
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-3xl text-sm">
                {[
                  ["Brand", brand?.name],
                  ["Model", t.model ?? t.name],
                  ["Size", size],
                  ["Width", `${t.width} mm`],
                  ["Aspect ratio", `${t.profile}%`],
                  ["Rim diameter", `R${t.rim}`],
                  ["Load index", t.load_index],
                  ["Speed rating", t.speed_rating],
                  ["Season", t.season],
                  ["Vehicle type", t.vehicle_type],
                  ["Year of production", t.year_of_production],
                  ["Country of origin", t.country_of_origin],
                  ["Warranty", t.warranty],
                ].map(([k, v]) => v ? (
                  <div key={k as string} className="flex justify-between border-b border-border py-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-semibold capitalize">{String(v)}</dd>
                  </div>
                ) : null)}
              </dl>
            )}
            {tab === "shipping" && (
              <div className="max-w-3xl space-y-3 text-sm">
                <p><strong>Free fitting & balancing</strong> on every set at our Al Quoz 4 workshop — usually completed within 30 minutes.</p>
                <p><strong>Delivery across UAE.</strong> Same-day delivery available in Dubai for orders confirmed before 2pm.</p>
                <p><strong>Old tyres disposed</strong> responsibly at no extra cost.</p>
                <p><strong>Payment</strong> on collection — cash, card or bank transfer. No payment required to reserve.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {relatedFiltered.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between mb-5">
              <h2 className="text-2xl font-bold uppercase tracking-tight">Customers Also Bought</h2>
              <Link to="/shop" className="text-sm font-semibold text-brand hover:underline">View all →</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedFiltered.map((r: any) => <TireCard key={r.id} t={r} />)}
            </div>
          </section>
        )}
      </div>

      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={gallery}
        index={activeImg}
        setIndex={setActiveImg}
        alt={t.name}
      />
    </div>
  );
}

function Lightbox({
  open, onClose, images, index, setIndex, alt,
}: {
  open: boolean; onClose: () => void; images: string[];
  index: number; setIndex: (i: number) => void; alt: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft") setIndex((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, index, images.length, onClose, setIndex]);

  if (!open) return null;
  const multi = images.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {multi && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIndex((index - 1 + images.length) % images.length); }}
            className="absolute left-4 md:left-8 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
            aria-label="Previous"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIndex((index + 1) % images.length); }}
            className="absolute right-4 md:right-8 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
            aria-label="Next"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </>
      )}

      <img
        src={images[index]}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[90vw] object-contain select-none"
      />

      {multi && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-white/10 backdrop-blur rounded-full p-2"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((g, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-12 w-12 rounded-md overflow-hidden border-2 transition ${
                i === index ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={g} alt="" className="h-full w-full object-contain bg-white/90 p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Spec({ icon: Icon, label, value, cap }: { icon: any; label: string; value: string; cap?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className={`mt-1 text-sm font-bold ${cap ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}

function Trust({ icon: Icon, title, sub }: { icon: any; title: string; sub: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3 text-center">
      <Icon className="h-5 w-5 text-brand mx-auto" />
      <p className="mt-1 text-xs font-bold leading-tight">{title}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}
