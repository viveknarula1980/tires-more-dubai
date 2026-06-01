import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

import { Wrench, ShieldCheck, Truck, Clock, Star, ChevronRight, MessageCircle, Phone, Users, Gauge, Disc3, Droplets, BatteryCharging, Check, Mountain, Compass, Zap } from "lucide-react";
import { SearchWidget } from "@/components/SearchWidget";
import { TireCard } from "@/components/TireCard";
import { BrandLogo } from "@/components/BrandLogo";
import { FeaturedSlider } from "@/components/FeaturedSlider";
import { getBrands, getFeaturedTires } from "@/lib/catalog.functions";
import hero from "@/assets/hero-dubai.jpg";
import wheelsImg from "@/assets/home-wheels.jpg";
import shocksImg from "@/assets/home-shocks.jpg";

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
      <section className="bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="relative w-full bg-navy rounded-2xl overflow-hidden shadow-2xl border-b-4 border-brand">
            <div className="absolute top-0 right-0 h-full w-32 bg-white/5 -skew-x-12 transform translate-x-16 pointer-events-none" />
            <div className="relative grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
              {[
                { icon: Wrench, t: "Free fitting", s: "balancing & disposal" },
                { icon: ShieldCheck, t: "Genuine tyres", s: "manufacturer warranty" },
                { icon: Clock, t: "30-min service", s: "while you wait" },
                { icon: Users, t: "Expert team", s: "Certified technicians" },
              ].map((x) => (
                <div key={x.t} className="flex items-center p-6 md:p-8 transition-colors hover:bg-white/5 group">
                  <div className="flex-shrink-0 mr-5">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-brand/50 transition-colors">
                      <x.icon className="h-8 w-8 text-brand" strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-extrabold uppercase tracking-tight leading-tight group-hover:text-brand transition-colors">{x.t}</h3>
                    <p className="text-blue-200/60 text-xs font-medium uppercase tracking-wider mt-1">{x.s}</p>
                  </div>
                </div>
              ))}
            </div>
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
                className="h-20 bg-background rounded-lg border border-border flex items-center justify-center p-2 hover:border-brand hover:shadow-md transition-all"
              >
                <BrandLogo
                  name={b.name}
                  logoUrl={b.logo_url}
                  className="h-full w-full"
                  textClassName="text-xs md:text-sm"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Alloy Wheels */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 text-white py-14">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1 relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={wheelsImg} alt="Premium alloy wheel" loading="lazy" width={1024} height={1024} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-5 left-5 text-white font-bold text-lg">Premium alloy wheels</span>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-xs uppercase tracking-widest text-brand font-bold">Wheels</p>
              <h2 className="mt-1 text-3xl md:text-4xl font-bold">Transform your ride with alloy wheels</h2>
              <p className="mt-3 text-white/80">
                Stand out on Dubai's roads with a curated range of premium alloy wheels — from sleek OEM upgrades to bold aftermarket designs. Sizes 15" to 24" with expert fitment.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {["Top global brands & finishes", "Professional fitting & balancing", "Tyre + wheel package deals"].map((t) => (
                  <li key={t} className="flex gap-2"><ChevronRight className="h-5 w-5 text-brand shrink-0" /> {t}</li>
                ))}
              </ul>
              <Link to="/rims" className="mt-6 inline-flex items-center gap-2 bg-brand text-brand-foreground px-5 py-3 rounded-md font-bold hover:opacity-90">
                Browse wheels <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Shocks */}
      <section className="bg-gradient-to-br from-red-900 via-red-950 to-black text-white py-14">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-brand font-bold">Suspension</p>
              <h2 className="mt-1 text-3xl md:text-4xl font-bold">Performance shocks for every terrain</h2>
              <p className="mt-3 text-white/80">
                Dial in your 4x4, SUV or pickup with premium shocks from the world's top suspension brands. Built for dunes, highways and everything in between.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {["Off-road & on-road tuning", "Lift kits & complete setups", "Expert installation in Al Quoz"].map((t) => (
                  <li key={t} className="flex gap-2"><ChevronRight className="h-5 w-5 text-brand shrink-0" /> {t}</li>
                ))}
              </ul>
              <Link to="/shocks" className="mt-6 inline-flex items-center gap-2 bg-brand text-brand-foreground px-5 py-3 rounded-md font-bold hover:opacity-90">
                Explore shocks <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={shocksImg} alt="Performance shock absorber" loading="lazy" width={1024} height={1024} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-5 left-5 text-white font-bold text-lg">Built for the dunes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container mx-auto px-4 py-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-widest text-brand font-bold">Workshop services</p>
          <h2 className="mt-1 text-3xl font-bold">More than just tyres</h2>
          <p className="mt-3 text-muted-foreground">
            Our certified technicians handle everything that keeps your wheels turning — from precision wheel alignment and brake service to suspension upgrades and off-road modifications.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {[
            {
              icon: Mountain,
              title: "Suspension Upgrades",
              desc: "Premium shocks, lift kits and coil springs from leading global brands for improved off-road capability and on-road comfort.",
              points: [
                "Suspension inspection & consultation",
                "Performance shocks & struts installation",
                "Lift kit & coil spring upgrades",
                "Post-installation alignment & testing",
              ],
            },
            {
              icon: Compass,
              title: "Off-Road & 4×4 Modifications",
              desc: "Build the ultimate adventure vehicle with desert-ready upgrades — snorkels, recovery gear, lift kits and more.",
              points: [
                "Off-road wheel & tire packages",
                "Snorkel & air compressor installation",
                "Recovery & protection equipment",
                "Lift kits & suspension modifications",
              ],
            },
            {
              icon: Zap,
              title: "Performance Accessories",
              desc: "High-quality accessories to improve power, functionality and driving enjoyment.",
              points: [
                "Performance air intake systems",
                "On-board air compressor installation",
                "Off-road equipment integration",
                "Professional installation & testing",
              ],
            },
            {
              icon: Gauge,
              title: "Wheel Alignment",
              desc: "State-of-the-art equipment and skilled technicians for optimal handling and tyre longevity.",
              points: [
                "Thorough inspection & precise adjustments",
                "Camber, caster & toe calibration",
                "Test drive to verify smooth handling",
              ],
            },
            {
              icon: Disc3,
              title: "Brakes",
              desc: "Inspect, repair or replace brakes with high-quality components for your safety on the road.",
              points: [
                "New brake rotors & pads",
                "Caliper servicing & lubrication",
                "Brake fluid system bleeding",
              ],
            },
            {
              icon: Droplets,
              title: "Oil Services",
              desc: "Fast, efficient oil changes with premium Pennzoil and a free True Service Inspection.",
              points: [
                "Premium oil & filter (meets warranty standards)",
                "Certified automotive technicians",
                "Free inspection report card",
              ],
            },
          ].map((s) => (
            <div key={s.title} className="rounded-xl border border-border bg-background p-6 hover:border-brand hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              <ul className="mt-3 space-y-1">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-brand mt-0.5 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/services" className="inline-flex items-center gap-1 text-brand font-semibold hover:underline">
            All services <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Follow Us */}
      <section className="bg-navy text-navy-foreground py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs uppercase tracking-widest text-brand font-bold">Follow us</p>
            <h2 className="mt-2 text-3xl font-bold">@tiresandmore.ae</h2>
            <p className="mt-3 text-navy-foreground/80">
              See our latest builds, behind-the-scenes workshop shots, and daily deals.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://www.instagram.com/tiresandmore.ae/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-md px-6 py-3 font-bold hover:opacity-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                Follow on Instagram
              </a>
              <a
                href="https://www.tiktok.com/@tiresandmore.ae"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#010101] text-white rounded-md px-6 py-3 font-bold hover:opacity-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.89 2.89 2.89 0 0 1 2.88-2.88c.26 0 .5.03.74.09V9.38a6.37 6.37 0 0 0-.74-.04A6.36 6.36 0 0 0 3.38 15.7a6.36 6.36 0 0 0 6.36 6.36 6.36 6.36 0 0 0 6.36-6.36V8.73a8.08 8.08 0 0 0 4.77 1.56V6.92a4.83 4.83 0 0 1-1.28-.23z"/></svg>
                Follow on TikTok
              </a>
            </div>
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
