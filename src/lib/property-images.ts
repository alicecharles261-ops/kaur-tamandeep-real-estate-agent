import featured1 from "@/assets/featured-1.jpg";
import featured2 from "@/assets/featured-2.jpg";
import featured3 from "@/assets/featured-3.jpg";
import soldLodestone from "@/assets/properties/sold-lodestone.jpg";
import leasedCoyote from "@/assets/properties/leased-coyote-ridge.jpg";
import leasedPrinceton from "@/assets/properties/leased-princeton.jpg";
import leasedDowntown from "@/assets/properties/leased-downtown.jpg";

const FALLBACK = featured1;

// Local bundled asset map (legacy keys from seed data)
const LOCAL_MAP: Record<string, string> = {
  featured1,
  featured2,
  featured3,
  soldLodestone,
  leasedCoyote,
  leasedPrinceton,
  leasedDowntown,
};

// Supabase project URL for constructing storage public URLs
const SUPABASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  process.env.SUPABASE_URL ||
  "";

/**
 * Returns a displayable image URL from:
 *   - a local bundled key (e.g. "featured1")
 *   - a Supabase Storage path (e.g. "properties/uuid/main.jpg")
 *   - a full URL (https://...)
 *   - null/undefined → fallback image
 */
export function resolveImage(key: string | null | undefined): string {
  if (!key) return FALLBACK;
  // Full URL passthrough
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  // Local bundled asset
  if (LOCAL_MAP[key]) return LOCAL_MAP[key];
  // Supabase Storage path
  return `${SUPABASE_URL}/storage/v1/object/public/property-images/${key}`;
}

export function resolveGallery(keys: string[] | null | undefined): string[] {
  if (!keys || keys.length === 0) return [];
  return keys.map(resolveImage);
}

/** Build the public storage URL for a given storage path */
export function storageUrl(bucket: string, path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
