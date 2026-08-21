import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PropertyCard } from "@/components/property-card";
import { listProperties } from "@/lib/properties.functions";
import type { PropertyStatus } from "@/lib/site-data";

const propertiesQuery = queryOptions({
  queryKey: ["properties", "all"],
  queryFn: () => listProperties(),
});

export const Route = createFileRoute("/properties/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(propertiesQuery);
  },
  component: PropertiesIndex,
  head: () => ({
    meta: [
      { title: "All Properties — Kaur Tamandeep | GTA Real Estate" },
      {
        name: "description",
        content:
          "Browse every GTA listing represented by Kaur Tamandeep — for sale, for lease, sold, and leased. Search by city, price, and bedrooms.",
      },
      { property: "og:title", content: "All Properties — Kaur Tamandeep" },
      {
        property: "og:description",
        content: "Search GTA homes for sale and lease with Kaur Tamandeep.",
      },
      { property: "og:url", content: "/properties" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "All Properties — Kaur Tamandeep" },
      { name: "twitter:description", content: "Search GTA homes for sale and lease." },
    ],
    links: [{ rel: "canonical", href: "/properties" }],
  }),
});

const STATUS_OPTIONS: { value: PropertyStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "for-sale", label: "For Sale" },
  { value: "for-lease", label: "For Lease" },
  { value: "sold", label: "Sold" },
  { value: "leased", label: "Leased" },
];

function parsePrice(p: string): number {
  const n = Number(p.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function PropertiesIndex() {
  const { data } = useSuspenseQuery(propertiesQuery);
  const all = data.all;

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<PropertyStatus | "all">("all");
  const [minBeds, setMinBeds] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "beds-desc">(
    "featured",
  );

  const cities = useMemo(
    () => Array.from(new Set(all.map((p) => p.city))).sort(),
    [all],
  );
  const [city, setCity] = useState<string>("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let out = all.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (city && p.city !== city) return false;
      if (minBeds > 0 && p.beds < minBeds) return false;
      if (maxPrice > 0 && parsePrice(p.price) > maxPrice) return false;
      if (query) {
        const hay = `${p.title} ${p.address} ${p.city} ${p.state} ${p.zip} ${p.type} ${p.description}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
    if (sort === "price-asc") out = [...out].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    else if (sort === "price-desc") out = [...out].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    else if (sort === "beds-desc") out = [...out].sort((a, b) => b.beds - a.beds);
    return out;
  }, [all, q, status, city, minBeds, maxPrice, sort]);

  const hasFilters = q || status !== "all" || city || minBeds > 0 || maxPrice > 0;
  function reset() {
    setQ(""); setStatus("all"); setCity(""); setMinBeds(0); setMaxPrice(0); setSort("featured");
  }

  const inputCls =
    "w-full bg-transparent border-0 border-b border-foreground/20 focus:border-gold outline-none py-2 text-sm placeholder:text-muted-foreground transition-colors";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <section className="pt-32 pb-10 container-luxury">
        <p className="gold-rule">Properties</p>
        <h1 className="mt-4 font-serif text-4xl md:text-6xl">The GTA collection</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Every home represented by Kaur Tamandeep, searchable by city, price, bedrooms, and status.
        </p>
      </section>

      <section className="container-luxury pb-16">
        <div className="border border-border bg-muted/40 p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="block text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="City, street, MLS, keyword…"
                  className={inputCls + " pl-6"}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4 text-gold-dark" />
              <span>{filtered.length} of {all.length}</span>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus | "all")} className={inputCls}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground mb-1">City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls}>
                <option value="">Any</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground mb-1">Min Beds</label>
              <select value={minBeds} onChange={(e) => setMinBeds(Number(e.target.value))} className={inputCls}>
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n === 0 ? "Any" : `${n}+`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground mb-1">Max Price</label>
              <select value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className={inputCls}>
                <option value={0}>Any</option>
                <option value={2000}>$2,000</option>
                <option value={4000}>$4,000</option>
                <option value={250000}>$250K</option>
                <option value={400000}>$400K</option>
                <option value={600000}>$600K</option>
                <option value={1000000}>$1M</option>
              </select>
            </div>
            <div>
              <label className="block text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground mb-1">Sort</label>
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={inputCls}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price · Low to High</option>
                <option value="price-desc">Price · High to Low</option>
                <option value="beds-desc">Bedrooms</option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={reset}
              className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-gold-dark"
            >
              <X className="h-3.5 w-3.5" /> Reset filters
            </button>
          )}
        </div>
      </section>

      <section className="container-luxury pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border">
            <p className="gold-rule">No matches</p>
            <h2 className="mt-4 font-serif text-3xl">Try broadening your search</h2>
            <button onClick={reset} className="btn-gold mt-8">Reset filters</button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PropertyCard key={p.slug} p={p} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
