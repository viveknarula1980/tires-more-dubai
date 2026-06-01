import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { MessageCircle, Phone, Wrench, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
const foxBanner = "/brands/shocks/fox-banner.jpg";
const dobinsonsBanner = "/brands/shocks/dobinsons-banner.jpg";
const radfloBanner = "/brands/shocks/radflo-banner.jpg";
const falconBanner = "/brands/shocks/falcon-banner.jpg";
const foxLogo = "/brands/shocks/fox.png";
const dobinsonsLogo = "/brands/shocks/dobinsons.png";
const radfloLogo = "/brands/shocks/radflo.png";
const falconLogo = "/brands/shocks/falcon.png";

export const Route = createFileRoute("/shocks")({
  head: () => ({
    meta: [
      { title: "Performance Shocks — Fox, Dobinsons, Radflo & Falcon | Tires & More UAE" },
      {
        name: "description",
        content:
          "Premium off-road and performance shock absorbers in Dubai — Fox, Dobinsons, Radflo and Falcon. Get expert advice and pricing on the latest suspension upgrades.",
      },
      { property: "og:title", content: "Performance Shocks — Tires & More UAE" },
      {
        property: "og:description",
        content: "Fox, Dobinsons, Radflo and Falcon shocks — coming soon to our Dubai showroom.",
      },
      { property: "og:image", content: foxBanner },
      { property: "og:url", content: "/shocks" },
    ],
    links: [{ rel: "canonical", href: "/shocks" }],
  }),
  component: ShocksPage,
});

const BRANDS = [
  {
    slug: "fox",
    name: "Fox",
    tagline: "Race-bred performance for trucks, SUVs & UTVs",
    banner: foxBanner,
    logo: foxLogo,
    accent: "from-orange-600/90 via-orange-600/40 to-transparent",
    description:
      "Fox is the gold standard in off-road damping — the same technology that wins Baja, King of the Hammers and Trophy Truck championships. From the daily-driver-friendly 2.0 Performance Series to the no-compromise Factory Race 3.0 bypass shocks, Fox delivers unmatched ride quality on and off the trail.",
    highlights: ["2.0 / 2.5 / 3.0 Coilovers", "Internal & external bypass", "IFP & remote reservoir options"],
  },
  {
    slug: "dobinsons",
    name: "Dobinsons",
    tagline: "Australian-engineered 4x4 suspension since 1953",
    banner: dobinsonsBanner,
    logo: dobinsonsLogo,
    accent: "from-yellow-500/90 via-yellow-500/30 to-transparent",
    description:
      "Born in the Australian outback, Dobinsons builds heavy-duty springs and twin-tube / monotube IMS shocks tuned for fully-loaded touring rigs. The perfect match for Land Cruiser, Patrol, Hilux and Ranger owners who actually use their vehicles.",
    highlights: ["IMS Monotube Remote Reservoir", "Heavy-load coils & leaf packs", "Complete lift kits 2\"–4\""],
  },
  {
    slug: "radflo",
    name: "Radflo",
    tagline: "Made in California, tuned for the desert",
    banner: radfloBanner,
    logo: radfloLogo,
    accent: "from-red-600/90 via-red-600/30 to-transparent",
    description:
      "Radflo Suspension Technology builds every shock by hand in Huntington Beach, CA. Fully rebuildable and revalvable 2.0, 2.5 and 3.0 coilovers and bypass shocks engineered for hard desert miles — a favorite among Tacoma, 4Runner and Jeep builds.",
    highlights: ["OE-replacement & long-travel", "Fully serviceable", "Custom valving available"],
  },
  {
    slug: "falcon",
    name: "Falcon",
    tagline: "Premium ride quality for the Jeep platform",
    banner: falconBanner,
    logo: falconLogo,
    accent: "from-slate-700/90 via-slate-700/30 to-transparent",
    description:
      "Falcon Performance Shocks — by TeraFlex — are purpose-built for Jeep JL, JK and Gladiator. The Sport Tow/Haul, Nexus EF and SP2 3.3 Fast Adjust deliver next-level comfort on highway and trail without the harsh penalty.",
    highlights: ["Jeep-specific tuning", "Fast Adjust knob technology", "Piggyback & remote reservoir"],
  },
];

function ShocksPage() {
  return (
    <div>
      <HeroSlider />
      <IntroStrip />
      <BrandSections />
      <ComingSoonCTA />
    </div>
  );
}

function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {BRANDS.map((b, i) => (
            <div key={b.slug} className="min-w-0 shrink-0 grow-0 basis-full">
              <div className="relative h-[60vh] min-h-[420px] md:h-[78vh] md:min-h-[560px] w-full overflow-hidden bg-black">
                <img
                  src={b.banner}
                  alt={`${b.name} performance shocks`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
                <div className={cn("absolute inset-0 bg-gradient-to-r", b.accent)} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                <div className="relative z-10 container mx-auto h-full px-4 flex flex-col justify-end pb-12 md:pb-20">
                  <div className="max-w-2xl">
                    <div className="bg-white/95 rounded-xl px-5 py-3 inline-flex mb-5 shadow-2xl">
                      <img src={b.logo} alt={b.name} className="h-10 md:h-14 w-auto object-contain" />
                    </div>
                    <p className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[0.95]">
                      {b.name} <span className="text-white/70">Shocks</span>
                    </p>
                    <p className="mt-3 text-base md:text-lg text-white/85 max-w-xl">{b.tagline}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={`#${b.slug}`}
                        className="inline-flex items-center justify-center rounded-md bg-brand px-5 py-3 text-sm font-bold text-brand-foreground hover:brightness-110 transition"
                      >
                        View {b.name} details
                      </a>
                      <a
                        href="https://wa.me/97142326666?text=Hi%2C%20I%27d%20like%20info%20on%20performance%20shocks"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-white/95 hover:bg-white text-navy px-5 py-3 text-sm font-bold transition"
                      >
                        <MessageCircle className="h-4 w-4" /> Enquire on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {BRANDS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              selected === i ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70",
            )}
          />
        ))}
      </div>
    </section>
  );
}

