# Rebrand: Cassandra Burgos → Kaur Tamandeep

Identity-only update. Listings, reviews, layout, and styling stay untouched.

## Brand details applied everywhere
- Name: Kaur Tamandeep
- Initials mark: CB → KT
- Role line: "Entrepreneur | Real Estate Agent — RE/MAX President Realty"
- Service area: Toronto, GTA (replacing Dallas–Fort Worth, TX / DFW wording)
- Phone: 647-774-4480 (tel:+16477744480)
- Email: tamankaurrealtor@gmail.com
- Instagram: @arorataman → https://www.instagram.com/arorataman/
- Footer: "© 2026 Kaur Tamandeep. All rights reserved."

## Where the changes land
- Central brand constants file (name, role, phone, email, Instagram, location) — single source used by nav, footer, contact section.
- Navbar: logo initials and name/role text.
- Hero: headline copy stays; the DFW eyebrow becomes "Toronto · GTA · Concierge Real Estate" and body copy references the new name.
- About section: name, bio references to DFW replaced with Toronto/GTA, stat tile "DFW" → "GTA", and the portrait swapped to the new uploaded photo.
- Footer: logo mark, name, blurb region, contact block, copyright.
- Contact section: phone, email, service area.
- Page titles / meta descriptions / og + twitter tags on home, properties list, property detail, and root — new name and Toronto/GTA region.
- Admin/CMS labels (login screen, dashboard header, admin layout) that show the agent name.

## Photo
The uploaded headshot is added as a CDN-hosted asset and used as the About-section portrait, replacing the current one. No other imagery changes.

## Technical notes
- New portrait uploaded via the assets CLI as a `.asset.json` pointer and imported where the old `cassandra-portrait.jpg` import was; old asset removed.
- Brand values stay in `src/lib/site-data.ts` so nothing is hardcoded per component.
- Sitemap and structured data (if present) inherit the updated constants.
