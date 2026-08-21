---
name: CMS Migration
description: The CMS adds new columns, storage buckets, and RLS write policies that must be applied before admin CRUD works.
---

# CMS Migration

## The rule
The full admin CMS requires a Supabase migration to be applied before property create/update/delete works.

**Why:** The baseline schema (from the original migration) only has `properties` as publicly readable with no write policies. The CMS adds ~20 new columns, storage buckets (`property-images`, `property-documents`), and RLS write policies for authenticated users.

## How to apply
1. Open: the backend database (Lovable Cloud)
2. Run: `supabase/migrations/20260730000000_cms_extension.sql`
3. The Settings tab in the admin dashboard shows the SQL and a Copy button.

## Key new columns added
- `lease_price`, `latitude`, `longitude`, `stories`, `lot_size`
- `open_house_date`, `open_house_time`
- `video_url`, `virtual_tour_url`, `google_maps_url`
- `nearby_schools[]`, `nearby_shopping[]`, `nearby_restaurants[]`, `nearby_hospitals[]`
- `energy_rating`, `documents[]`
- `seo_title`, `seo_description`, `seo_keywords`
- `is_hidden`, `is_published` (default true), `is_draft`, `is_archived`
- Enum extended with `pending` status

## Error behavior
If the migration hasn't been applied and admin tries to write, the form shows a clear error banner with instructions pointing to the Settings tab.
