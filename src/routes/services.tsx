import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, Gauge, Disc3, Wind, Droplets, ShieldCheck, MessageCircle, Phone, Clock, Check } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Tyre Fitting, Alignment & Repair in Dubai" },
      { name: "description", content: "Tyre fitting, balancing, 3D wheel alignment, puncture repair, nitrogen inflation and mobile fitting at Tires & More UAE, Al Quoz 4. Open 7 days." },
      { property: "og:title", content: "Workshop Services — Tires & More UAE" },
      { property: "og:description", content: "Tyre fitting, balancing, alignment & repair at our Al Quoz workshop." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    icon: Wrench,
    title: "Tyre fitting & balancing",
    price: "FREE",
    note: "with every set we sell",
    points: ["Touchless fitting machines", "Computerised wheel balancing", "Old tyres disposed responsibly"],
  },
  {
    icon: Gauge,
    title: "3D wheel alignment",
    price: "From AED 100",
    note: "Hunter Hawkeye system",
    points: ["Camera-based precision", "Front & 4-wheel options", "Printed before/after report"],
  },
  {
    icon: Disc3,
    title: "Puncture repair",
    price: "From AED 30",
    note: "Most repairs in 15 min",
    points: ["Mushroom plug repairs", "Run-flat assessment", "Honest go/no-go advice"],
  },
  {
    icon: Wind,
    title: "Nitrogen inflation",
    price: "From AED 20",
    note: "per set of 4",
    points: ["More stable pressure", "Reduced rim corrosion", "Cooler running tyres"],
  },
  {
    icon: Droplets,
    title: "TPMS service",
    price: "From AED 50",
    note: "diagnosis & sensor reset",
    points: ["Sensor battery testing", "Replacement & programming", "Warning light reset"],
  },
  {
    icon: ShieldCheck,
    title: "Mobile fitting",
    price: "On request",
    note: "we come to you",
    points: ["Office & home service", "Same-day in Dubai", "All tools brought on site"],
  },
];

function ServicesPage() {
  return (
    <>
      <section className="bg-navy text-navy-foreground py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-brand font-bold">Workshop services</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
            Everything for your wheels, under one roof
          </h1>
          <p className="mt-4 text-lg text-navy-foreground/80">
            From a quick puncture patch to a full set of premium tyres with 3D alignment — our Al Quoz workshop handles it all, usually while you wait.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 bg-navy-foreground/10 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5 text-brand" /> Open 7 days, 9am–9pm
            </span>
            <span className="inline-flex items-center gap-1 bg-navy-foreground/10 px-3 py-1.5 rounded-full">
              <Check className="h-3.5 w-3.5 text-brand" /> No appointment needed
            </span>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <article key={s.title} className="rounded-xl border border-border bg-background p-6 hover:border-brand hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand">{s.price}</p>
                  <p className="text-[11px] text-muted-foreground">{s.note}</p>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <ul className="mt-3 space-y-1.5">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-brand mt-0.5 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center">How a service visit works</h2>
          <ol className="mt-8 grid md:grid-cols-4 gap-5">
            {[
              ["Drop in or book", "Walk-in welcome, or WhatsApp us a slot."],
              ["Quick inspection", "We confirm tread, age & alignment."],
              ["Service in 30 min", "Most jobs done while you wait."],
              ["Drive away", "Pay on collection — cash, card, transfer."],
            ].map(([t, d], i) => (
              <li key={t} className="bg-background rounded-xl border border-border p-5">
                <div className="h-8 w-8 rounded-full bg-brand text-brand-foreground flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <p className="mt-3 font-bold">{t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="rounded-2xl bg-gradient-to-br from-brand to-brand/70 text-brand-foreground p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Need a service today?</h2>
          <p className="mt-2 opacity-90">Reach us in seconds — most issues solved the same day.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/97142326666" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-white text-navy rounded-md px-6 py-3 font-bold hover:opacity-90">
              <MessageCircle className="h-5 w-5" /> WhatsApp us
            </a>
            <a href="tel:+97142326666" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 rounded-md px-6 py-3 font-bold hover:bg-white/10">
              <Phone className="h-5 w-5" /> +971 4 232 6666
            </a>
            <Link to="/shop" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 rounded-md px-6 py-3 font-bold hover:bg-white/10">
              Browse tyres
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
