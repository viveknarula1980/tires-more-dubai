-- Public storage bucket for tire images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tire-images', 'tire-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Public read tire-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'tire-images');

-- Admin write
CREATE POLICY "Admins upload tire-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tire-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update tire-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tire-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete tire-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tire-images' AND has_role(auth.uid(), 'admin'));