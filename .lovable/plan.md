
# Tires & More UAE — Website Plan

A competitive Dubai tyre shop website with a real catalog, dual search (by size / by vehicle), brand pages, services pages, and an inquiry-based checkout. Backed by Lovable Cloud for catalog, inquiries, and admin.

## Design direction

- Automotive, premium, trustworthy. Dark navy + Tires & More red accent (matching the logo). Crisp white surfaces for the shop.
- Bold display type for hero + product names; clean sans for body.
- Sticky utility header (phone, WhatsApp, hours), prominent dual search on the homepage.
- Mobile-first — most UAE tyre buyers browse on phone.

## Site map

- `/` — Home: hero, dual search widget, featured tires, brand grid, services strip, why-us, testimonials, CTA
- `/shop` — All tires with filters (brand, size, vehicle type, price, season)
- `/shop/$slug` — Tire detail page (gallery, specs, inquiry button, WhatsApp)
- `/brands` and `/brands/$slug` — 13 brand landing pages
- `/services` + child routes: `/services/wheel-alignment`, `/brakes`, `/oil-service`, `/mobile-tyre`, `/mobile-battery`
- `/about`, `/contact`
- `/cart` — Inquiry cart (no payment)
- `/checkout` — Submit inquiry (name, phone, address, preferred time, vehicle) → saved to DB + WhatsApp deep link
- `/admin` — Protected: manage tires, brands, vehicle mappings, view inquiries

## Catalog (seeded ~40 tires)

Across all 13 brands: Goodyear, Continental, Bridgestone, Pirelli, Michelin, Dunlop, Nexen, Hankook, Roadstone, Zeetex, Cooper, Falken, Kumho, Maxxis.

Each tire record:
- name, slug, brand, model, size (width/profile/rim), load_index, speed_rating
- season (summer/all-season), vehicle_type (passenger/SUV/4x4)
- country_of_origin, year_of_production
- price_aed (realistic Dubai market price), original_price_aed (for -15% badge display)
- description, features[], warranty
- main_image, gallery_images[]
- stock status

Pricing note: I will use realistic Dubai market prices generated for the seed data. I cannot scrape pitstoparabia.com — it violates their ToS and I have no live runtime to do it. You can later edit prices in the admin panel.

Images: brand logos collected from each brand's official press/media kit (high-res, brand-owned). Tire product images use generic studio renders generated as placeholders, swappable in admin.

## Dual search

**Search by size** — three dropdowns: Width (155–325) → Profile (30–80) → Rim (13–22). Submits to `/shop?width=&profile=&rim=`.

**Search by vehicle** — Make → Model → Year → returns matching tire size, then redirects to size search. Curated dataset for top UAE makes: Toyota, Nissan, Lexus, Mitsubishi, Honda, Hyundai, Kia, Ford, Chevrolet, BMW, Mercedes-Benz, Audi, Land Rover, Porsche, GMC, Infiniti.

## Backend (Lovable Cloud)

Tables:
- `brands` — name, slug, logo_url, description, country
- `tires` — full spec listed above + brand_id FK
- `tire_images` — tire_id, url, sort_order
- `vehicles` — make, model, year_from, year_to, recommended_size
- `inquiries` — name, phone, email, address, items (jsonb), notes, status, created_at
- `contact_messages` — from contact form
- `user_roles` — admin role gate (separate table, `has_role` SECURITY DEFINER function — no roles on profiles)

RLS:
- Public read on brands, tires, tire_images, vehicles
- Public insert on inquiries + contact_messages (rate-limited via simple per-IP check in server fn)
- Admin-only write/update/delete via `has_role(auth.uid(), 'admin')`

Server functions (`createServerFn`):
- `searchTires` (size + filters), `getTire`, `lookupVehicleSize`
- `submitInquiry`, `submitContact`
- Admin: `upsertTire`, `deleteTire`, `listInquiries`, `updateInquiryStatus`

## Inquiry checkout flow

1. Add tire(s) + quantity to cart (localStorage)
2. Checkout form: name, phone, email, address area, vehicle make/model, preferred install time, notes
3. Submit → row inserted into `inquiries` → confirmation page with reference number + "Continue on WhatsApp" deep link to +971 4 232 6666 with a pre-filled message containing the reference + items

## Admin

- `/admin/login` — email/password (Lovable Cloud auth)
- `/admin/tires` — CRUD with image upload to storage bucket
- `/admin/brands`, `/admin/vehicles` — CRUD
- `/admin/inquiries` — list, filter by status, mark as contacted/closed

You'll be the first admin — I'll seed your role after you sign up.

## Build phases

1. **Phase 1 — Foundation + Home + Shop browse** (this turn)
   - Enable Lovable Cloud, create schema + RLS, seed brands & ~40 tires & vehicle data
   - Design system, header/footer, home page, shop list with filters, tire detail, brand pages, services, about, contact
   - Dual search widget, cart, inquiry checkout
2. **Phase 2 — Admin panel** (next turn)
3. **Phase 3 — Polish: SEO meta per route, sitemap, schema.org Product JSON-LD, performance** (next turn)

## Technical notes

- TanStack Start route per page (no hash anchors) for SEO
- Each route has unique `head()` meta + Product JSON-LD on tire pages
- Images stored in Lovable Cloud Storage bucket `tire-images`
- WhatsApp link: `https://wa.me/97142326666?text=...`
- Phone-tap links throughout for mobile

If this looks right, I'll implement Phase 1.