function IntroStrip() {
  return (
    <section className="bg-navy text-navy-foreground py-10 md:py-14">
      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-brand/15 text-brand p-3"><Wrench className="h-6 w-6" /></div>
          <div>
            <h3 className="font-bold text-lg">Expert installation</h3>
            <p className="text-sm opacity-80 mt-1">Suspension specialists with 15+ years of Dubai off-road experience.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-brand/15 text-brand p-3"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <h3 className="font-bold text-lg">Genuine products</h3>
            <p className="text-sm opacity-80 mt-1">Sourced direct from manufacturers and authorized distributors — full warranty.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-brand/15 text-brand p-3"><Sparkles className="h-6 w-6" /></div>
          <div>
            <h3 className="font-bold text-lg">More brands coming</h3>
            <p className="text-sm opacity-80 mt-1">Adding Bilstein, King, ICON and OME — let us know what you ride.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandSections() {
  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        <header className="max-w-3xl mb-12">
          <span className="inline-block text-brand text-xs font-bold uppercase tracking-widest mb-2">
            New arrivals
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Premium shock brands we're bringing to the UAE</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            We're expanding into performance suspension with four of the most respected names in off-road
            damping. Full inventory and online ordering coming soon — in the meantime, reach out for
            pricing, fitment advice and pre-orders.
          </p>
        </header>

        <div className="space-y-16 md:space-y-24">
          {BRANDS.map((b, i) => (
            <div
              key={b.slug}
              id={b.slug}
              className={cn(
                "grid md:grid-cols-2 gap-8 md:gap-12 items-center scroll-mt-24",
                i % 2 === 1 && "md:[&>div:first-child]:order-2",
              )}
            >
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card group">
                <img
                  src={b.banner}
                  alt={`${b.name} shocks`}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className={cn("absolute inset-0 bg-gradient-to-tr opacity-60 pointer-events-none", b.accent)} />
                <div className="absolute top-4 left-4 bg-white/95 rounded-lg px-3 py-2 shadow-lg">
                  <img src={b.logo} alt={b.name} className="h-7 md:h-9 w-auto" />
                </div>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand">
                  0{i + 1} · {b.name}
                </span>
                <h3 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">{b.name} Performance Shocks</h3>
                <p className="mt-1 text-lg text-muted-foreground">{b.tagline}</p>
                <p className="mt-5 text-foreground/80 leading-relaxed">{b.description}</p>
                <ul className="mt-6 space-y-2">
                  {b.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                      <span className="font-medium">{h}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/97142326666?text=Hi%2C%20I%27d%20like%20a%20quote%20on%20${encodeURIComponent(b.name)}%20shocks`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-bold text-brand-foreground hover:brightness-110 transition"
                  >
                    <MessageCircle className="h-4 w-4" /> Get a quote
                  </a>
                  <a
                    href="tel:+97142326666"
                    className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-foreground/15 hover:border-brand px-5 py-3 text-sm font-bold transition"
                  >
                    <Phone className="h-4 w-4" /> Call us
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComingSoonCTA() {
  return (
    <section className="bg-gradient-to-br from-red-900 via-red-950 to-black text-white py-16 md:py-24">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <Sparkles className="h-10 w-10 text-brand mx-auto mb-4" />
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Building your dream rig?</h2>
        <p className="mt-4 text-lg opacity-85">
          Tell us about your vehicle and intended use — daily, overland, desert, rock — and we'll match
          you with the right shock package. Pre-orders are open now for early shipments.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <a
            href="https://wa.me/97142326666?text=Hi%2C%20I%27m%20interested%20in%20performance%20shocks"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-4 text-sm font-bold text-brand-foreground hover:brightness-110 transition"
          >
            <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
          </a>
          <a
            href="tel:+97142326666"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white/10 hover:bg-white/20 px-6 py-4 text-sm font-bold transition"
          >
            <Phone className="h-5 w-5" /> +971 4 232 6666
          </a>
        </div>
      </div>
    </section>
  );
}
