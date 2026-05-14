import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Award, Users, MapPin, Clock, Phone, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Tires & More UAE — Dubai Tyre Specialists" },
      { name: "description", content: "Tires & More is Dubai's trusted tyre specialist — premium brands, certified technicians, free fitting. Serving the UAE for over a decade from Al Quoz 4." },
      { property: "og:title", content: "About Tires & More UAE" },
      { property: "og:description", content: "Dubai's trusted tyre specialist. Premium brands, free fitting, expert advice." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="bg-navy text-navy-foreground py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-brand font-bold">About us</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
            Dubai's tyre specialists
          </h1>
          <p className="mt-4 text-lg text-navy-foreground/80">
            For over a decade we've kept Dubai moving — fitting genuine, premium tyres at fair prices, with a level of service that brings drivers back for every change.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="grid md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
          <div>
            <h2 className="text-3xl font-bold">Our story</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Tires & More opened its doors in Al Quoz with a simple promise: every driver in the UAE should have access to genuine, premium tyres without dealership markups, and without the guesswork.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Today we stock 14 leading brands — from Michelin and Bridgestone to Continental, Pirelli, Goodyear and Dunlop — and our certified technicians fit thousands of sets every year for taxis, fleets, families and supercar owners alike.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Whether you walk in, call, WhatsApp, or order online, you get the same straight answer: the right tyre, fitted properly, at the best price we can offer.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat n="14+" l="Premium brands" />
            <Stat n="12,000+" l="Drivers served" />
            <Stat n="30 min" l="Avg. fitting time" />
            <Stat n="7 days" l="Open every week" />
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">What we stand for</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { i: ShieldCheck, t: "Genuine tyres only", d: "Direct from authorised distributors. Every tyre carries full manufacturer warranty and a fresh production date." },
              { i: Award, t: "Certified technicians", d: "Our fitters are trained to manufacturer standards and use Hunter alignment systems for precision every time." },
              { i: Users, t: "Honest advice", d: "We'll never sell you a tyre you don't need. Most cars need a recommendation, not an upsell — and we treat them that way." },
            ].map((v) => (
              <div key={v.t} className="bg-background border border-border rounded-xl p-6">
                <v.i className="h-8 w-8 text-brand" />
                <h3 className="mt-3 font-bold">{v.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-xl bg-navy text-navy-foreground p-8">
            <MapPin className="h-7 w-7 text-brand" />
            <h3 className="mt-3 text-xl font-bold">Visit our workshop</h3>
            <p className="mt-2 text-navy-foreground/80">Al Quoz 4 Industrial Area, Dubai, United Arab Emirates</p>
            <p className="mt-1 text-sm text-navy-foreground/60">Easy parking · Customer lounge · Free WiFi</p>
          </div>
          <div className="rounded-xl bg-background border border-border p-8">
            <Clock className="h-7 w-7 text-brand" />
            <h3 className="mt-3 text-xl font-bold">Open 7 days</h3>
            <p className="mt-2 text-muted-foreground">Monday – Sunday · 9:00am – 9:00pm</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="tel:+97142326666" className="inline-flex items-center gap-2 bg-brand text-brand-foreground rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90">
                <Phone className="h-4 w-4" /> Call
              </a>
              <a href="https://wa.me/97142326666" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <Link to="/shop" className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-semibold hover:border-brand">
                Shop tyres
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-5 text-center">
      <p className="text-3xl font-bold text-brand">{n}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{l}</p>
    </div>
  );
}
