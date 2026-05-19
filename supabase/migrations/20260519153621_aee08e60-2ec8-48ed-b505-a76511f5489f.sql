
CREATE TABLE public.rim_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  logo_url text,
  country text,
  description text,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.rims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  brand_id uuid NOT NULL REFERENCES public.rim_brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  model text,
  diameter integer NOT NULL,
  width numeric(4,1),
  offset_mm integer,
  pcd text,
  bolt_count integer,
  center_bore numeric(5,2),
  finish text,
  color text,
  construction text,
  weight_kg numeric(5,2),
  load_rating integer,
  fitment_notes text,
  country_of_origin text,
  description text,
  features text[],
  main_image text,
  gallery_images text[],
  in_stock boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rims_brand ON public.rims(brand_id);
CREATE INDEX idx_rims_diameter ON public.rims(diameter);

ALTER TABLE public.rim_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read rim_brands" ON public.rim_brands FOR SELECT USING (true);
CREATE POLICY "Admins write rim_brands" ON public.rim_brands FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public read rims" ON public.rims FOR SELECT USING (true);
CREATE POLICY "Admins write rims" ON public.rims FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.rim_brands (slug, name, country, description, sort_order) VALUES
  ('kmc', 'KMC Wheels', 'USA', 'Iconic American off-road and street wheels engineered for trucks, SUVs and 4x4s.', 1),
  ('rrw', 'RRW (Relations Race Wheels)', 'USA', 'Lightweight, durable off-road wheels designed for overlanding and desert performance.', 2),
  ('dakar-forged', 'Dakar Forged', 'UAE', 'Premium forged wheels engineered in the UAE for luxury SUVs and performance vehicles.', 3),
  ('baja-rim', 'Baja Rim', 'USA', 'Rugged beadlock and off-road rims built for hardcore desert and rock applications.', 4);
