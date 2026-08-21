ALTER TYPE public.property_status ADD VALUE IF NOT EXISTS 'pending';

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS lease_price       text,
  ADD COLUMN IF NOT EXISTS latitude          numeric(10,7),
  ADD COLUMN IF NOT EXISTS longitude         numeric(10,7),
  ADD COLUMN IF NOT EXISTS stories           integer,
  ADD COLUMN IF NOT EXISTS lot_size          text,
  ADD COLUMN IF NOT EXISTS open_house_date   text,
  ADD COLUMN IF NOT EXISTS open_house_time   text,
  ADD COLUMN IF NOT EXISTS video_url         text,
  ADD COLUMN IF NOT EXISTS virtual_tour_url  text,
  ADD COLUMN IF NOT EXISTS google_maps_url   text,
  ADD COLUMN IF NOT EXISTS nearby_schools    text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS nearby_shopping   text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS nearby_restaurants text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS nearby_hospitals  text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS energy_rating     text,
  ADD COLUMN IF NOT EXISTS documents         text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS seo_title         text,
  ADD COLUMN IF NOT EXISTS seo_description   text,
  ADD COLUMN IF NOT EXISTS seo_keywords      text,
  ADD COLUMN IF NOT EXISTS is_hidden         boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_published      boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_draft          boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archived       boolean NOT NULL DEFAULT false;

GRANT INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews    TO authenticated;

DROP POLICY IF EXISTS "Admin can insert properties" ON public.properties;
CREATE POLICY "Admin can insert properties" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update properties" ON public.properties;
CREATE POLICY "Admin can update properties" ON public.properties
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can delete properties" ON public.properties;
CREATE POLICY "Admin can delete properties" ON public.properties
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin can upload property images"  ON storage.objects;
DROP POLICY IF EXISTS "Admin can update property images"  ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete property images"  ON storage.objects;
DROP POLICY IF EXISTS "Public can view property images"   ON storage.objects;

CREATE POLICY "Public can view property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Admin can upload property images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Admin can update property images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'property-images');

CREATE POLICY "Admin can delete property images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Admin can manage property documents" ON storage.objects;

CREATE POLICY "Admin can manage property documents" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'property-documents')
  WITH CHECK (bucket_id = 'property-documents');