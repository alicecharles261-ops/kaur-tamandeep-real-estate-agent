import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { resolveImage, resolveGallery } from "@/lib/property-images";
import type { Property, Review, PropertyStatus } from "@/lib/site-data";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

function isOpaqueKey(v: string) {
  return v.startsWith("sb_publishable_") || v.startsWith("sb_secret_");
}

function serverPublicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (isOpaqueKey(key) && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function toProperty(r: PropertyRow): Property {
  return {
    slug: r.slug,
    title: r.title,
    status: r.status as PropertyStatus,
    price: r.price,
    address: r.address,
    city: r.city,
    state: r.state,
    zip: r.zip,
    type: r.type,
    beds: r.beds,
    baths: Number(r.baths),
    garage: r.garage,
    sqft: r.sqft,
    yearBuilt: r.year_built,
    mls: r.mls,
    image: resolveImage(r.image_key),
    gallery: resolveGallery(r.gallery_keys),
    description: r.description,
    features: r.features ?? [],
    amenities: r.amenities ?? [],
    date: r.date_label,
  };
}

export const listProperties = createServerFn({ method: "GET" }).handler(async () => {
  const sb = serverPublicClient();
  const { data, error } = await sb
    .from("properties")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const all = rows.map(toProperty);
  const forSale = rows
    .filter(
      (r) =>
        r.status === "for-sale" &&
        r.is_published &&
        !r.is_hidden &&
        !r.is_draft &&
        !r.is_archived,
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)
    .map(toProperty);
  return {
    featured: all.filter((_, i) => rows[i].is_featured),
    forSale,
    sold: all.filter((p) => p.status === "sold"),
    leased: all.filter((p) => p.status === "leased"),
    all,
  };
});

export const getPropertyBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = serverPublicClient();
    const { data: row, error } = await sb
      .from("properties")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    return toProperty(row);
  });

export const listReviews = createServerFn({ method: "GET" }).handler(async () => {
  const sb = serverPublicClient();
  const { data, error } = await sb
    .from("reviews")
    .select("name, quote")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Review[];
});

const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional().nullable(),
  message: z.string().trim().min(5).max(2000),
  property_slug: z.string().trim().max(200).optional().nullable(),
});

export const submitInquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => inquirySchema.parse(d))
  .handler(async ({ data }) => {
    const sb = serverPublicClient();
    const { error } = await sb.from("inquiries").insert({
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      message: data.message,
      property_slug: data.property_slug ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
