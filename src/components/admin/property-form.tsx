import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { slugify, generateId, PROPERTY_TYPES, US_STATES } from "@/lib/admin-utils";
import { TagInput } from "./tag-input";
import { ImageManager } from "./image-manager";
import {
  X, Save, Globe, Eye, EyeOff, Star, Archive, FileText,
  MapPin, Home, Calendar, Video, Search, FileImage, Loader2,
} from "lucide-react";

export interface PropertyFormData {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  is_draft: boolean;
  is_hidden: boolean;
  is_published: boolean;
  is_archived: boolean;
  is_featured: boolean;
  price: string;
  lease_price: string;
  mls: string;
  date_label: string;
  sort_order: string;
  // Location
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: string;
  longitude: string;
  google_maps_url: string;
  // Details
  beds: string;
  baths: string;
  garage: string;
  stories: string;
  sqft: string;
  lot_size: string;
  year_built: string;
  // Schedule
  open_house_date: string;
  open_house_time: string;
  // Media
  video_url: string;
  virtual_tour_url: string;
  // Description
  description: string;
  // Arrays
  features: string[];
  amenities: string[];
  nearby_schools: string[];
  nearby_shopping: string[];
  nearby_restaurants: string[];
  nearby_hospitals: string[];
  energy_rating: string;
  // Images
  image_key: string;
  gallery_keys: string[];
  // Documents
  documents: string[];
  // SEO
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

const EMPTY_FORM: PropertyFormData = {
  id: "",
  slug: "",
  title: "",
  type: "Single-Family Home",
  status: "for-sale",
  is_draft: false,
  is_hidden: false,
  is_published: true,
  is_archived: false,
  is_featured: false,
  price: "",
  lease_price: "",
  mls: "",
  date_label: "",
  sort_order: "0",
  address: "",
  city: "",
  state: "TX",
  zip: "",
  latitude: "",
  longitude: "",
  google_maps_url: "",
  beds: "",
  baths: "",
  garage: "",
  stories: "",
  sqft: "",
  lot_size: "",
  year_built: "",
  open_house_date: "",
  open_house_time: "",
  video_url: "",
  virtual_tour_url: "",
  description: "",
  features: [],
  amenities: [],
  nearby_schools: [],
  nearby_shopping: [],
  nearby_restaurants: [],
  nearby_hospitals: [],
  energy_rating: "",
  image_key: "",
  gallery_keys: [],
  documents: [],
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
};

interface PropertyFormProps {
  open: boolean;
  initial?: Partial<PropertyFormData> & { id?: string };
  onClose: () => void;
  onSaved: (property: any) => void;
}

type Section =
  | "status"
  | "basic"
  | "pricing"
  | "location"
  | "details"
  | "schedule"
  | "description"
  | "features"
  | "nearby"
  | "media"
  | "images"
  | "documents"
  | "seo";

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "status",      label: "Status & Visibility", icon: <Eye className="h-3.5 w-3.5" /> },
  { id: "basic",       label: "Basic Info",           icon: <Home className="h-3.5 w-3.5" /> },
  { id: "pricing",     label: "Pricing",              icon: <span className="text-xs font-bold">$</span> },
  { id: "location",    label: "Location",             icon: <MapPin className="h-3.5 w-3.5" /> },
  { id: "details",     label: "Property Details",     icon: <Home className="h-3.5 w-3.5" /> },
  { id: "schedule",    label: "Open House",           icon: <Calendar className="h-3.5 w-3.5" /> },
  { id: "description", label: "Description",          icon: <FileText className="h-3.5 w-3.5" /> },
  { id: "features",    label: "Features & Amenities", icon: <Star className="h-3.5 w-3.5" /> },
  { id: "nearby",      label: "Nearby Places",        icon: <MapPin className="h-3.5 w-3.5" /> },
  { id: "media",       label: "Video & Tour",         icon: <Video className="h-3.5 w-3.5" /> },
  { id: "images",      label: "Images",               icon: <FileImage className="h-3.5 w-3.5" /> },
  { id: "documents",   label: "Documents",            icon: <FileText className="h-3.5 w-3.5" /> },
  { id: "seo",         label: "SEO",                  icon: <Search className="h-3.5 w-3.5" /> },
];

