import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import logo from "@/assets/logo.png";

export function SiteFooter() {
  return (
    <footer className="bg-navy text-navy-foreground mt-20">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-4">
        <div className="space-y-4">
          <img src={logo} alt="Tires & More UAE" className="h-12 w-auto bg-white rounded p-2" />
          <p className="text-sm text-white/70">
            Dubai's trusted tyre shop since day one. Premium tyres, expert installation,
            and mobile service across the UAE.
          </p>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link to="/shop" className="hover:text-brand">All Tyres</Link></li>
            <li><Link to="/brands" className="hover:text-brand">Brands</Link></li>
            <li><Link to="/shop" search={{ vehicle_type: "passenger" }}>Passenger</Link></li>
            <li><Link to="/shop" search={{ vehicle_type: "suv" }}>SUV & 4×4</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4">Services</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link to="/services" className="hover:text-brand">Wheel Alignment</Link></li>
            <li><Link to="/services" className="hover:text-brand">Brake Service</Link></li>
            <li><Link to="/services" className="hover:text-brand">Oil Change</Link></li>
            <li><Link to="/services" className="hover:text-brand">Mobile Tyre Service</Link></li>
            <li><Link to="/services" className="hover:text-brand">Mobile Battery</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 text-brand" /> <a href="tel:+97142326666">+971 4 232 6666</a></li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 text-brand" /> <a href="tel:+97146667999">+971 4 666 7999</a></li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 text-brand" /> <a href="mailto:info@tiresandmore.ae">info@tiresandmore.ae</a></li>
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 text-brand" /> Al Quoz 4 Industrial, Dubai UAE</li>
            <li className="flex gap-2"><Clock className="h-4 w-4 mt-0.5 text-brand" /> Mon–Sun 9:00am – 9:00pm</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 text-xs text-white/60 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} Tires & More UAE. All rights reserved.</span>
          <span>Tyre Shop Dubai · Mobile Tyre Service · Wheel Alignment</span>
        </div>
      </div>
    </footer>
  );
}
