import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Gauge,
  Disc3,
  Droplets,
  Truck,
  BatteryCharging,
  ShieldCheck,
  Award,
  Wrench,
  DollarSign,
  Smile,
  MessageCircle,
  Phone,
  Clock,
  Check,
  AlertTriangle,
  Mountain,
  Compass,
  CircleDot,
  Zap,
  Settings,
  Wind,
  
  Car,
} from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Tyre Services in UAE — Alignment, Brakes & Oil" },
      {
        name: "description",
        content:
          "Tires and More offers wheel alignment, brake service, oil service, mobile tyre fitting and mobile battery service across the UAE. Trusted technicians, premium parts.",
      },
      { property: "og:title", content: "Tyre Services in UAE — Tires & More" },
      {
        property: "og:description",
        content:
          "Wheel alignment, brakes, oil service, mobile tyre and mobile battery service across the UAE.",
      },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Service", name: "Wheel Alignment", provider: { "@type": "LocalBusiness", name: "Tires & More UAE" }, areaServed: "AE" },
            { "@type": "Service", name: "Brake Service", provider: { "@type": "LocalBusiness", name: "Tires & More UAE" }, areaServed: "AE" },
            { "@type": "Service", name: "Oil Service", provider: { "@type": "LocalBusiness", name: "Tires & More UAE" }, areaServed: "AE" },
            { "@type": "Service", name: "Mobile Tyre Fitting", provider: { "@type": "LocalBusiness", name: "Tires & More UAE" }, areaServed: "AE" },
            { "@type": "Service", name: "Mobile Battery Service", provider: { "@type": "LocalBusiness", name: "Tires & More UAE" }, areaServed: "AE" },
          ],
        }),
      },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    icon: Gauge,
    title: "Wheel Alignment",
    intro:
      "Ensure your vehicle's wheels are properly aligned for optimal handling and tire longevity. Our state-of-the-art equipment and skilled technicians will get you back on the road with precision alignment.",
    points: [
      "Thorough inspection of your vehicle's wheel alignment, checking for misalignment issues",
      "Advanced alignment equipment for precise adjustments — camber, caster and toe",
      "Adjustments made to bring your wheels back into proper alignment when needed",
      "Test drive to verify smooth handling and responsive steering",
    ],
  },
  {
    icon: Disc3,
    title: "Brakes",
    intro:
      "Trust our experts to inspect, repair or replace your brakes to ensure your safety on the road. We use high-quality brake components and provide professional brake services.",
    points: [
      "New brake rotors",
      "New brake pads",
      "Installation of parts by skilled mechanics",
      "Caliper servicing — cleaning & lubricating of caliper slides",
      "Bleeding of brake fluid system",
    ],
  },
  {
    icon: Droplets,
    title: "Oil Services",
    intro:
      "Regular oil changes are vital for engine health. We offer fast and efficient oil change services with a selection of top-grade oils to suit your vehicle's needs.",
    points: [
      "Premium Pennzoil oil & new premium filter that meets or exceeds your car warranty standards",
      "Service performed by our certified automotive technicians",
      "True Service Inspection report card on the condition of key components",
    ],
  },
  {
    icon: Truck,
    title: "Mobile Tyre Services",
    intro:
      "Convenience at your doorstep! Our mobile tyre service brings tyre installation, repair and replacement to you wherever you are. No more hassles with flat tyres or worn treads.",
    points: [
      "Mount and balance new tyres on your vehicle with proper fitment",
      "Puncture and damaged tyre repair when possible",
      "Tyre replacement on site",
      "Tyre pressure check",
    ],
  },
  {
    icon: BatteryCharging,
    title: "Mobile Battery Services",
    intro:
      "Don't get stranded due to a dead battery. Our mobile battery service delivers and installs reliable batteries, ensuring your vehicle starts when you need it to.",
    points: [
      "Battery diagnostic test to determine the condition of your current battery",
      "New, reliable battery delivered directly to your location when replacement is needed",
      "Professional installation by our experts",
      "Testing and charging system inspection",
    ],
  },
  {
    icon: Mountain,
    title: "Suspension Upgrades",
    intro:
      "Take your vehicle's performance and comfort to the next level with our professional suspension upgrade solutions. Whether you're looking for improved off-road capability, increased ground clearance, or better on-road handling, we provide premium suspension systems from leading global brands.",
    points: [
      "Suspension inspection and consultation",
      "Installation of performance shocks and struts",
      "Lift kit installation",
      "Coil spring upgrades",
      "Suspension tuning and adjustment",
      "Post-installation alignment and testing",
    ],
  },
  {
    icon: Compass,
    title: "Off-Road & 4x4 Modifications",
    intro:
      "Build the ultimate adventure vehicle with our complete range of off-road upgrades. From desert driving to mountain trails, we customize your vehicle to handle the toughest conditions while maintaining reliability and safety.",
    points: [
      "Off-road wheel and tire packages",
      "Snorkel installation",
      "Air compressor installation",
      "Recovery and protection equipment",
      "Lift kits and suspension modifications",
      "Vehicle setup for overlanding and off-road use",
    ],
  },
  {
    icon: CircleDot,
    title: "Alloy Wheels & Tire Packages",
    intro:
      "Enhance your vehicle's appearance and performance with premium alloy wheels and tire combinations. Our experts help you choose the ideal setup based on your driving style and vehicle requirements.",
    points: [
      "Wheel selection and fitment consultation",
      "Premium alloy wheel installation",
      "Tire mounting and balancing",
      "TPMS service and programming",
      "Performance and off-road tire options",
      "Wheel alignment after installation",
    ],
  },
  {
    icon: Zap,
    title: "Performance Accessories",
    intro:
      "Upgrade your vehicle with high-quality accessories designed to improve performance, functionality, and driving enjoyment.",
    points: [
      "Performance air intake systems",
      "On-board air compressor installation",
      "Vehicle accessories installation",
      "Off-road equipment integration",
      "Performance enhancement consultation",
      "Professional installation and testing",
    ],
  },
  {
    icon: Settings,
    title: "Custom Vehicle Builds",
    intro:
      "From simple upgrades to complete transformations, we specialize in building customized vehicles tailored to your vision. Our team works closely with you to create a unique vehicle that stands out both on and off the road.",
    points: [
      "Vehicle customization planning",
      "Suspension and wheel upgrades",
      "Off-road equipment installation",
      "Exterior modifications",
      "Performance accessories",
      "Final inspection and quality control",
    ],
  },
  {
    icon: Mountain,
    title: "Suspension Lift Kits",
    intro:
      "Improve your vehicle's ground clearance, off-road capability, and overall appearance with professional suspension lift kit installations. We offer complete lift solutions designed to enhance performance while maintaining comfort and reliability.",
    points: [
      "Suspension system inspection",
      "Lift kit consultation and selection",
      "Shock absorber upgrades",
      "Coil spring installation",
      "Suspension component adjustments",
      "Wheel alignment and testing",
      "Post-installation inspection",
    ],
  },
  {
    icon: CircleDot,
    title: "Off-Road Wheels & Tires",
    intro:
      "Equip your vehicle with the perfect wheel and tire combination for both on-road comfort and off-road performance. Our specialists help you choose the ideal setup based on your driving needs and terrain requirements.",
    points: [
      "Wheel and tire fitment consultation",
      "Alloy wheel installation",
      "Off-road tire installation",
      "Tire balancing",
      "TPMS service",
      "Wheel alignment",
      "Performance and safety inspection",
    ],
  },
  {
    icon: Wind,
    title: "Snorkel Installation",
    intro:
      "Protect your engine and improve air intake performance with a professionally installed snorkel system. Ideal for off-road driving, dusty environments, and water crossings.",
    points: [
      "Snorkel system installation",
      "Air intake inspection",
      "Sealing and waterproofing checks",
      "Mounting hardware installation",
      "System testing",
      "Final quality inspection",
    ],
  },
  {
    icon: Gauge,
    title: "Air Compressor Installation",
    intro:
      "Stay prepared for every adventure with a reliable onboard air compressor system. Perfect for inflating tires, powering air tools, and supporting off-road equipment.",
    points: [
      "Compressor system installation",
      "Electrical wiring and connections",
      "Air hose setup",
      "Pressure testing",
      "Operational testing",
      "User guidance and support",
    ],
  },
  {
    icon: Car,
    title: "Jeep Wrangler Upgrades",
    intro:
      "Customize your Jeep Wrangler with premium performance and off-road accessories. From suspension upgrades to wheels, tires, and recovery equipment, we help build a Jeep ready for any challenge.",
    points: [
      "Suspension upgrades",
      "Lift kit installation",
      "Off-road wheel and tire packages",
      "Air intake systems",
      "Recovery accessories",
      "Performance upgrades",
      "Complete vehicle inspection",
    ],
  },
  {
    icon: Car,
    title: "Toyota Land Cruiser Upgrades",
    intro:
      "Enhance the capability, durability, and appearance of your Toyota Land Cruiser with professional upgrades designed for adventure and everyday driving.",
    points: [
      "Suspension and lift kits",
      "Premium wheels and tires",
      "Snorkel installation",
      "Air compressor systems",
      "Off-road accessories",
      "Performance enhancements",
      "Vehicle setup and testing",
    ],
  },
  {
    icon: Car,
    title: "Nissan Patrol Upgrades",
    intro:
      "Unlock the full potential of your Nissan Patrol with premium off-road and performance modifications. Our expert team delivers reliable upgrades tailored to your driving style and adventure goals.",
    points: [
      "Suspension upgrades",
      "Lift kit installation",
      "Wheel and tire packages",
      "Snorkel systems",
      "Recovery equipment",
      "Performance accessories",
      "Professional installation and testing",
    ],
  },
];

