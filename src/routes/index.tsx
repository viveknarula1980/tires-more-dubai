import { createFileRoute, Link } from "@tanstack/react-router";
import { SearchWidget } from "@/components/SearchWidget";
import hero from "@/assets/hero-dubai.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tires & More UAE — Premium Tyres in Dubai" },
      { name: "description", content: "Shop Michelin, Bridgestone, Continental, Pirelli & more at competitive Dubai prices. Free fitting, expert advice, fast service." },
      { property: "og:title", content: "Tires & More UAE — Premium Tyres in Dubai" },
      { property: "og:description", content: "Premium tyres at competitive Dubai prices. Free fitting on most orders." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="relative bg-navy text-navy-foreground overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            The right tyres. <span className="text-brand">Right now.</span>
          </h1>
          <p className="mt-4 text-lg text-navy-foreground/80 max-w-2xl mx-auto">
            Dubai's trusted source for premium tyres. Free fitting on orders over AED 500.
          </p>
          <div className="mt-8 max-w-3xl mx-auto">
            <SearchWidget />
          </div>
          <Link to="/shop" className="mt-6 inline-block text-brand font-semibold hover:underline">
            Or browse all tyres →
          </Link>
        </div>
      </section>
    </>
  );
}
