import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Award, Clock, Handshake, Home as HomeIcon, MessageCircle, Sparkles, Users, Instagram } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import portraitAsset from "@/assets/kaur-tamandeep-portrait.jpg.asset.json";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PropertyCard } from "@/components/property-card";
import { ReviewsCarousel } from "@/components/reviews-carousel";
import { ContactForm } from "@/components/contact-form";
import { AGENT, WHY_CHOOSE } from "@/lib/site-data";
import { listProperties, listReviews } from "@/lib/properties.functions";

const propertiesQuery = queryOptions({
  queryKey: ["properties", "all"],
  queryFn: () => listProperties(),
});
const reviewsQuery = queryOptions({
  queryKey: ["reviews"],
  queryFn: () => listReviews(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(propertiesQuery);
    context.queryClient.ensureQueryData(reviewsQuery);
  },
  component: Home,
  head: () => ({
    meta: [
      { title: "Kaur Tamandeep — Real Estate Agent | Toronto, GTA" },
      {
        name: "description",
        content:
          "Concierge real estate in Toronto and the GTA. Buy, sell, lease, and invest with Kaur Tamandeep — professional, local, and client-focused.",
      },
      { property: "og:title", content: "Kaur Tamandeep — GTA Real Estate" },
      {
        property: "og:description",
        content:
          "Helping you find the perfect home. Buying, selling, leasing, investing across Toronto, GTA.",
      },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Kaur Tamandeep — GTA Real Estate" },
      {
        name: "twitter:description",
        content: "Concierge GTA real estate — buying, selling, leasing, investing.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const ICONS = [Award, Handshake, HomeIcon, MessageCircle, Clock, Sparkles, Users];

function Home() {
  const { data: props } = useSuspenseQuery(propertiesQuery);
  const { data: reviews } = useSuspenseQuery(reviewsQuery);
  const { featured, forSale, sold, leased, all } = props;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* HERO */}
      <section id="home" className="relative min-h-[100svh] flex items-end pt-24">
        <img
          src={heroImg}
          alt="Luxury Texas residence at golden hour"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1200}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/85" />
        <div className="container-luxury relative z-10 pb-20 md:pb-28 text-white">
          <p className="gold-rule text-gold">Toronto · GTA · Concierge Real Estate</p>
          <h1 className="mt-6 font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.02] max-w-4xl">
            Helping You Find <br className="hidden md:block" />the Perfect Home
          </h1>
          <p className="mt-8 max-w-2xl text-base md:text-lg text-white/85 leading-relaxed">
            Whether you're buying, selling, leasing, or investing, {AGENT.name} delivers
            professional real estate services with dedication, transparency, and exceptional
            client care.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#properties" className="btn-gold">View Properties</a>
            <a href="#contact" className="btn-outline text-white border-white">
              Contact Tamandeep
            </a>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section id="properties" className="py-24 md:py-32">
        <div className="container-luxury">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <p className="gold-rule">Featured Listings</p>
              <h2 className="mt-4 font-serif text-4xl md:text-5xl">Curated properties</h2>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              A hand-picked selection across the Greater Toronto Area — from turn-key
              residences to skyline high-rises.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PropertyCard key={p.slug} p={p} />
            ))}
          </div>
          <div className="mt-14 text-center">
            <a href="/properties" className="btn-outline">
              Browse all properties <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* FOR SALE */}
      <section id="for-sale" className="py-24 md:py-32 bg-muted">
        <div className="container-luxury">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <p className="gold-rule">Available Now</p>
              <h2 className="mt-4 font-serif text-4xl md:text-5xl">For Sale Properties</h2>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              Explore Kaur Tamandeep’s current homes available for purchase.
            </p>
          </div>

          {forSale.length === 0 ? (
            <div className="py-20 text-center border border-border bg-background">
              <p className="font-serif text-2xl text-foreground">No properties currently available</p>
              <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
                No properties are currently available for sale. Please check back soon.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {forSale.map((p) => (
                <PropertyCard key={p.slug} p={p} />
              ))}
            </div>
          )}

          <div className="mt-14 text-center">
            <a href="/properties" className="btn-outline">
              View All Properties <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* SOLD */}
      <section id="sold" className="py-24 md:py-32">
        <div className="container-luxury">
          <div className="text-center mb-14">
            <p className="gold-rule">Recently Sold</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">Represented at the closing table</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {sold.map((p) => (
              <PropertyCard key={p.slug} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* LEASED */}
      <section id="leased" className="py-24 md:py-32">
        <div className="container-luxury">
          <div className="text-center mb-14">
            <p className="gold-rule">Recently Leased</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">Keys handed over</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {leased.map((p) => (
              <PropertyCard key={p.slug} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 md:py-32 bg-foreground text-background">
        <div className="container-luxury grid gap-14 lg:grid-cols-2 items-center">
          <div className="relative">
            <div className="absolute -inset-6 border border-gold/40 hidden md:block" />
            <img
              src={portraitAsset.url}
              alt="Portrait of Kaur Tamandeep"
              className="relative w-full h-auto object-cover"
              width={1080}
              height={1080}
              loading="lazy"
            />
          </div>
          <div>
            <p className="gold-rule text-gold">About Tamandeep</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              A trusted advisor for every move
            </h2>
            <p className="mt-6 text-base leading-relaxed text-background/80">
              Kaur Tamandeep is a Toronto and GTA real estate agent with a reputation for
              calm, thorough, client-first representation. From first-time renters to seasoned
              investors, she brings clarity to every transaction and treats each search like
              her own.
            </p>
            <p className="mt-4 text-base leading-relaxed text-background/80">
              <span className="text-gold">Mission —</span> to make finding home feel simple,
              informed, and truly personal. No pressure. No surprises. Just great service.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              <div>
                <div className="font-serif text-4xl text-gold">100%</div>
                <div className="mt-1 text-[0.65rem] uppercase tracking-[0.24em] text-background/60">Client Focus</div>
              </div>
              <div>
                <div className="font-serif text-4xl text-gold">GTA</div>
                <div className="mt-1 text-[0.65rem] uppercase tracking-[0.24em] text-background/60">Local Expert</div>
              </div>
              <div>
                <div className="font-serif text-4xl text-gold">5★</div>
                <div className="mt-1 text-[0.65rem] uppercase tracking-[0.24em] text-background/60">Rated Service</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="py-24 md:py-32">
        <div className="container-luxury">
          <div className="text-center mb-14">
            <p className="gold-rule">Why Choose Tamandeep</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">The details that matter</h2>
          </div>
          <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4 border border-border">
            {WHY_CHOOSE.map((w, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <div key={w.title} className="bg-background p-8 hover:bg-muted transition-colors">
                  <Icon className="h-6 w-6 text-gold-dark" />
                  <h3 className="mt-6 font-serif text-2xl">{w.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{w.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-24 md:py-32 bg-muted">
        <div className="container-luxury">
          <div className="text-center mb-14">
            <p className="gold-rule">Client Reviews</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">Kind words from clients</h2>
          </div>
          <ReviewsCarousel reviews={reviews} />
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 md:py-32">
        <div className="container-luxury grid gap-14 lg:grid-cols-2">
          <div>
            <p className="gold-rule">Get in Touch</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              Let's find your next address
            </h2>
            <p className="mt-6 text-muted-foreground max-w-md leading-relaxed">
              Tell Tamandeep about your goals — a home to buy, a property to sell, an apartment to
              lease, or an investment to explore. Expect a warm, personal response.
            </p>
            <div className="mt-10 space-y-4 text-sm">
              <div>
                <div className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">Phone</div>
                <a href={AGENT.phoneHref} className="font-serif text-2xl hover:text-gold-dark">
                  {AGENT.phone}
                </a>
              </div>
              <div>
                <div className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">Email</div>
                <a href={`mailto:${AGENT.email}`} className="font-serif text-xl hover:text-gold-dark break-all">
                  {AGENT.email}
                </a>
              </div>
              <div>
                <div className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">Service Area</div>
                <p className="font-serif text-xl">{AGENT.location}</p>
              </div>
            </div>
          </div>
          <div className="bg-muted/60 p-8 md:p-12 border border-border">
            <ContactForm properties={all} />
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="py-20 bg-foreground text-background">
        <div className="container-luxury text-center">
          <Instagram className="mx-auto h-8 w-8 text-gold" />
          <h2 className="mt-6 font-serif text-4xl md:text-5xl">Follow Tamandeep on Instagram</h2>
          <p className="mt-4 text-background/70 max-w-lg mx-auto text-sm">
            Fresh listings, closing days, and life around the Metroplex.
          </p>
          <a
            href={AGENT.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 btn-gold"
          >
            @{AGENT.instagram} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
