import { Link } from "@tanstack/react-router";
import { Phone, ShoppingCart, Menu, MessageCircle } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { useCart } from "@/lib/cart";

const nav = [
  { to: "/shop", label: "Shop Tyres" },
  { to: "/brands", label: "Brands" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="bg-navy text-navy-foreground text-xs">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-2">
          <span className="opacity-90">Mon–Sun · 9:00am – 9:00pm · Al Quoz 4 Industrial, Dubai</span>
          <div className="flex items-center gap-4">
            <a href="tel:+97142326666" className="flex items-center gap-1 hover:text-brand">
              <Phone className="h-3.5 w-3.5" /> +971 4 232 6666
            </a>
            <a
              href="https://wa.me/97142326666"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-brand"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Tires & More UAE" className="h-10 md:h-12 w-auto" />
        </Link>
        <nav className="hidden lg:flex items-center gap-7">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-semibold text-foreground/80 hover:text-brand transition-colors"
              activeProps={{ className: "text-brand" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative inline-flex items-center justify-center rounded-md border border-border h-10 w-10 hover:border-brand"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand text-brand-foreground text-[10px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button
            className="lg:hidden inline-flex items-center justify-center rounded-md border border-border h-10 w-10"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border">
          <nav className="container mx-auto flex flex-col px-4 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-semibold border-b border-border last:border-0"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
