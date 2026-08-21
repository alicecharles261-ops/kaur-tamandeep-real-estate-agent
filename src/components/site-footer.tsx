import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { AGENT } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container-luxury py-20 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center border border-background/40 font-serif text-lg">
              KT
            </span>
            <div>
              <div className="font-serif text-2xl">Kaur Tamandeep</div>
              <div className="text-[0.65rem] uppercase tracking-[0.32em] text-background/60">
                Entrepreneur | Real Estate Agent
              </div>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-background/70">
            Concierge real estate service across the Greater Toronto Area — buying, selling,
            leasing, and investing with clarity and care.
          </p>
          <a
            href={AGENT.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm text-background/80 hover:text-gold transition-colors"
          >
            <Instagram className="h-4 w-4" /> @{AGENT.instagram}
          </a>
        </div>

        <div>
          <p className="gold-rule text-gold">Quick Links</p>
          <ul className="mt-5 space-y-2 text-sm text-background/75">
            {["Properties", "Sold", "Leased", "Reviews", "About", "Contact"].map((l) => (
              <li key={l}>
                <a href={`#${l.toLowerCase()}`} className="hover:text-gold transition-colors">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="gold-rule text-gold">Contact</p>
          <ul className="mt-5 space-y-3 text-sm text-background/75">
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 text-gold" />
              <a href={AGENT.phoneHref} className="hover:text-gold transition-colors">
                {AGENT.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-0.5 text-gold" />
              <a href={`mailto:${AGENT.email}`} className="hover:text-gold transition-colors break-all">
                {AGENT.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-gold" />
              <span>{AGENT.location}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container-luxury py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-background/50">
          <span>© {new Date().getFullYear()} Kaur Tamandeep. All rights reserved.</span>
          <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
