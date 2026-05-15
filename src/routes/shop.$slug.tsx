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
          <Link to="/shop" className="hover:text-brand">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{brand?.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10">
          {/* Gallery */}
          <div>
            <div className="bg-background rounded-xl border border-border p-6 relative">
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-brand text-brand-foreground text-sm font-bold px-3 py-1.5 rounded-full z-10">
                  Save {discount}%
                </span>
              )}
              {brand?.name && (
                <div className="absolute top-4 right-4 bg-background border border-border rounded-md px-3 py-2 h-12 w-28 flex items-center justify-center">
                  <BrandLogo
                    name={brand.name}
                    logoUrl={brand.logo_url}
                    className="h-full w-full"
                    textClassName="text-sm"
                  />
                </div>
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
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square rounded-lg border-2 bg-background overflow-hidden ${
                      activeImg === i ? "border-brand" : "border-border hover:border-brand/50"
                    }`}
                  >
                    <img src={g} alt="" className="h-full w-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs uppercase tracking-widest text-brand font-bold">{brand?.name}</p>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">{t.name}</h1>

            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <span className="text-muted-foreground">In stock · Ready to fit</span>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 bg-navy text-navy-foreground px-4 py-2 rounded-md font-mono font-bold">
              {size}
              {t.load_index && <span className="opacity-80">· {t.load_index}</span>}
              {t.speed_rating && <span className="opacity-80">{t.speed_rating}</span>}
            </div>

            {/* Quick specs */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Spec icon={Calendar} label="Year" value={t.year_of_production?.toString() ?? "—"} />
              <Spec icon={Globe} label="Origin" value={t.country_of_origin ?? "—"} />
              <Spec icon={SeasonIcon} label="Season" value={t.season} cap />
              <Spec icon={Gauge} label="Type" value={t.vehicle_type} cap />
            </div>

            {/* Price */}
            <div className="mt-6 rounded-xl border border-border bg-background p-5">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-brand">AED {Number(t.price_aed).toFixed(0)}</span>
                {discount > 0 && (
                  <span className="text-lg line-through text-muted-foreground pb-1">
                    AED {Number(t.original_price_aed).toFixed(0)}
                  </span>
                )}
                <span className="text-sm text-muted-foreground pb-1">/ tyre incl. VAT</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground">
                Set of 4: <span className="text-brand">AED {(Number(t.price_aed) * 4).toFixed(0)}</span>
              </p>

              <div className="mt-4 flex items-stretch gap-3">
                <div className="inline-flex items-center border border-border rounded-md">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-muted">−</button>
                  <span className="px-4 font-bold">{qty}</span>
                  <button onClick={() => setQty(Math.min(20, qty + 1))} className="px-3 py-2 hover:bg-muted">+</button>
                </div>
                <button
                  onClick={() => add(
                    {
                      tire_id: t.id, slug: t.slug, name: t.name,
                      price_aed: Number(t.price_aed),
                      image: t.main_image ?? "/tire-default.jpg", size,
                    },
                    qty
                  )}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-brand text-brand-foreground font-bold py-3 hover:opacity-90"
                >
                  <ShoppingCart className="h-5 w-5" /> Add to quote
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <a href="tel:+97142326666" className="inline-flex items-center justify-center gap-2 rounded-md border border-border py-2.5 text-sm font-semibold hover:border-brand">
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
            </div>

            {/* Trust badges */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Trust icon={Wrench} title="Free fitting" sub="& balancing" />
              <Trust icon={ShieldCheck} title={t.warranty ?? "Full warranty"} sub="manufacturer" />
              <Trust icon={Truck} title="Delivery" sub="across UAE" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 bg-background rounded-xl border border-border overflow-hidden">
          <div className="flex border-b border-border">
            {[
              { id: "description", label: "Description" },
              { id: "specs", label: "Specifications" },
              { id: "shipping", label: "Fitting & Delivery" },
            ].map((x) => (
              <button
                key={x.id}
                onClick={() => setTab(x.id as any)}
                className={`px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  tab === x.id ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>
          <div className="p-6 md:p-8">
            {tab === "description" && (
              <div className="prose-sm max-w-3xl">
                <p className="text-foreground/90 leading-relaxed">
                  {t.description ?? `The ${brand?.name} ${t.name} is engineered for UAE roads — combining grip, durability and a refined ride. Sourced direct, fitted free at our Al Quoz workshop.`}
                </p>
                {t.features && t.features.length > 0 && (
                  <>
                    <h3 className="mt-6 text-base font-bold">Key features</h3>
                    <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                      {t.features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-brand mt-0.5 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
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
              <h2 className="text-2xl font-bold">More tyres in R{t.rim}</h2>
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
