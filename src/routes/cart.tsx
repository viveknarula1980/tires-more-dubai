import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2, MessageCircle, CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { submitInquiry } from "@/lib/inquiry.functions";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Quote Cart — Tires & More UAE" },
      { name: "description", content: "Review your selected tyres and request a no-obligation quote. Our team in Dubai responds within 1 business hour." },
      { property: "og:title", content: "Request a Tyre Quote — Tires & More UAE" },
      { property: "og:description", content: "Submit your tyre selection and get a quote within the hour." },
      { property: "og:url", content: "/cart" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, remove, setQty, clear, total } = useCart();
  const submit = useServerFn(submitInquiry);
  const [confirmation, setConfirmation] = useState<{ reference: string; total_aed: number } | null>(null);
  const [form, setForm] = useState({
    customer_name: "", phone: "", email: "", area: "",
    vehicle_make: "", vehicle_model: "", preferred_time: "", notes: "",
  });

  const mut = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        items: items.map((i) => ({
          tire_id: i.tire_id, slug: i.slug, name: i.name,
          price_aed: i.price_aed, quantity: i.quantity,
        })),
      };
      return submit({ data: payload });
    },
    onSuccess: (res) => {
      setConfirmation(res);
      clear();
    },
  });

  if (confirmation) {
    const waText = encodeURIComponent(
      `Hello Tires & More, I just submitted quote ${confirmation.reference} (AED ${confirmation.total_aed}). Please confirm availability.`
    );
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <CheckCircle2 className="h-16 w-16 text-brand mx-auto" />
        <h1 className="mt-4 text-3xl font-bold">Quote Received</h1>
        <p className="mt-2 text-muted-foreground">
          Reference <span className="font-mono font-bold text-foreground">{confirmation.reference}</span>. Our team will reach out within 1 business hour.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/97142326666?text=${waText}`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] text-white px-5 py-3 font-semibold hover:opacity-90"
          >
            <MessageCircle className="h-5 w-5" /> Continue on WhatsApp
          </a>
          <Link to="/shop" className="inline-flex items-center justify-center rounded-md border border-border px-5 py-3 font-semibold hover:border-brand">
            Continue browsing
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <h1 className="text-3xl font-bold">Your quote cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add tyres from the shop to request a quote.</p>
        <Link to="/shop" className="mt-6 inline-block rounded-md bg-brand text-brand-foreground px-5 py-3 font-semibold hover:opacity-90">
          Browse tyres
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Request a Quote</h1>
      <p className="mt-2 text-muted-foreground">No payment now — we'll confirm pricing, availability and fitting time.</p>

      <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Items */}
        <div className="space-y-3">
          {items.map((i) => (
            <div key={i.tire_id} className="flex gap-4 rounded-lg border border-border bg-card p-3">
              <img src={i.image} alt={i.name} className="h-20 w-20 rounded object-cover bg-muted" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight line-clamp-2">{i.name}</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{i.size}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="inline-flex items-center border border-border rounded">
                    <button onClick={() => setQty(i.tire_id, i.quantity - 1)} className="px-2 py-1 hover:bg-muted">−</button>
                    <span className="px-3 text-sm font-semibold">{i.quantity}</span>
                    <button onClick={() => setQty(i.tire_id, i.quantity + 1)} className="px-2 py-1 hover:bg-muted">+</button>
                  </div>
                  <button onClick={() => remove(i.tire_id)} className="text-xs text-muted-foreground hover:text-brand inline-flex items-center gap-1">
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-brand">AED {(i.price_aed * i.quantity).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">AED {i.price_aed.toFixed(0)} ea</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form + summary */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="font-semibold">AED {total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Fitting & balancing</span>
              <span className="font-semibold text-brand">FREE</span>
            </div>
            <div className="border-t border-border mt-3 pt-3 flex justify-between">
              <span className="font-bold">Estimated total</span>
              <span className="font-bold text-lg text-brand">AED {total.toFixed(0)}</span>
            </div>
          </div>

          <form
            className="rounded-lg border border-border bg-card p-5 space-y-3"
            onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}
          >
            <h2 className="font-semibold">Your details</h2>
            <Field label="Name *">
              <input required minLength={2} maxLength={100} value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                className="filter-select" />
            </Field>
            <Field label="Phone *">
              <input required type="tel" minLength={7} maxLength={25} value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+971 5X XXX XXXX" className="filter-select" />
            </Field>
            <Field label="Email">
              <input type="email" maxLength={200} value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="filter-select" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Vehicle make">
                <input maxLength={60} value={form.vehicle_make}
                  onChange={(e) => setForm({ ...form, vehicle_make: e.target.value })}
                  className="filter-select" />
              </Field>
              <Field label="Model">
                <input maxLength={60} value={form.vehicle_model}
                  onChange={(e) => setForm({ ...form, vehicle_model: e.target.value })}
                  className="filter-select" />
              </Field>
            </div>
            <Field label="Area in Dubai">
              <input maxLength={120} value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                placeholder="e.g. Al Quoz, Marina" className="filter-select" />
            </Field>
            <Field label="Preferred fitting time">
              <input maxLength={60} value={form.preferred_time}
                onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
                placeholder="e.g. Tomorrow morning" className="filter-select" />
            </Field>
            <Field label="Notes">
              <textarea maxLength={800} rows={3} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="filter-select" />
            </Field>

            {mut.isError && (
              <p className="text-sm text-brand">Couldn't submit — please check your details and try again.</p>
            )}

            <button
              type="submit"
              disabled={mut.isPending}
              className="w-full rounded-md bg-brand text-brand-foreground font-semibold py-3 hover:opacity-90 disabled:opacity-50"
            >
              {mut.isPending ? "Submitting…" : "Request quote"}
            </button>
            <p className="text-xs text-muted-foreground text-center">No payment — we'll confirm by phone or WhatsApp.</p>
          </form>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
