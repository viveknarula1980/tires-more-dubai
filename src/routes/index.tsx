import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Wrench, ShieldCheck, Truck, Clock, Star, ChevronRight, MessageCircle, Phone } from "lucide-react";
import { SearchWidget } from "@/components/SearchWidget";
import { TireCard } from "@/components/TireCard";
import { BrandLogo } from "@/components/BrandLogo";
import { FeaturedSlider } from "@/components/FeaturedSlider";
import { getBrands, getFeaturedTires } from "@/lib/catalog.functions";
import hero from "@/assets/hero-dubai.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tires & More UAE — Premium Tyres in Dubai with Free Fitting" },
      { name: "description", content: "Shop Michelin, Bridgestone, Continental, Pirelli, Goodyear and more at competitive Dubai prices. Free fitting, balancing, alignment. Open 7 days, Al Quoz 4." },
      { property: "og:title", content: "Tires & More UAE — Premium Tyres in Dubai" },
      { property: "og:description", content: "Premium tyres at competitive Dubai prices. Free fitting on most orders." },
    ],
  }),
  component: Home,
});

function Home() {
  const fetchBrands = useServerFn(getBrands);
  const fetchFeatured = useServerFn(getFeaturedTires);
  const brandsQ = useQuery({ queryKey: ["brands"], queryFn: () => fetchBrands() });
  const featuredQ = useQuery({ queryKey: ["featured"], queryFn: () => fetchFeatured() });

  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy text-navy-foreground overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-navy/70 to-navy" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block bg-brand/15 text-brand text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              Dubai's Tyre Specialists Since 2008
            </span>
            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              The right tyres. <span className="text-brand">Right now.</span>
            </h1>
            <p className="mt-4 text-lg text-navy-foreground/80">
              Premium tyres from 14 leading brands. Free fitting, balancing & disposal at our Al Quoz workshop.
            </p>
          </div>
          <div className="mt-10 max-w-3xl mx-auto">
            <SearchWidget />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
            <Link to="/shop" className="inline-flex items-center gap-1 text-brand font-semibold hover:underline">
              Browse all tyres <ChevronRight className="h-4 w-4" />
            </Link>
            <span className="text-navy-foreground/40">·</span>
            <a href="https://wa.me/97142326666" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-brand">
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Wrench, t: "Free fitting", s: "balancing & disposal" },
            { icon: ShieldCheck, t: "Genuine tyres", s: "manufacturer warranty" },
            { icon: Clock, t: "30-min service", s: "while you wait" },
            { icon: Truck, t: "UAE-wide delivery", s: "same-day in Dubai" },
          ].map((x) => (
            <div key={x.t} className="flex items-center gap-3">
              <x.icon className="h-8 w-8 text-brand shrink-0" />
              <div>
                <p className="font-bold text-sm">{x.t}</p>
                <p className="text-xs text-muted-foreground">{x.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand font-bold">This week</p>
            <h2 className="mt-1 text-3xl font-bold">Featured tyres</h2>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-brand hover:underline">View all →</Link>
        </div>
        {featuredQ.isLoading ? (
          <div className="grid sm:grid-cols-2 gap-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {[0, 1].map((groupIdx) => {
              const items = (featuredQ.data ?? []).slice(groupIdx * 3, groupIdx * 3 + 3);
              if (items.length === 0) return null;
              return <FeaturedSlider key={groupIdx} items={items} delay={4000 + groupIdx * 1000} />;
            })}
          </div>
        )}
      </section>

      {/* Brands */}
      <section className="bg-muted/40 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-widest text-brand font-bold">14 premium brands</p>
            <h2 className="mt-1 text-3xl font-bold">Shop tires by brand</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {brandsQ.data?.slice(0, 14).map((b: any) => (
              <Link
                key={b.slug}
                to="/shop"
                search={{ brand: b.slug, vehicle_type: "", season: "", width: 0, profile: 0, rim: 0, sort: "featured" }}
                className="aspect-square bg-background rounded-lg border border-border flex items-center justify-center p-4 hover:border-brand hover:shadow-md transition-all"
              >
                <BrandLogo
                  name={b.name}
                  logoUrl={b.logo_url}
                  className="h-full w-full"
                  textClassName="text-sm md:text-base"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container mx-auto px-4 py-14">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand font-bold">Workshop services</p>
            <h2 className="mt-1 text-3xl font-bold">More than just tyres</h2>
            <p className="mt-3 text-muted-foreground">
              Our certified technicians handle everything that keeps your wheels turning — from precision wheel alignment to instant puncture repair.
            </p>
            <ul className="mt-5 space-y-3">
              {[
                ["Tyre fitting & balancing", "Free with every set we sell"],
                ["3D wheel alignment", "Hunter Hawkeye system"],
                ["Puncture repair", "Patched in 15 minutes"],
                ["Nitrogen inflation", "Maintains pressure longer"],
              ].map(([t, s]) => (
                <li key={t} className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="text-sm text-muted-foreground">{s}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/services" className="mt-6 inline-flex items-center gap-1 text-brand font-semibold hover:underline">
              All services <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="aspect-square bg-navy text-navy-foreground rounded-xl p-6 flex flex-col justify-end">
              <Wrench className="h-8 w-8 text-brand mb-2" />
              <p className="font-bold">Fitting & balancing</p>
              <p className="text-xs opacity-70">From AED 0 with purchase</p>
            </div>
            <div className="aspect-square bg-brand text-brand-foreground rounded-xl p-6 flex flex-col justify-end mt-8">
              <ShieldCheck className="h-8 w-8 mb-2" />
              <p className="font-bold">Wheel alignment</p>
              <p className="text-xs opacity-90">From AED 100</p>
            </div>
            <div className="aspect-square bg-muted rounded-xl p-6 flex flex-col justify-end -mt-8">
              <Clock className="h-8 w-8 text-brand mb-2" />
              <p className="font-bold">Puncture repair</p>
              <p className="text-xs text-muted-foreground">From AED 30</p>
            </div>
            <div className="aspect-square bg-background border border-border rounded-xl p-6 flex flex-col justify-end">
              <Truck className="h-8 w-8 text-brand mb-2" />
              <p className="font-bold">Mobile fitting</p>
              <p className="text-xs text-muted-foreground">At your location</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-navy text-navy-foreground py-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
            </div>
            <h2 className="mt-2 text-3xl font-bold">Trusted by 12,000+ Dubai drivers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: "Ahmed K.", c: "Dubai Marina", q: "Best price on Michelin in Dubai. Fitted in 25 minutes, free coffee, brilliant service." },
              { n: "Sarah M.", c: "JLT", q: "Searched by my Pajero's reg and they had four Bridgestones in stock the same day. Easy." },
              { n: "Rakesh P.", c: "Business Bay", q: "WhatsApp quote in 10 minutes, set of Continentals delivered and fitted at the office." },
            ].map((r) => (
              <div key={r.n} className="bg-navy-foreground/5 border border-navy-foreground/10 rounded-xl p-5">
                <div className="flex gap-1 text-amber-400 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-sm leading-relaxed text-navy-foreground/90">"{r.q}"</p>
                <p className="mt-3 text-xs font-semibold">{r.n} · <span className="opacity-60">{r.c}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-14">
        <div className="rounded-2xl bg-gradient-to-br from-brand to-brand/70 text-brand-foreground p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Need help choosing?</h2>
          <p className="mt-2 opacity-90 max-w-xl mx-auto">
            Send us your tyre size or vehicle reg on WhatsApp and we'll quote within the hour.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/97142326666" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-white text-navy rounded-md px-6 py-3 font-bold hover:opacity-90">
              <MessageCircle className="h-5 w-5" /> WhatsApp +971 4 232 6666
            </a>
            <a href="tel:+97142326666" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 rounded-md px-6 py-3 font-bold hover:bg-white/10">
              <Phone className="h-5 w-5" /> Call now
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
