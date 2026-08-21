import { Link } from "@tanstack/react-router";
import { BedDouble, Bath, Ruler, MapPin, ArrowUpRight } from "lucide-react";
import type { Property } from "@/lib/site-data";

const STATUS_LABEL: Record<Property["status"], string> = {
  "for-sale": "For Sale",
  "for-lease": "For Lease",
  sold: "Sold",
  leased: "Leased",
};

export function PropertyCard({ p, variant = "default" }: { p: Property; variant?: "default" | "compact" }) {
  const badgeBg =
    p.status === "sold"
      ? "bg-foreground text-background"
      : p.status === "leased"
        ? "bg-foreground text-background"
        : "bg-gold text-gold-foreground";

  return (
    <Link
      to="/properties/$slug"
      params={{ slug: p.slug }}
      className="group block bg-card shadow-card hover:shadow-luxury transition-all duration-500"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={p.image}
          alt={`${p.title} — ${p.city}, ${p.state}`}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <span
          className={`absolute top-4 left-4 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.22em] font-medium ${badgeBg}`}
        >
          {STATUS_LABEL[p.status]}
        </span>
        {p.date && (
          <span className="absolute top-4 right-4 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.22em] font-medium bg-white/85 text-foreground backdrop-blur-md">
            {p.date}
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-serif text-2xl text-foreground">{p.price}</p>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-gold-dark transition-colors" />
        </div>
        <h3 className="mt-1 text-base font-medium text-foreground font-sans">{p.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {p.address}, {p.city}, {p.state} {p.zip}
        </p>

        {variant !== "compact" && (
          <div className="mt-5 pt-5 border-t border-border/70 flex items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5 text-gold-dark" /> {p.beds} bd
            </span>
            <span className="flex items-center gap-1.5">
              <Bath className="h-3.5 w-3.5 text-gold-dark" /> {p.baths} ba
            </span>
            {p.sqft && (
              <span className="flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5 text-gold-dark" /> {p.sqft.toLocaleString()} sqft
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
