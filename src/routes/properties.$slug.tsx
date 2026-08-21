import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  BedDouble,
  Bath,
  Ruler,
  Car,
  Calendar,
  Hash,
  MapPin,
  Heart,
  Share2,
  Phone,
  Mail,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "@/components/contact-form";
import { AGENT, type Property } from "@/lib/site-data";
import { getPropertyBySlug } from "@/lib/properties.functions";

export const Route = createFileRoute("/properties/$slug")({
  loader: async ({ params }) => {
    const p = await getPropertyBySlug({ data: { slug: params.slug } });
    if (!p) throw notFound();
    return { property: p };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Property not found — Kaur Tamandeep" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const p = loaderData.property;
    const title = `${p.title} — ${p.city}, ${p.state} | Kaur Tamandeep`;
    const desc = `${p.price} · ${p.beds} bd · ${p.baths} ba · ${p.type} in ${p.city}, ${p.state}. ${p.description}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `/properties/${p.slug}` },
        { property: "og:type", content: "website" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: `/properties/${p.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            name: p.title,
            description: p.description,
            address: {
              "@type": "PostalAddress",
              streetAddress: p.address,
              addressLocality: p.city,
              addressRegion: p.state,
              postalCode: p.zip,
              addressCountry: "US",
            },
            numberOfBedrooms: p.beds,
            numberOfBathroomsTotal: p.baths,
            floorSize: p.sqft
              ? { "@type": "QuantitativeValue", value: p.sqft, unitCode: "FTK" }
              : undefined,
          }),
        },
      ],
    };
  },
  component: PropertyPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="gold-rule">Not found</p>
        <h1 className="mt-4 font-serif text-4xl">Property unavailable</h1>
        <Link to="/" className="btn-gold mt-8 inline-flex">Back to listings</Link>
      </div>
    </div>
  ),
});

function PropertyPage() {
  const { property: p } = Route.useLoaderData();
  const gallery = p.gallery && p.gallery.length ? p.gallery : [p.image];
  const [active, setActive] = useState(0);
  const [favorited, setFavorited] = useState(false);

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: p.title, url: window.location.href });
      } catch {}
    } else if (typeof navigator !== "undefined") {
      await navigator.clipboard?.writeText(window.location.href);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <div className="pt-28 pb-4 container-luxury">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground hover:text-gold-dark transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to listings
        </Link>
      </div>

      {/* Gallery */}
      <section className="container-luxury">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-4 aspect-[16/9] overflow-hidden bg-muted">
            <img
              src={gallery[active]}
              alt={p.title}
              className="h-full w-full object-cover"
              width={1600}
              height={900}
            />
          </div>
          {gallery.length > 1 && (
            <div className="md:col-span-4 grid grid-cols-4 gap-3">
              {gallery.map((g: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={
                    "aspect-[4/3] overflow-hidden bg-muted transition-all " +
                    (active === i ? "ring-2 ring-gold" : "opacity-70 hover:opacity-100")
                  }
                >
                  <img src={g} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Details */}
      <section className="container-luxury py-14 grid gap-14 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="gold-rule">{statusLabel(p.status)}</p>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl">{p.title}</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-gold-dark" />
            {p.address}, {p.city}, {p.state} {p.zip}
          </p>
          <p className="mt-6 font-serif text-5xl text-foreground">{p.price}</p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 border-y border-border py-8">
            <Stat icon={BedDouble} label="Bedrooms" value={String(p.beds)} />
            <Stat icon={Bath} label="Bathrooms" value={String(p.baths)} />
            {p.sqft && <Stat icon={Ruler} label="Sq. Feet" value={p.sqft.toLocaleString()} />}
            {p.garage && <Stat icon={Car} label="Garage" value={String(p.garage)} />}
            {p.yearBuilt && <Stat icon={Calendar} label="Year Built" value={String(p.yearBuilt)} />}
            {p.mls && <Stat icon={Hash} label="MLS" value={p.mls} />}
          </div>

          <div className="mt-10">
            <h2 className="font-serif text-2xl">About this property</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{p.description}</p>
          </div>

          {p.features && p.features.length > 0 && (
            <div className="mt-10">
              <h2 className="font-serif text-2xl">Features</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
                {p.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-gold" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {p.amenities && p.amenities.length > 0 && (
            <div className="mt-10">
              <h2 className="font-serif text-2xl">Amenities</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
                {p.amenities.map((f: string) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-gold" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10">
            <h2 className="font-serif text-2xl">Location</h2>
            <div className="mt-4 aspect-[16/7] overflow-hidden border border-border">
              <iframe
                title="Map"
                loading="lazy"
                className="h-full w-full grayscale"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  `${p.address}, ${p.city}, ${p.state} ${p.zip}`,
                )}&output=embed`}
              />
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 h-max">
          <div className="border border-border p-8 bg-muted/40">
            <p className="gold-rule">Interested?</p>
            <h3 className="mt-4 font-serif text-2xl">Schedule a private tour</h3>
            <div className="mt-6 flex items-center gap-3">
              <a href={AGENT.phoneHref} className="btn-gold flex-1">
                <Phone className="h-4 w-4" /> Call
              </a>
              <a href={`mailto:${AGENT.email}`} className="btn-outline flex-1">
                <Mail className="h-4 w-4" /> Email
              </a>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setFavorited((v) => !v)}
                className={
                  "flex-1 inline-flex items-center justify-center gap-2 py-3 border text-xs uppercase tracking-[0.22em] transition-colors " +
                  (favorited
                    ? "bg-gold border-gold text-gold-foreground"
                    : "border-foreground/20 hover:border-gold hover:text-gold-dark")
                }
              >
                <Heart className={"h-4 w-4 " + (favorited ? "fill-current" : "")} /> Favorite
              </button>
              <button
                onClick={share}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-foreground/20 hover:border-gold hover:text-gold-dark text-xs uppercase tracking-[0.22em] transition-colors"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
            <div className="mt-8 pt-8 border-t border-border">
              <ContactForm defaultPropertySlug={p.slug} />
            </div>
          </div>
        </aside>
      </section>

      <SiteFooter />
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div>
      <Icon className="h-5 w-5 text-gold-dark" />
      <div className="mt-2 font-serif text-2xl">{value}</div>
      <div className="text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">{label}</div>
    </div>
  );
}

function statusLabel(s: Property["status"]) {
  return { "for-sale": "For Sale", "for-lease": "For Lease", sold: "Sold", leased: "Leased" }[s];
}
