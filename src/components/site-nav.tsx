import { Link } from "@tanstack/react-router";
import { Instagram, Menu, X, Phone } from "lucide-react";
import { useState } from "react";
import { AGENT } from "@/lib/site-data";

const NAV_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "Properties", href: "/properties" },
  { label: "Sold", href: "/#sold" },
  { label: "Leased", href: "/#leased" },
  { label: "Reviews", href: "/#reviews" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-black/5">
      <div className="container-luxury flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" aria-label="Kaur Tamandeep — home">
          <span className="inline-flex h-11 w-11 items-center justify-center border border-foreground/80 font-serif text-lg tracking-tight text-foreground">
            KT
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-base sm:text-lg text-foreground">Kaur Tamandeep</span>
            <span className="text-[0.58rem] sm:text-[0.62rem] uppercase tracking-[0.28em] sm:tracking-[0.32em] text-muted-foreground">
              Real Estate
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-[0.78rem] uppercase tracking-[0.22em] text-foreground/80 hover:text-foreground transition-colors after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform hover:after:scale-x-100"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={AGENT.instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="hidden md:inline-flex h-10 w-10 items-center justify-center text-foreground/70 hover:text-gold-dark transition-colors"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a href="#contact" className="hidden md:inline-flex btn-gold">
            Book a Consultation
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center text-foreground"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-black/5 bg-white/95 backdrop-blur-xl">
          <div className="container-luxury py-6 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.22em] text-foreground/80"
              >
                {l.label}
              </a>
            ))}
            <a href={AGENT.phoneHref} className="text-sm text-foreground/80 flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold-dark" /> {AGENT.phone}
            </a>
            <a href="#contact" onClick={() => setOpen(false)} className="btn-gold w-full">
              Book a Consultation
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
