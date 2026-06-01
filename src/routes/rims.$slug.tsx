import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Check, MessageCircle, Phone, ShieldCheck, Truck, Wrench } from "lucide-react";
import { toast } from "sonner";
import { getRimBySlug, requestRimQuote } from "@/lib/rims.functions";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/rims/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Rims | Tires & More UAE` },
      { name: "description", content: "Premium rim with full specs. Request a price quote or chat with our sales team on WhatsApp." },
      { property: "og:title", content: `${params.slug.replace(/-/g, " ")} — Rims | Tires & More UAE` },
      { property: "og:description", content: "Premium rim with full specs. Request a price quote on WhatsApp." },
      { property: "og:url", content: `/rims/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/rims/${params.slug}` }],
  }),
  component: RimDetail,
});

function RimDetail() {
  const { slug } = Route.useParams();
  const fetchRim = useServerFn(getRimBySlug);
  const submitQuote = useServerFn(requestRimQuote);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: r, isLoading } = useQuery({
    queryKey: ["rim", slug],
    queryFn: () => fetchRim({ data: { slug } }),
  });

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    vehicle: "",
    quantity: 4,
    message: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!r) return;
      return submitQuote({
        data: {
          rim_slug: r.slug,
          rim_name: r.name,
          ...form,
        },
      });
    },
    onSuccess: () => {
      toast.success("Quote request sent! Our sales team will contact you within a few hours.");
      setForm({ customer_name: "", phone: "", email: "", vehicle: "", quantity: 4, message: "" });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to send request. Please try again."),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-muted rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!r) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Rim not found</h1>
        <Link to="/rims" className="mt-4 inline-block text-brand font-semibold">← Back to rims</Link>
      </div>
    );
  }

  const brand = (r as { brand: { name: string; logo_url: string | null } | null }).brand;
  const waMsg = encodeURIComponent(
    `Hi, I'm interested in the ${r.name}. Could you share availability, price and fitment details? Thanks.`
  );
  const wa = `https://wa.me/97142326666?text=${waMsg}`;
  const gallery = Array.from(
    new Set([r.main_image, ...(((r as { gallery_images?: string[] | null }).gallery_images) ?? [])].filter(Boolean) as string[])
  );
  const heroImage = selectedImage && gallery.includes(selectedImage) ? selectedImage : gallery[0];

  const specs: Array<[string, string | number | null | undefined]> = [
    ["Brand", brand?.name],
    ["Model", r.model],
    ["Diameter", `${r.diameter}"`],
    ["Width", r.width ? `${r.width}J` : null],
    ["Offset (ET)", r.offset_mm !== null ? `${r.offset_mm} mm` : null],
    ["PCD / Bolt Pattern", r.pcd],
    ["Bolt count", r.bolt_count],
    ["Center bore", r.center_bore ? `${r.center_bore} mm` : null],
    ["Finish", r.finish],
    ["Color", r.color],
    ["Construction", r.construction],
    ["Weight", r.weight_kg ? `${r.weight_kg} kg` : null],
    ["Load rating", r.load_rating],
    ["Country of origin", r.country_of_origin],
  ];

  return (
    <div className="bg-muted/30">
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-brand">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/rims" className="hover:text-brand">Rims</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">{r.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
          {/* Left — image + info */}
          <div>
            <div className="bg-background rounded-xl border border-border p-8 flex items-center justify-center">
              <img
                src={heroImage ?? "/rim-default.svg"}
                alt={r.name}
                className="w-full max-w-md aspect-square object-contain"
              />
            </div>

            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {gallery.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`aspect-square rounded-md border bg-background p-1.5 transition-colors ${
                      (heroImage ?? gallery[0]) === image ? "border-brand" : "border-border hover:border-brand/60"
                    }`}
                    aria-label={`View ${r.name} gallery image ${index + 1}`}
                  >
                    <img src={image} alt={`${r.name} finish ${index + 1}`} loading="lazy" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6">
              {brand?.name && (
                <div className="h-10 w-36 mb-3">
                  <BrandLogo
                    name={brand.name}
                    logoUrl={brand.logo_url}
                    className="h-full w-full bg-transparent justify-start"
                    textClassName="text-lg"
                  />
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-navy break-words">
                {r.name}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {r.diameter}" · {r.width ? `${r.width}J · ` : ""}{r.pcd ?? ""} {r.color ? `· ${r.color}` : ""}
              </p>

              {r.description && (
                <p className="mt-5 text-foreground/90 leading-relaxed">{r.description}</p>
              )}

              {r.features && r.features.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {r.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-brand mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              )}

              {r.fitment_notes && (
                <div className="mt-6 rounded-lg border border-border bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fitment</p>
                  <p className="mt-1 text-sm">{r.fitment_notes}</p>
                </div>
              )}
            </div>

            {/* Specs */}
            <div className="mt-8 bg-background rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-bold uppercase tracking-tight">Specifications</h2>
              </div>
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 p-6 text-sm">
                {specs.filter(([, v]) => v !== null && v !== undefined && v !== "").map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-border/60 pb-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-semibold text-right">{v as string}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Right — Request quote + CTAs */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-xl border-2 border-brand bg-background p-6 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand">Price on Request</p>
                <h3 className="mt-1 text-xl font-bold">Get a quote</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tell us a bit about your vehicle and our sales team will get back within a few hours with pricing and availability.
                </p>
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
                className="space-y-3"
              >
                <input
                  required minLength={2} maxLength={100}
                  placeholder="Your name *"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
                />
                <input
                  required minLength={7} maxLength={25}
                  placeholder="Phone (WhatsApp preferred) *"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
                />
                <input
                  type="email" maxLength={200}
                  placeholder="Email (optional)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
                />
                <input
                  maxLength={120}
                  placeholder="Vehicle (e.g. 2022 Land Cruiser 300)"
                  value={form.vehicle}
                  onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
                />
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground">Qty</label>
                  <input
                    type="number" min={1} max={20}
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 1 })}
                    className="w-20 rounded-md border border-border bg-background px-3 py-2.5 text-sm"
                  />
                </div>
                <textarea
                  maxLength={800}
                  rows={3}
                  placeholder="Anything else? (offset preference, custom finish…)"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm resize-none"
                />
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-brand text-brand-foreground font-bold py-3 hover:opacity-90 uppercase tracking-wide disabled:opacity-60"
                >
                  {mutation.isPending ? "Sending…" : "Request Quote"}
                </button>
              </form>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <a href="tel:+97142326666" className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background py-2.5 text-sm font-semibold hover:border-brand">
                  <Phone className="h-4 w-4" /> Call
                </a>
                <a
                  href={wa} target="_blank" rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] text-white py-2.5 text-sm font-semibold hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-border text-sm">
                <Benefit icon={Wrench} text="Professional fitting & balancing" />
                <Benefit icon={Truck} text="Fast delivery across UAE" />
                <Benefit icon={ShieldCheck} text="Authentic with manufacturer warranty" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Benefit({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 text-brand shrink-0" />
      <span>{text}</span>
    </div>
  );
}
