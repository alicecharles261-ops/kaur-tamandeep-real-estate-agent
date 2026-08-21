/** Slugify a title string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Generate a pseudo-UUID v4 (browser-safe) */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Compress an image file via canvas before upload */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Compression failed"));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = url;
  });
}

/** Format price string */
export function formatPrice(price: string | null | undefined): string {
  return price || "—";
}

export const PROPERTY_TYPES = [
  "Single-Family Home",
  "Townhome",
  "Condo",
  "Luxury High-Rise",
  "Contemporary Home",
  "Ranch Style Home",
  "Multi-Family",
  "Land / Lot",
  "Commercial",
  "Other",
] as const;

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
] as const;

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  "for-sale":  { label: "For Sale",  color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  "for-lease": { label: "For Lease", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  "sold":      { label: "Sold",      color: "bg-zinc-500/15 text-zinc-300 border-zinc-500/20" },
  "leased":    { label: "Leased",    color: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
  "pending":   { label: "Pending",   color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
};
