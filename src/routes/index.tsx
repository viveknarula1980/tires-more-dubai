import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Wrench, ShieldCheck, Truck, Clock, Star, ChevronRight, MessageCircle, Phone, BadgeCheck, Tag, Truck as TruckIcon } from "lucide-react";
import { SearchWidget } from "@/components/SearchWidget";
import { TireCard } from "@/components/TireCard";
import { BrandLogo } from "@/components/BrandLogo";
import { getBrands, getFeaturedTires } from "@/lib/catalog.functions";
import hero from "@/assets/hero-dubai.jpg";
import tyreMichelin from "@/assets/tyre-michelin.png";
import tyreBridgestone from "@/assets/tyre-bridgestone.png";
import tyrePirelli from "@/assets/tyre-pirelli.png";
import tyreContinental from "@/assets/tyre-continental.png";
import tyreGoodyear from "@/assets/tyre-goodyear.png";
import { useEffect, useState } from "react";

const heroSlides = [
  { img: tyreMichelin, brand: "Michelin" },
  { img: tyreBridgestone, brand: "Bridgestone" },
  { img: tyrePirelli, brand: "Pirelli" },
  { img: tyreContinental, brand: "Continental" },
  { img: tyreGoodyear, brand: "Goodyear" },
];

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
      <section className="relative bg-[#0b0d10] text-white overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d10] via-[#0b0d10]/85 to-[#0b0d10]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d10] via-transparent to-transparent" />

        <div className="relative container mx-auto px-4 pt-8 pb-10 md:pt-10 md:pb-14">
          <div className="grid lg:grid-cols-[minmax(0,520px)_1fr] gap-8 items-center">
            {/* Left: search panel */}
            <div className="relative z-10">
              {/* tabs OUTSIDE the panel */}
              <div className="flex items-end gap-8 px-2 mb-0 text-[11px] font-bold uppercase tracking-widest leading-tight">
                <span className="text-white pb-3 border-b-[3px] border-white">Search<br/>Tyres</span>
                <span className="text-white/45 pb-3 border-b-[3px] border-transparent cursor-default">Package<br/>Tyres / Wheels</span>
                <span className="text-white/45 pb-3 border-b-[3px] border-transparent cursor-default">UTV &<br/>Trailer Tyres</span>
              </div>
              <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-tr-2xl rounded-b-2xl p-5 md:p-6 shadow-2xl">
                <SearchWidget />
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm px-2">
                <Link to="/shop" className="inline-flex items-center gap-1 text-amber-400 font-semibold hover:underline">
                  Browse all tyres <ChevronRight className="h-4 w-4" />
                </Link>
                <span className="text-white/30">·</span>
                <a href="https://wa.me/97142326666" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-white/80 hover:text-amber-400">
                  <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Right: tyre + promo */}
            <div className="relative hidden lg:block min-h-[460px]">
              <img
                src={heroTyre}
                alt="Premium tyre"
                width={1024}
                height={1024}
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[420px] w-auto object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]"
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-right">
                <div className="font-display leading-[0.82]">
                  <span className="block text-[7rem] xl:text-[10rem] font-extrabold text-white tracking-tighter">
                    10<span className="text-emerald-400 align-top text-[3rem] xl:text-[4rem]">%</span>
                  </span>
                  <span className="block text-5xl xl:text-7xl font-extrabold text-white -mt-2">OFF</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 bg-emerald-500 text-emerald-950 px-3 py-2 rounded-md border-2 border-dashed border-emerald-900/40 font-bold text-sm">
                  <span className="text-[10px] uppercase tracking-widest opacity-80 leading-tight text-left">Promo<br/>Code</span>
                  <span className="text-lg">REBATE10</span>
                </div>
                <p className="mt-2 text-[10px] text-white/70 uppercase tracking-wider">On purchases of AED 1,500+</p>
              </div>
            </div>
          </div>

          {/* Headline below — like reference fineprint */}
          <p className="mt-6 max-w-3xl text-xs text-white/55 leading-relaxed">
            Minimum AED 1,500 before VAT, valid on new purchases of 4 selected tyres or wheels for a limited time. Cannot be combined with other promotions.
          </p>
        </div>

        {/* Trust strip */}
        <div className="relative border-t border-white/10 bg-black/60 backdrop-blur">
          <div className="container mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, t: "FREE PROTECTION", s: "Against road hazards" },
              { icon: Tag, t: "BEST PRICE GUARANTEE", s: "We beat the competition" },
              { icon: TruckIcon, t: "FREE DELIVERY", s: "Or at the best price" },
              { icon: Star, t: "4.9 / 5 ON GOOGLE", s: "Over 2,000 reviews" },
            ].map((x) => (
              <div key={x.t} className="flex items-center gap-3 text-white">
                <x.icon className="h-7 w-7 text-brand shrink-0" />
                <div>
                  <p className="font-bold text-xs tracking-wide">{x.t}</p>
                  <p className="text-[11px] text-white/60 uppercase tracking-wider">{x.s}</p>
                </div>
              </div>
            ))}
          </div>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredQ.data?.slice(0, 4).map((t: any) => <TireCard key={t.id} t={t} />)}
          </div>
        )}
      </section>

      {/* Brands */}
      <section className="relative bg-[#0b0d10] text-white py-16">
        {/* ribbon */}
        <div className="absolute left-1/2 -top-px -translate-x-1/2 z-10">
          <div className="relative bg-navy text-white px-8 py-3 text-center shadow-lg"
               style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 16px) 100%, 16px 100%)" }}>
            <p className="text-[10px] uppercase tracking-widest text-white/60">Exclusivity</p>
            <p className="text-sm font-bold uppercase tracking-wider">Tires &amp; More UAE</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pt-8">
          <div className="grid lg:grid-cols-[320px_1fr] gap-10 items-center">
            {/* Left: Free protection panel */}
            <div>
              <h2 className="font-display text-5xl md:text-6xl font-extrabold text-amber-400 leading-none">FREE!</h2>
              <p className="mt-3 text-lg font-bold tracking-wide uppercase">Road Hazard Protection</p>
              <div className="mt-5 flex items-start gap-4">
                <div className="border border-amber-400/60 rounded-md px-3 py-2 text-center shrink-0">
                  <p className="text-[10px] uppercase tracking-widest text-amber-400">Value of</p>
                  <p className="text-xl font-extrabold text-amber-400">AED 400</p>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  Applicable to the purchase of 4 tyres from the eligible brands listed.
                </p>
              </div>
              <Link to="/services" className="mt-4 inline-block text-amber-400 text-sm font-semibold underline underline-offset-4 hover:text-amber-300">
                More details →
              </Link>
            </div>

            {/* Right: brands grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {(brandsQ.data?.length ? brandsQ.data.slice(0, 14) : Array.from({ length: 12 })).map((b: any, i: number) => (
                b ? (
                  <Link
                    key={b.slug}
                    to="/shop"
                    search={{ brand: b.slug, vehicle_type: "", season: "", width: 0, profile: 0, rim: 0, sort: "featured" }}
                    className="aspect-[3/2] bg-white rounded-md flex items-center justify-center p-3 hover:scale-[1.04] transition-transform shadow-md"
                  >
                    <BrandLogo
                      name={b.name}
                      logoUrl={b.logo_url}
                      className="h-full w-full bg-transparent"
                      textClassName="text-xs md:text-sm text-navy"
                    />
                  </Link>
                ) : (
                  <div key={i} className="aspect-[3/2] bg-white/5 rounded-md animate-pulse" />
                )
              ))}
            </div>

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
