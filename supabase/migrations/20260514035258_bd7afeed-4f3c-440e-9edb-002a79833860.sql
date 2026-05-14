
-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Brands
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  country TEXT,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admins write brands" ON public.brands FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tires
CREATE TABLE public.tires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE RESTRICT NOT NULL,
  name TEXT NOT NULL,
  model TEXT,
  width INT NOT NULL,
  profile INT NOT NULL,
  rim INT NOT NULL,
  load_index TEXT,
  speed_rating TEXT,
  season TEXT NOT NULL DEFAULT 'all-season',
  vehicle_type TEXT NOT NULL DEFAULT 'passenger',
  country_of_origin TEXT,
  year_of_production INT,
  price_aed NUMERIC(10,2) NOT NULL,
  original_price_aed NUMERIC(10,2),
  description TEXT,
  features TEXT[],
  warranty TEXT,
  main_image TEXT,
  gallery_images TEXT[],
  in_stock BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tires" ON public.tires FOR SELECT USING (true);
CREATE POLICY "Admins write tires" ON public.tires FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_tires_size ON public.tires(width, profile, rim);
CREATE INDEX idx_tires_brand ON public.tires(brand_id);

-- Vehicles (make/model/year -> recommended size)
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year_from INT NOT NULL,
  year_to INT NOT NULL,
  recommended_width INT NOT NULL,
  recommended_profile INT NOT NULL,
  recommended_rim INT NOT NULL,
  vehicle_type TEXT DEFAULT 'passenger',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Admins write vehicles" ON public.vehicles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_vehicles_make_model ON public.vehicles(make, model);

-- Inquiries (cart/checkout)
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL DEFAULT ('TM-' || upper(substring(replace(gen_random_uuid()::text,'-',''),1,8))),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  area TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  preferred_time TEXT,
  notes TEXT,
  items JSONB NOT NULL,
  total_aed NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submit inquiry" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read inquiries" ON public.inquiries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update inquiries" ON public.inquiries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Contact messages
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submit contact" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read contact" ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
