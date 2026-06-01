import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Phone, MessageCircle, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { submitContactForm } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Tires & More UAE" },
      { name: "description", content: "Contact Tires and More in Al Quoz, Dubai. Call +971 4 232 6666, WhatsApp, or send us a message." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submit = useServerFn(submitContactForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submit({ data: formData });
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-navy text-navy-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold">Contact us</h1>
          <p className="mt-2 text-navy-foreground/80 max-w-xl">
            Visit our workshop in Al Quoz, call us, send a WhatsApp, or fill out the form below. We are here to help.
          </p>
        </div>
      </section>

      {/* Full-width Map */}
      <div className="w-full h-[420px] md:h-[500px]">
        <iframe
          title="Tires and More Location"
          src="https://maps.google.com/maps?q=Tires%20and%20More%2C%2019A%20Street%2C%20Al%20Quoz%20Industrial%20Area%204%2C%20Dubai&t=m&z=17&output=embed&iwloc=near"
          width="100%"
          height="100%"
          style={{ border: 0, display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Info Cards */}
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-background p-5">
                <div className="h-9 w-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold">Address</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  318th Road, Al Quoz Industrial Area Fourth<br />
                  Al Quoz, Dubai<br />
                  United Arab Emirates
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background p-5">
                <div className="h-9 w-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold">Phone</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  <a href="tel:+97142326666" className="hover:text-brand transition-colors">
                    +971 4 232 6666
                  </a>
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href="tel:+97142326666"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-brand text-brand-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Phone className="h-4 w-4" /> Call now
                  </a>
                  <a
                    href="https://wa.me/97142326666"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] text-white px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-5">
                <div className="h-9 w-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold">Opening Hours</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Monday – Saturday: 9:00 AM – 9:00 PM<br />
                  Sunday: 10:30 AM – 9:00 PM
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background p-5">
                <div className="h-9 w-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold">Email</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  <a href="mailto:support@tiresandmre.ae" className="hover:text-brand transition-colors">
                    support@tiresandmre.ae
                  </a>
                </p>
                <a
                  href="mailto:support@tiresandmre.ae"
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-md bg-muted text-foreground px-4 py-2.5 text-sm font-semibold hover:bg-muted/80 transition-colors w-full"
                >
                  <Mail className="h-4 w-4" /> Send email
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-xl border border-border bg-background p-6 md:p-8 h-fit">
            <h2 className="text-xl font-bold">Send us a message</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill out the form below and we will get back to you as soon as possible.
            </p>

            {submitted ? (
              <div className="mt-6 flex flex-col items-center text-center py-10">
                <div className="h-14 w-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Message sent!</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                  Thank you for reaching out. Our team will review your message and reply shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-5 text-sm text-brand font-medium hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      maxLength={100}
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      maxLength={255}
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      maxLength={50}
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                      placeholder="+971 50 123 4567"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="General inquiry">General inquiry</option>
                      <option value="Tyre quote request">Tyre quote request</option>
                      <option value="Service booking">Service booking</option>
                      <option value="Wheel / rim inquiry">Wheel / rim inquiry</option>
                      <option value="Off-road upgrade">Off-road upgrade</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    maxLength={2000}
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors resize-y"
                    placeholder="How can we help you?"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-md bg-brand text-brand-foreground px-5 py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-brand-foreground/30 border-t-brand-foreground rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