function rowFromForm(f: PropertyFormData): any {
  return {
    id: f.id || undefined,
    slug: f.slug,
    title: f.title.trim(),
    type: f.type,
    status: f.status as any,
    is_draft: f.is_draft,
    is_hidden: f.is_hidden,
    is_published: f.is_published,
    is_archived: f.is_archived,
    is_featured: f.is_featured,
    price: f.price.trim() || "—",
    lease_price: f.lease_price.trim() || null,
    mls: f.mls.trim() || null,
    date_label: f.date_label.trim() || null,
    sort_order: parseInt(f.sort_order) || 0,
    address: f.address.trim(),
    city: f.city.trim(),
    state: f.state,
    zip: f.zip.trim(),
    latitude: f.latitude ? parseFloat(f.latitude) : null,
    longitude: f.longitude ? parseFloat(f.longitude) : null,
    google_maps_url: f.google_maps_url.trim() || null,
    beds: parseInt(f.beds) || 0,
    baths: parseFloat(f.baths) || 0,
    garage: f.garage !== "" ? parseInt(f.garage) : null,
    stories: f.stories !== "" ? parseInt(f.stories) : null,
    sqft: f.sqft !== "" ? parseInt(f.sqft) : null,
    lot_size: f.lot_size.trim() || null,
    year_built: f.year_built !== "" ? parseInt(f.year_built) : null,
    open_house_date: f.open_house_date || null,
    open_house_time: f.open_house_time || null,
    video_url: f.video_url.trim() || null,
    virtual_tour_url: f.virtual_tour_url.trim() || null,
    description: f.description.trim(),
    features: f.features,
    amenities: f.amenities,
    nearby_schools: f.nearby_schools,
    nearby_shopping: f.nearby_shopping,
    nearby_restaurants: f.nearby_restaurants,
    nearby_hospitals: f.nearby_hospitals,
    energy_rating: f.energy_rating.trim() || null,
    image_key: f.image_key || "",
    gallery_keys: f.gallery_keys,
    documents: f.documents,
    seo_title: f.seo_title.trim() || null,
    seo_description: f.seo_description.trim() || null,
    seo_keywords: f.seo_keywords.trim() || null,
  };
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  open,
  initial,
  onClose,
  onSaved,
}) => {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<PropertyFormData>(() => ({
    ...EMPTY_FORM,
    id: generateId(),
    ...initial,
  }));
  const [activeSection, setActiveSection] = useState<Section>("status");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Reset form when initial changes
  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY_FORM,
        id: initial?.id || generateId(),
        ...initial,
      });
      setError(null);
      setActiveSection("status");
    }
  }, [open, initial?.id]);

  const set = <K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Auto-generate slug from title (only when creating)
  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: isEdit ? prev.slug : slugify(title),
    }));
  };

  const scrollToSection = (id: Section) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSave = async (asDraft = false) => {
    setError(null);
    if (!form.title.trim()) { setError("Title is required."); scrollToSection("basic"); return; }
    if (!form.address.trim()) { setError("Address is required."); scrollToSection("location"); return; }
    if (!form.city.trim()) { setError("City is required."); scrollToSection("location"); return; }
    if (!form.zip.trim()) { setError("ZIP code is required."); scrollToSection("location"); return; }

    const slug = form.slug.trim() || slugify(form.title);
    const payload = rowFromForm({ ...form, slug, is_draft: asDraft });

    setSaving(true);
    try {
      let data: any;
      let err: any;

      if (isEdit) {
        const res = await supabase
          .from("properties")
          .update(payload)
          .eq("id", form.id)
          .select()
          .single();
        data = res.data;
        err = res.error;
      } else {
        const res = await supabase
          .from("properties")
          .insert(payload)
          .select()
          .single();
        data = res.data;
        err = res.error;
      }

      if (err) throw err;
      onSaved(data);
    } catch (e: any) {
      console.error(e);
      if (e?.message?.includes("row-level security")) {
        setError(
          "Permission denied. The database migration hasn't been applied yet. " +
          "Please run the SQL in supabase/migrations/20260730000000_cms_extension.sql " +
          "via the Supabase dashboard SQL Editor."
        );
      } else if (e?.message?.includes("duplicate key") || e?.message?.includes("unique")) {
        setError(`Slug "${form.slug}" is already in use. Change the title or edit the slug manually.`);
        scrollToSection("basic");
      } else {
        setError(e?.message || "Save failed. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const field = (
    label: string,
    key: keyof PropertyFormData,
    type = "text",
    placeholder = "",
    opts?: { multiline?: boolean; hint?: string }
  ) => (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
        {label}
      </label>
      {opts?.multiline ? (
        <textarea
          value={(form[key] as string) ?? ""}
          onChange={(e) => set(key, e.target.value as any)}
          placeholder={placeholder}
          rows={4}
          className="w-full rounded-lg border border-white/15 bg-[#0d0d0f] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37]/60 focus:outline-none resize-y"
        />
      ) : (
        <input
          type={type}
          value={(form[key] as string) ?? ""}
          onChange={(e) => set(key, e.target.value as any)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-white/15 bg-[#0d0d0f] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37]/60 focus:outline-none"
        />
      )}
      {opts?.hint && <p className="mt-1 text-[10px] text-zinc-500">{opts.hint}</p>}
    </div>
  );

  const toggle = (label: string, key: keyof PropertyFormData, description?: string) => (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div>
        <p className="text-xs font-medium text-zinc-200">{label}</p>
        {description && <p className="text-[10px] text-zinc-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => set(key, !(form[key] as boolean) as any)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 transition-colors ${
          form[key] ? "bg-[#d4af37] border-[#d4af37]" : "bg-zinc-700 border-zinc-600"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
            form[key] ? "translate-x-3.5" : "translate-x-0.5"
          } mt-px`}
        />
      </button>
    </div>
  );

  const sectionHeader = (id: Section, title: string) => (
    <div
      ref={(el) => { sectionRefs.current[id] = el; }}
      className="border-b border-white/10 pb-2 mb-5"
    >
      <h3 className="text-sm font-serif font-semibold text-white">{title}</h3>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto flex h-full w-full max-w-5xl flex-col bg-[#111114] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 shrink-0">
          <div>
            <h2 className="font-serif text-lg font-bold text-white">
              {isEdit ? "Edit Property" : "Create Property"}
            </h2>
            {form.slug && (
              <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">/{form.slug}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Nav */}
          <nav className="w-44 shrink-0 border-r border-white/10 bg-[#0d0d10] overflow-y-auto py-4 hidden md:block">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToSection(s.id)}
                className={`w-full flex items-center gap-2 px-3.5 py-2 text-left text-xs transition-colors ${
                  activeSection === s.id
                    ? "bg-[#d4af37]/10 text-[#d4af37] font-semibold border-r-2 border-[#d4af37]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

            {/* Error Banner */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* ── STATUS & VISIBILITY ── */}
            <section>
              {sectionHeader("status", "Status & Visibility")}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Property Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#0d0d0f] px-3 py-2 text-xs text-white focus:border-[#d4af37]/60 focus:outline-none"
                  >
                    <option value="for-sale">For Sale</option>
                    <option value="for-lease">For Lease</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                    <option value="leased">Leased</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => set("sort_order", e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#0d0d0f] px-3 py-2 text-xs text-white focus:border-[#d4af37]/60 focus:outline-none"
                  />
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#0d0d0f] px-4 py-1 divide-y divide-white/5">
                {toggle("Published",        "is_published", "Visible on public site")}
                {toggle("Featured Listing", "is_featured",  "Highlighted on homepage")}
                {toggle("Draft",            "is_draft",     "Only visible in admin dashboard")}
                {toggle("Hidden",           "is_hidden",    "Not visible publicly")}
                {toggle("Archived",         "is_archived",  "Archived — removed from all views")}
              </div>
            </section>

            {/* ── BASIC INFO ── */}
            <section>
              {sectionHeader("basic", "Basic Information")}
              <div className="space-y-4">
                {field("Property Title *", "title", "text", "e.g. Stunning 4BR in Frisco")}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => set("slug", slugify(e.target.value))}
                      placeholder="auto-generated-from-title"
                      className="w-full rounded-lg border border-white/15 bg-[#0d0d0f] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37]/60 focus:outline-none font-mono"
                    />
                    <p className="mt-1 text-[10px] text-zinc-500">URL: /properties/{form.slug || "slug"}</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Property Type *
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => set("type", e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-[#0d0d0f] px-3 py-2 text-xs text-white focus:border-[#d4af37]/60 focus:outline-none"
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {field("MLS Number", "mls", "text", "DAL-25-XXXX")}
                  {field("Year / Date Label", "date_label", "text", "2025", { hint: "Shown on sold/leased cards" })}
                </div>
              </div>
            </section>

            {/* ── PRICING ── */}
            <section>
              {sectionHeader("pricing", "Pricing")}
              <div className="grid grid-cols-2 gap-4">
                {field("Sale Price", "price", "text", "$450,000")}
                {field("Lease Price", "lease_price", "text", "$2,800/mo")}
              </div>
            </section>

            {/* ── LOCATION ── */}
            <section>
              {sectionHeader("location", "Location")}
              <div className="space-y-4">
                {field("Street Address *", "address", "text", "1234 Maple Street")}
                <div className="grid grid-cols-3 gap-4">
                  {field("City *", "city", "text", "Dallas")}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      State *
                    </label>
                    <select
                      value={form.state}
                      onChange={(e) => set("state", e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-[#0d0d0f] px-3 py-2 text-xs text-white focus:border-[#d4af37]/60 focus:outline-none"
                    >
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  {field("ZIP Code *", "zip", "text", "75201")}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {field("Latitude", "latitude", "number", "32.7767")}
                  {field("Longitude", "longitude", "number", "-96.7970")}
                </div>
                {field("Google Maps URL", "google_maps_url", "url", "https://maps.google.com/...")}
              </div>
            </section>

            {/* ── PROPERTY DETAILS ── */}
            <section>
              {sectionHeader("details", "Property Details")}
              <div className="grid grid-cols-3 gap-4">
                {field("Bedrooms", "beds", "number", "4")}
                {field("Bathrooms", "baths", "number", "3")}
                {field("Garage", "garage", "number", "2")}
                {field("Stories", "stories", "number", "2")}
                {field("Sq Ft", "sqft", "number", "2800")}
                {field("Lot Size", "lot_size", "text", "0.25 acres")}
                {field("Year Built", "year_built", "number", "2020")}
                {field("Energy Rating", "energy_rating", "text", "A+", { hint: "Optional energy efficiency rating" })}
              </div>
            </section>

            {/* ── OPEN HOUSE ── */}
            <section>
              {sectionHeader("schedule", "Open House")}
              <div className="grid grid-cols-2 gap-4">
                {field("Open House Date", "open_house_date", "date")}
                {field("Open House Time", "open_house_time", "text", "12:00 PM – 3:00 PM")}
              </div>
            </section>

            {/* ── DESCRIPTION ── */}
            <section>
              {sectionHeader("description", "Description")}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Property Description (Rich Text / Markdown supported)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe the property in detail…"
                  rows={8}
                  className="w-full rounded-lg border border-white/15 bg-[#0d0d0f] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37]/60 focus:outline-none resize-y font-mono leading-relaxed"
                />
                <p className="mt-1 text-[10px] text-zinc-500">Supports Markdown formatting.</p>
              </div>
            </section>

            {/* ── FEATURES & AMENITIES ── */}
            <section>
              {sectionHeader("features", "Features & Amenities")}
              <div className="space-y-4">
                <TagInput
                  label="Property Features"
                  values={form.features}
                  onChange={(v) => set("features", v)}
                  placeholder="e.g. Hardwood floors, Marble counters…"
                />
                <TagInput
                  label="Amenities"
                  values={form.amenities}
                  onChange={(v) => set("amenities", v)}
                  placeholder="e.g. Pool, Gym, Concierge…"
                />
              </div>
            </section>

            {/* ── NEARBY ── */}
            <section>
              {sectionHeader("nearby", "Nearby Places")}
              <div className="space-y-4">
                <TagInput
                  label="Nearby Schools"
                  values={form.nearby_schools}
                  onChange={(v) => set("nearby_schools", v)}
                  placeholder="e.g. Frisco ISD, Legacy High School…"
                />
                <TagInput
                  label="Nearby Shopping"
                  values={form.nearby_shopping}
                  onChange={(v) => set("nearby_shopping", v)}
                  placeholder="e.g. Stonebriar Mall, Whole Foods…"
                />
                <TagInput
                  label="Nearby Restaurants"
                  values={form.nearby_restaurants}
                  onChange={(v) => set("nearby_restaurants", v)}
                  placeholder="e.g. Flower Child, Salt Grass…"
                />
                <TagInput
                  label="Nearby Hospitals"
                  values={form.nearby_hospitals}
                  onChange={(v) => set("nearby_hospitals", v)}
                  placeholder="e.g. Medical City Frisco…"
                />
              </div>
            </section>

            {/* ── VIDEO & TOUR ── */}
            <section>
              {sectionHeader("media", "Video & Virtual Tour")}
              <div className="space-y-4">
                {field("Video URL", "video_url", "url", "https://youtube.com/watch?v=...")}
                {field("Virtual Tour URL", "virtual_tour_url", "url", "https://my.matterport.com/...")}
              </div>
            </section>

            {/* ── IMAGES ── */}
            <section>
              {sectionHeader("images", "Property Images")}
              <ImageManager
                propertyId={form.id}
                imageKey={form.image_key}
                galleryKeys={form.gallery_keys}
                onChange={(imageKey, galleryKeys) => {
                  set("image_key", imageKey);
                  set("gallery_keys", galleryKeys);
                }}
              />
            </section>

            {/* ── DOCUMENTS ── */}
            <section>
              {sectionHeader("documents", "Property Documents (PDF)")}
              <DocumentUpload
                propertyId={form.id}
                documents={form.documents}
                onChange={(docs) => set("documents", docs)}
              />
            </section>

            {/* ── SEO ── */}
            <section>
              {sectionHeader("seo", "SEO")}
              <div className="space-y-4">
                {field("SEO Title", "seo_title", "text", "4BR Home in Mississauga ON | Kaur Tamandeep")}
                {field("SEO Description", "seo_description", "text", "", { multiline: true })}
                {field("SEO Keywords", "seo_keywords", "text", "frisco tx homes for sale, 4 bedroom house frisco")}
              </div>
            </section>

            {/* Bottom spacer */}
            <div className="h-6" />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/10 bg-[#111114] px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg border border-white/15 bg-[#161616] px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              Save Draft
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-white/15 px-4 py-2 text-xs text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#d4af37] px-5 py-2 text-xs font-bold text-black hover:bg-[#c9a52e] transition-colors disabled:opacity-50 shadow-lg shadow-[#d4af37]/20"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
              {saving ? "Saving…" : isEdit ? "Update & Publish" : "Create & Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────── Document Upload ────────────── */
interface DocumentUploadProps {
  propertyId: string;
  documents: string[];
  onChange: (docs: string[]) => void;
}

function DocumentUpload({ propertyId, documents, onChange }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const SUPABASE_URL =
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL) || "";

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of files) {
      const path = `properties/${propertyId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("property-documents")
        .upload(path, file, { contentType: "application/pdf", upsert: false });
      if (!error) uploaded.push(path);
    }
    onChange([...documents, ...uploaded]);
    setUploading(false);
  };

  const handleRemove = async (path: string) => {
    await supabase.storage.from("property-documents").remove([path]);
    onChange(documents.filter((d) => d !== path));
  };

  const getDocUrl = (path: string) =>
    `${SUPABASE_URL}/storage/v1/object/public/property-documents/${path}`;

  const getDocName = (path: string) => path.split("/").pop() || path;

  return (
    <div className="space-y-3">
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-[#0d0d0f] py-6 cursor-pointer hover:border-[#d4af37]/50 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <FileText className="h-5 w-5 text-zinc-400" />
        <p className="text-xs text-zinc-400">
          {uploading ? "Uploading…" : "Click to upload PDF documents"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length) handleUpload(files);
            e.target.value = "";
          }}
        />
      </div>
      {documents.length > 0 && (
        <div className="space-y-1.5">
          {documents.map((doc) => (
            <div
              key={doc}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0d0d0f] px-3 py-2"
            >
              <a
                href={getDocUrl(doc)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 truncate max-w-[80%]"
              >
                {getDocName(doc)}
              </a>
              <button
                type="button"
                onClick={() => handleRemove(doc)}
                className="text-zinc-500 hover:text-red-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
