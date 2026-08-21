
DROP POLICY "Anyone can submit an inquiry" ON public.inquiries;
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