const whyChoose = [
  { icon: Wrench, title: "Experienced Technicians", desc: "Certified, trained and trusted by thousands of UAE drivers." },
  { icon: Award, title: "Quality Products & Parts", desc: "Only parts that meet or exceed OE (original equipment) specifications." },
  { icon: Truck, title: "Convenient Mobile Services", desc: "Tyre and battery service that comes to your home, office or roadside." },
  { icon: DollarSign, title: "Competitive Pricing", desc: "Honest, all-inclusive packages with no surprise costs." },
  { icon: Smile, title: "Customer Satisfaction Guaranteed", desc: "We're not done until you drive away happy." },
];

function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-navy-foreground py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-brand font-bold">Our Services</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
            A trusted tyre shop in the UAE
          </h1>
          <p className="mt-4 text-lg text-navy-foreground/80">
            Welcome to Tires and More. We offer the largest collection of branded tyres in the country and an
            extensive range of automobile services — from precision wheel alignment to mobile tyre and battery
            assistance anywhere in the UAE.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 bg-navy-foreground/10 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5 text-brand" /> Open 7 days, 9am–9pm
            </span>
            <span className="inline-flex items-center gap-1 bg-navy-foreground/10 px-3 py-1.5 rounded-full">
              <Check className="h-3.5 w-3.5 text-brand" /> Walk-ins welcome
            </span>
          </div>
        </div>
      </section>

      {/* Service cards */}
      <section className="container mx-auto px-4 py-14">
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <article
              key={s.title}
              className="rounded-xl border border-border bg-background p-6 md:p-7 hover:border-brand hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand">0{i + 1}</p>
                  <h2 className="text-xl font-bold leading-tight">{s.title}</h2>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{s.intro}</p>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider font-bold text-navy">What's included</p>
                <ul className="mt-2 space-y-1.5">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-brand mt-0.5 shrink-0" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Why choose */}
      <section className="bg-muted/40 py-14">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold">Why choose Tires and More?</h2>
            <p className="mt-2 text-muted-foreground">
              Five reasons drivers across the UAE keep coming back.
            </p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {whyChoose.map((w) => (
              <div key={w.title} className="bg-background border border-border rounded-xl p-5">
                <w.icon className="h-7 w-7 text-brand" />
                <h3 className="mt-3 font-bold text-sm">{w.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mechanical — Wheel alignment deep dive */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <p className="text-xs uppercase tracking-widest text-brand font-bold">Mechanical</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold">Do I need a wheel alignment?</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          If potholes, gravel roads and other harsh conditions have taken a toll on your vehicle, a wheel
          alignment can ensure you're driving straight and reducing tyre wear.
        </p>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          It doesn't take much to knock a vehicle out of alignment: potholes, curbs and even regular everyday
          driving can affect your suspension system and steering components. Adjusting your wheels back to
          factory spec helps your tyres wear evenly and gives you the best fuel economy possible.
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-border bg-background p-6">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-brand" />
              <h3 className="font-bold">A wheel alignment is recommended when</h3>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {[
                "New tyres are installed",
                "You experience uneven tyre wear, steering pull or an off-center steering wheel",
                "Your vehicle has had an accident or a hard impact with a curb, pothole or road debris",
                "You lower or lift your vehicle",
                "You drive on all-season tyres year-round and it's been 1–2 years since your last alignment",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-brand mt-0.5 shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-background p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-brand" />
              <h3 className="font-bold">Most common signs of misalignment</h3>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {[
                "Your vehicle feels like it's pulling to one side while driving",
                "Uneven tread wear on your tyres",
                "Your front-end shimmies or vibrates after hitting a bump",
                "Your steering wheel is off-centered when driving straight",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-brand mt-0.5 shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-navy text-navy-foreground p-6">
          <h3 className="font-bold">What's included in a wheel alignment service?</h3>
          <p className="mt-2 text-sm text-navy-foreground/80 leading-relaxed">
            Our certified technicians inspect your tyres for uneven wear and perform a precision alignment
            using state-of-the-art computerized technology. This ensures all four wheels are parallel and
            sitting flat on the road, and that your steering wheel is properly centered.
          </p>
        </div>
      </section>

      {/* Brakes deep dive */}
      <section className="bg-muted/40 py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-brand font-bold">Brakes</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">Trust us with your brakes</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            When you need brake work, trust our trained technicians to do the best job at the best price. We
            offer highly competitive pricing, only use parts that meet or exceed OE (original equipment)
            specifications, and provide an industry leading warranty. With easy-to-understand, all-inclusive
            packages, you'll have peace of mind knowing the work being performed without any surprise costs.
            Contact us for a fast, no-obligation estimate for your vehicle.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-background p-6">
            <h3 className="font-bold flex items-center gap-2">
              <Disc3 className="h-5 w-5 text-brand" /> What's included in our brake packages
            </h3>
            <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              {[
                "New brake pads",
                "New brake rotors",
                "Installation of parts by trained technicians",
                "Caliper servicing — cleaning & lubricating of caliper slides",
                "Bleeding of brake fluid system",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-brand mt-0.5 shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Oil service deep dive */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <p className="text-xs uppercase tracking-widest text-brand font-bold">Oil Service</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold">What makes our oil changes better?</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Well, it isn't just an oil change — it's an oil service. First, our certified technicians install
          premium oil and a premium filter. Then we perform our free True Service Inspection and give you a
          report card on the condition of your vehicle's key components.
        </p>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            {
              t: "Premium oil & filter",
              d: "Premium Pennzoil oil & new premium filter that meets or exceeds your car warranty standards.",
            },
            {
              t: "Certified technicians",
              d: "Service performed by our certified automotive technicians, every time.",
            },
            {
              t: "True Service Inspection",
              d: "A free inspection report card on the condition of your vehicle's key components.",
            },
          ].map((b) => (
            <div key={b.t} className="rounded-xl border border-border bg-background p-5">
              <ShieldCheck className="h-6 w-6 text-brand" />
              <h3 className="mt-3 font-bold">{b.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4x4 & Overlanding deep dive */}
      <section className="bg-muted/40 py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-brand font-bold">Adventure Ready</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">4x4 & Overlanding Solutions</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Transform your vehicle into the ultimate adventure machine with our complete 4x4 and overlanding
            solutions. Whether you're preparing for desert expeditions, mountain trails, camping trips, or
            long-distance travel, our team provides professional installations and premium products to ensure
            your vehicle is ready for every journey.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            We specialize in customizing Toyota Land Cruiser, Nissan Patrol, Jeep Wrangler, Ford Ranger,
            Toyota Hilux, and other 4x4 vehicles with industry-leading brands and equipment.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-background p-6">
            <h3 className="font-bold flex items-center gap-2">
              <Compass className="h-5 w-5 text-brand" /> What's included
            </h3>
            <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              {[
                "Suspension lift kits and performance shock absorbers",
                "Off-road wheel and tire packages",
                "Snorkel installation",
                "On-board air compressor systems",
                "Recovery equipment and accessories",
                "Roof racks and cargo solutions",
                "Camping and overlanding accessories",
                "Underbody protection and skid plates",
                "Vehicle setup for off-road and expedition travel",
                "Professional installation and testing",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-brand mt-0.5 shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-5">
            <div className="rounded-xl bg-navy text-navy-foreground p-6">
              <h3 className="font-bold">Why upgrade your 4x4?</h3>
              <p className="mt-2 text-sm text-navy-foreground/80 leading-relaxed">
                A professionally equipped 4x4 provides improved ground clearance, enhanced suspension
                performance, greater carrying capacity, better traction, and increased reliability during
                off-road adventures.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-6">
              <h3 className="font-bold">Our expertise</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Our experienced technicians work with premium off-road brands and proven products to deliver
                reliable upgrades that improve both performance and durability. Every installation is
                performed to the highest standards — keeping your vehicle safe, capable, and adventure-ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-14">
        <div className="rounded-2xl bg-gradient-to-br from-brand to-brand/70 text-brand-foreground p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Need a service today?</h2>
          <p className="mt-2 opacity-90">Reach us in seconds — most issues solved the same day.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/97142326666"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-navy rounded-md px-6 py-3 font-bold hover:opacity-90"
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp us
            </a>
            <a
              href="tel:+97142326666"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 rounded-md px-6 py-3 font-bold hover:bg-white/10"
            >
              <Phone className="h-5 w-5" /> +971 4 232 6666
            </a>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 rounded-md px-6 py-3 font-bold hover:bg-white/10"
            >
              Browse tyres
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
