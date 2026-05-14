import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "Services — Tires & More UAE" }] }),
  component: () => (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Services</h1>
      <p className="mt-2 text-muted-foreground">Tyre fitting, balancing, alignment, and puncture repair. Coming soon.</p>
    </div>
  ),
});
