import { createFileRoute } from "@tanstack/react-router";
import { Phone, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Tires & More UAE" }] }),
  component: () => (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <h1 className="text-3xl font-bold">Contact us</h1>
      <p className="mt-2 text-muted-foreground">Al Quoz 4 Industrial, Dubai · Open Mon–Sun, 9am–9pm.</p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <a href="tel:+97142326666" className="inline-flex items-center gap-2 rounded-md bg-brand text-brand-foreground px-5 py-3 font-semibold">
          <Phone className="h-5 w-5" /> +971 4 232 6666
        </a>
        <a href="https://wa.me/97142326666" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-[#25D366] text-white px-5 py-3 font-semibold">
          <MessageCircle className="h-5 w-5" /> WhatsApp
        </a>
      </div>
    </div>
  ),
});
