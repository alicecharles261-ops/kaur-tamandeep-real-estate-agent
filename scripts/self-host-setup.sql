-- ============================================================
-- Self-host migration script for quwegqiargagugymvvvd
-- Run this in the Supabase SQL Editor of the new project
-- ============================================================

-- 1. Enum type
CREATE TYPE public.property_status AS ENUM ('for-sale', 'for-lease', 'sold', 'leased', 'pending');

-- 2. Properties table
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
  created_at timestamptz NOT NULL DEFAULT now(),
  -- CMS extension columns
  lease_price text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  stories integer,
  lot_size text,
  open_house_date text,
  open_house_time text,
  video_url text,
  virtual_tour_url text,
  google_maps_url text,
  nearby_schools text[] NOT NULL DEFAULT '{}',
  nearby_shopping text[] NOT NULL DEFAULT '{}',
  nearby_restaurants text[] NOT NULL DEFAULT '{}',
  nearby_hospitals text[] NOT NULL DEFAULT '{}',
  energy_rating text,
  documents text[] NOT NULL DEFAULT '{}',
  seo_title text,
  seo_description text,
  seo_keywords text,
  is_hidden boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  is_draft boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false
);

-- 3. Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quote text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Inquiries table
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  property_slug text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Grants
GRANT SELECT ON public.properties TO anon, authenticated;
GRANT ALL ON public.properties TO service_role;
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
GRANT INSERT ON public.inquiries TO anon, authenticated;
GRANT ALL ON public.inquiries TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;

-- 6. RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Properties are publicly readable" ON public.properties FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Reviews are publicly readable" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
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
CREATE POLICY "Admin can insert properties" ON public.properties FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can update properties" ON public.properties FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can delete properties" ON public.properties FOR DELETE TO authenticated USING (true);

-- 7. Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-documents',
  'property-documents',
  false,
  52428800,
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- 8. Storage RLS policies
DROP POLICY IF EXISTS "Admin can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete property images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage property documents" ON storage.objects;

CREATE POLICY "Public can view property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Admin can upload property images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Admin can update property images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'property-images');

CREATE POLICY "Admin can delete property images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'property-images');

CREATE POLICY "Admin can manage property documents" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'property-documents')
  WITH CHECK (bucket_id = 'property-documents');

-- 9. Seed data
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

-- 10. Admin user (run this only after you create the user in Auth > Users and know its UUID)
-- INSERT INTO public.user_roles (user_id, role) VALUES ('<AUTH_USER_UUID>', 'admin');
