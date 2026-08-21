-- Consolidated setup for project quwegqiargagugymvvvd
-- Part 1: base schema + seed (20260821144041)

CREATE TYPE public.property_status AS ENUM ('for-sale', 'for-lease', 'sold', 'leased');

CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  status public.property_status NOT NULL,
  price text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  type text NOT NULL,
  beds int NOT NULL,
  baths numeric NOT NULL,
  garage int,
  sqft int,
  year_built int,
  mls text,
  image_key text NOT NULL,
  gallery_keys text[] NOT NULL DEFAULT '{}',
  description text NOT NULL,
  features text[] NOT NULL DEFAULT '{}',
  amenities text[] NOT NULL DEFAULT '{}',
  date_label text,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.properties TO anon, authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Properties are publicly readable" ON public.properties FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quote text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are publicly readable" ON public.reviews FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  property_slug text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiries TO anon, authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a valid inquiry" ON public.inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 120
    AND char_length(email) BETWEEN 3 AND 200
    AND email LIKE '%_@_%.__%'
    AND char_length(message) BETWEEN 1 AND 4000
    AND (phone IS NULL OR char_length(phone) <= 40)
    AND (property_slug IS NULL OR char_length(property_slug) <= 200)
  );

INSERT INTO public.properties (slug, title, status, price, address, city, state, zip, type, beds, baths, garage, sqft, year_built, mls, image_key, gallery_keys, description, features, amenities, is_featured, sort_order) VALUES
('downtown-highrise-residence','Downtown High-Rise Residence','for-lease','$3,504/mo','Downtown Skyline Tower','Dallas','TX','75201','Luxury High-Rise',2,2,2,1650,2019,'DAL-24-3504','featured1',ARRAY['featured1','leasedDowntown'],
 'Floor-to-ceiling windows frame unobstructed skyline views in this designer high-rise residence. Chef''s kitchen, resort-style pool, concierge service.',
 ARRAY['Floor-to-ceiling windows','Chef''s kitchen','Private balcony','Skyline views'],
 ARRAY['Rooftop pool','24/7 concierge','Fitness center','Valet parking'], true, 1),
('lodestone-family-estate','Lodestone Family Estate','for-sale','$320,000','4524 Lodestone Ln','Fort Worth','TX','76123','Single-Family Home',4,3,2,2450,2005,'FW-24-4524','soldLodestone',ARRAY['soldLodestone','featured2'],
 'Handsome two-story brick residence in a quiet, tree-lined enclave. Bright open floor plan, formal dining, oversized bay window, and generous primary suite.',
 ARRAY['Two-story foyer','Formal dining','Bay window','Oversized primary'],
 ARRAY['Attached 2-car garage','Manicured landscaping','Covered entry'], true, 2),
('featured-modern-kitchen-residence','Modern Chef Residence','for-sale','$489,000','1208 Marble Ridge Dr','Frisco','TX','75035','Contemporary Home',4,3,2,2980,2021,'FR-25-1208','featured3',ARRAY['featured3','featured2'],
 'Turn-key contemporary with a showpiece marble kitchen, warm walnut cabinetry, brass fixtures and light-filled great room. Move-in ready.',
 ARRAY['Marble waterfall island','Walnut cabinetry','Brass fixtures','Herringbone floors'],
 ARRAY['Smart-home wired','Tankless water heater','Oversized pantry'], true, 3);

INSERT INTO public.properties (slug, title, status, price, address, city, state, zip, type, beds, baths, image_key, description, date_label, sort_order) VALUES
('sold-lodestone-fort-worth','4524 Lodestone Ln','sold','$320,000','4524 Lodestone Ln','Fort Worth','TX','76123','Single-Family Home',4,3,'soldLodestone','Sold — represented buyer in a competitive market.','2024',1);

INSERT INTO public.properties (slug, title, status, price, address, city, state, zip, type, beds, baths, image_key, description, date_label, sort_order) VALUES
('leased-downtown-highrise','Downtown High-Rise','leased','$3,504/mo','Downtown Skyline Tower','Dallas','TX','75201','Luxury High-Rise',2,2,'leasedDowntown','Leased at asking — full-service concierge tower.','2025',1),
('leased-coyote-ridge','Townhomes of Coyote Ridge','leased','$1,888/mo','4253 Hunt Dr','Carrollton','TX','75010','Townhome',2,2,'leasedCoyote','Leased — Coyote Ridge townhome with attached garage.','2024',2),
('leased-princeton-4br','Princeton Family Home','leased','$1,850/mo','Princeton','Princeton','TX','75407','Single-Family Home',4,2,'leasedPrinceton','Leased — spacious 4-bed home with fenced backyard.','2024',3);

INSERT INTO public.reviews (name, quote, sort_order) VALUES
('Client','Thank you! It''s been very easy to work with you. I appreciate it so much.',1),
('Client','Thank you! I really appreciate you, this has been the easiest apartment hunting I''ve ever experienced.',2),
('Bailey Jiles','Kaur Tamandeep is a true blessing. Her research and dedication made the entire process stress-free.',3),
('Neil','Attentive, patient, and incredibly helpful throughout the process.',4),
('Client','She has been kind and helpful. She is very knowledgeable and detail oriented.',5),
('Client','Kaur listened to what I wanted as well as my budget and found me some great options.',6),
('Client','Good morning, Thank you I''m so excited and ready 😊 I hope you have a great day also.',7),
('Client','Thank you SO much Kaur! You have been such a big help. I appreciate your kindness and patience. 💜',8);

-- Part 2: PRIVATE storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('property-images','property-images',false,10485760,
        ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET public = false;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('property-documents','property-documents',false,52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = false;

-- Part 3: CMS columns, admin CRUD, storage policies (20260821144153)

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
  FOR SELECT TO anon, authenticated USING (bucket_id = 'property-images');

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
