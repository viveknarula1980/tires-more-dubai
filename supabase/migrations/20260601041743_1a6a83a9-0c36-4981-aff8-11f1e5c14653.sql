CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT, SELECT ON public.contact_submissions TO anon;
GRANT INSERT, SELECT ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message" 
ON public.contact_submissions FOR INSERT TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Only service role can view submissions" 
ON public.contact_submissions FOR SELECT TO anon, authenticated 
USING (false);