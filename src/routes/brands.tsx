import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/brands")({
  head: () => ({ meta: [{ title: "Tyre Brands — Tires & More UAE" }] }),
  component: () => (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Brands</h1>
      <p className="mt-2 text-muted-foreground">Coming soon. Browse all tyres on the shop page.</p>
      <Link to="/shop" className="mt-4 inline-block text-brand font-semibold">Shop tyres →</Link>
    </div>
  ),
});
