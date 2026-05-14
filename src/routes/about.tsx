import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Tires & More UAE" }] }),
  component: () => (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">About Tires & More</h1>
      <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Dubai's trusted tyre specialists. Coming soon.</p>
    </div>
  ),
});
