import React, { useEffect, useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/admin/protected-route";
import { AdminLayout, AdminTab } from "@/components/admin/admin-layout";
import { OverviewCards, DashboardMetrics } from "@/components/admin/overview-cards";
import { RecentActivity, ActivityItem } from "@/components/admin/recent-activity";
import { PropertyTable, PropertyRow } from "@/components/admin/property-table";
import { PropertyForm, PropertyFormData } from "@/components/admin/property-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  RefreshCw, Mail, Phone, Calendar, Tag,
  ShieldCheck, UserCheck, Lock, Database, Terminal,
} from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardRoute,
});

function AdminDashboardRoute() {
  return (
    <ProtectedRoute>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [loading, setLoading] = useState(true);

  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    leasedListings: 0,
    draftListings: 0,
    featuredListings: 0,
    hiddenListings: 0,
    totalInquiries: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Property form state
  const [formOpen, setFormOpen] = useState(false);
  const [editProperty, setEditProperty] = useState<Partial<PropertyFormData> | undefined>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [propsRes, inqRes] = await Promise.all([
        supabase.from("properties").select("*").order("created_at", { ascending: false }),
        supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      ]);

      const loadedProps: PropertyRow[] = propsRes.data || [];
      const loadedInqs = inqRes.data || [];

      setProperties(loadedProps);
      setInquiries(loadedInqs);

      // Metrics
      setMetrics({
        totalListings: loadedProps.length,
        activeListings: loadedProps.filter((p) => (p.status === "for-sale" || p.status === "for-lease") && !p.is_draft && !p.is_hidden && !p.is_archived).length,
        soldListings: loadedProps.filter((p) => p.status === "sold").length,
        leasedListings: loadedProps.filter((p) => p.status === "leased").length,
        draftListings: loadedProps.filter((p) => p.is_draft).length,
        featuredListings: loadedProps.filter((p) => p.is_featured).length,
        hiddenListings: loadedProps.filter((p) => p.is_hidden).length,
        totalInquiries: loadedInqs.length,
      });

      // Activity feed
      const propActs: ActivityItem[] = loadedProps.slice(0, 5).map((p) => ({
        id: `prop-${p.id}`,
        type: "property",
        title: p.title,
        subtitle: `${p.city}, ${p.state} • ${p.price}`,
        status: p.status,
        timestamp: p.created_at,
      }));
      const inqActs: ActivityItem[] = loadedInqs.slice(0, 5).map((i) => ({
        id: `inq-${i.id}`,
        type: "inquiry",
        title: `Inquiry from ${i.name}`,
        subtitle: i.property_slug ? `Re: ${i.property_slug}` : (i.message || "").substring(0, 45) + "…",
        timestamp: i.created_at,
      }));
      setActivities(
        [...propActs, ...inqActs]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 8)
      );
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Property Form Handlers ── */
  const handleCreate = () => {
    setEditProperty(undefined);
    setFormOpen(true);
  };

  const handleEdit = (p: PropertyRow) => {
    // Map PropertyRow → PropertyFormData shape
    setEditProperty({
      id: p.id,
      slug: p.slug,
      title: p.title,
      type: p.type,
      status: p.status,
      is_draft: p.is_draft ?? false,
      is_hidden: p.is_hidden ?? false,
      is_published: p.is_published ?? true,
      is_archived: p.is_archived ?? false,
      is_featured: p.is_featured ?? false,
      price: p.price ?? "",
      lease_price: p.lease_price ?? "",
      mls: p.mls ?? "",
      date_label: p.date_label ?? "",
      sort_order: String(p.sort_order ?? 0),
      address: p.address ?? "",
      city: p.city ?? "",
      state: p.state ?? "",
      zip: p.zip ?? "",
      latitude: p.latitude != null ? String(p.latitude) : "",
      longitude: p.longitude != null ? String(p.longitude) : "",
      google_maps_url: p.google_maps_url ?? "",
      beds: p.beds != null ? String(p.beds) : "",
      baths: p.baths != null ? String(p.baths) : "",
      garage: p.garage != null ? String(p.garage) : "",
      stories: p.stories != null ? String(p.stories) : "",
      sqft: p.sqft != null ? String(p.sqft) : "",
      lot_size: p.lot_size ?? "",
      year_built: p.year_built != null ? String(p.year_built) : "",
      open_house_date: p.open_house_date ?? "",
      open_house_time: p.open_house_time ?? "",
      video_url: p.video_url ?? "",
      virtual_tour_url: p.virtual_tour_url ?? "",
      description: p.description ?? "",
      features: p.features ?? [],
      amenities: p.amenities ?? [],
      nearby_schools: p.nearby_schools ?? [],
      nearby_shopping: p.nearby_shopping ?? [],
      nearby_restaurants: p.nearby_restaurants ?? [],
      nearby_hospitals: p.nearby_hospitals ?? [],
      energy_rating: p.energy_rating ?? "",
      image_key: p.image_key ?? "",
      gallery_keys: p.gallery_keys ?? [],
      documents: p.documents ?? [],
      seo_title: p.seo_title ?? "",
      seo_description: p.seo_description ?? "",
      seo_keywords: p.seo_keywords ?? "",
    });
    setFormOpen(true);
  };

  const handleSaved = () => {
    setFormOpen(false);
    setEditProperty(undefined);
    fetchData();
  };

  const filteredInquiries = inquiries.filter((i) => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      i.name?.toLowerCase().includes(q) ||
      i.email?.toLowerCase().includes(q) ||
      i.message?.toLowerCase().includes(q)
    );
  });

  const MIGRATION_SQL = `-- Backend database migration


ALTER TYPE public.property_status ADD VALUE IF NOT EXISTS 'pending';

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS lease_price text,
  ADD COLUMN IF NOT EXISTS latitude numeric(10,7),
  ADD COLUMN IF NOT EXISTS longitude numeric(10,7),
  ADD COLUMN IF NOT EXISTS stories integer,
  ADD COLUMN IF NOT EXISTS lot_size text,
  ADD COLUMN IF NOT EXISTS open_house_date text,
  ADD COLUMN IF NOT EXISTS open_house_time text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS virtual_tour_url text,
  ADD COLUMN IF NOT EXISTS google_maps_url text,
  ADD COLUMN IF NOT EXISTS nearby_schools text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS nearby_shopping text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS nearby_restaurants text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS nearby_hospitals text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS energy_rating text,
  ADD COLUMN IF NOT EXISTS documents text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_keywords text,
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_draft boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

GRANT INSERT, UPDATE, DELETE ON public.properties TO authenticated;

CREATE POLICY IF NOT EXISTS "Admin can insert properties" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Admin can update properties" ON public.properties
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Admin can delete properties" ON public.properties
  FOR DELETE TO authenticated USING (true);

INSERT INTO storage.buckets (id, name, public)
  VALUES ('property-images', 'property-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');
CREATE POLICY "Admin can upload property images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images');
CREATE POLICY "Admin can update property images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'property-images');
CREATE POLICY "Admin can delete property images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'property-images');`;

  return (
    <>
      {/* Property Form (slide-over) */}
      <PropertyForm
        open={formOpen}
        initial={editProperty}
        onClose={() => { setFormOpen(false); setEditProperty(undefined); }}
        onSaved={handleSaved}
      />

      <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {/* Tab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white capitalize">
              {activeTab === "dashboard" ? "Dashboard" : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management`}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Kaur Tamandeep Luxury Real Estate — Admin Portal
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-white/15 bg-[#161616] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#d4af37] ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <OverviewCards metrics={metrics} loading={loading} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <RecentActivity activities={activities} loading={loading} />
              </div>
              <div className="rounded-xl border border-white/10 bg-[#141414] p-6 shadow-xl space-y-4">
                <h3 className="text-base font-serif font-semibold text-white flex items-center justify-between">
                  <span>System Status</span>
                  <span className="text-[10px] font-sans font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Online
                  </span>
                </h3>
                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-zinc-300">Database</span>
                    <span className="text-emerald-400 font-medium">Supabase Connected</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-zinc-300">Auth Session</span>
                    <span className="text-zinc-200 font-medium">Secured JWT</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-zinc-300">Admin Account</span>
                    <span className="text-[#d4af37] font-medium truncate max-w-[150px]">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-300">CMS Status</span>
                    <span className="text-emerald-400 font-medium">Active</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <button
                    onClick={() => setActiveTab("properties")}
                    className="w-full rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 px-3 py-2 text-xs text-[#d4af37] font-medium hover:bg-[#d4af37]/20 transition-colors"
                  >
                    Manage Properties →
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-zinc-300 font-medium hover:bg-white/10 transition-colors"
                  >
                    View Migration SQL →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PROPERTIES TAB ── */}
        {activeTab === "properties" && (
          <PropertyTable
            properties={properties}
            loading={loading}
            onEdit={handleEdit}
            onCreate={handleCreate}
            onRefresh={fetchData}
          />
        )}

        {/* ── INQUIRIES TAB ── */}
        {activeTab === "inquiries" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search inquiries…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#141414] pl-4 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37]/60 focus:outline-none"
                />
              </div>
              <p className="text-xs text-zinc-300">{filteredInquiries.length} messages</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInquiries.length === 0 ? (
                <div className="col-span-full py-12 text-center text-zinc-400 bg-[#141414] rounded-xl border border-white/10">
                  No inquiries found.
                </div>
              ) : (
                filteredInquiries.map((inq) => (
                  <div key={inq.id} className="rounded-xl border border-white/10 bg-[#141414] p-5 shadow-lg space-y-3 hover:border-[#d4af37]/40 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{inq.name}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-[#d4af37]" />
                            <a href={`mailto:${inq.email}`} className="hover:text-white transition-colors">{inq.email}</a>
                          </span>
                          {inq.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-[#d4af37]" />
                              {inq.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1 shrink-0">
                        <Calendar className="h-3 w-3" />
                        {inq.created_at ? format(new Date(inq.created_at), "MMM d, h:mm a") : "Recent"}
                      </span>
                    </div>
                    {inq.property_slug && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#d4af37]/10 text-[#d4af37] text-[11px] font-medium border border-[#d4af37]/20">
                        <Tag className="h-3 w-3" />
                        <span>Re: {inq.property_slug}</span>
                      </div>
                    )}
                    <p className="text-xs text-zinc-300 bg-black/40 p-3 rounded-lg border border-white/5 leading-relaxed">
                      "{inq.message}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-4xl">
            {/* Migration Notice */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-300">Database Migration Required</h3>
                  <p className="text-xs text-amber-200/70 mt-1">
                    To enable all CMS features (new fields, image storage, write access), the migration below must be
                    applied to the backend database. This is a one-time setup.
                  </p>
                </div>
              </div>
            </div>

            {/* Migration SQL */}
            <div className="rounded-xl border border-white/10 bg-[#141414] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-[#d4af37]" />
                  <span className="text-xs font-semibold text-zinc-200">
                    supabase/migrations/20260730000000_cms_extension.sql
                  </span>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(MIGRATION_SQL)}
                  className="text-[10px] text-zinc-400 hover:text-white transition-colors border border-white/15 rounded px-2 py-1"
                >
                  Copy SQL
                </button>
              </div>
              <pre className="overflow-x-auto p-4 text-[10px] text-zinc-300 leading-relaxed font-mono max-h-96 overflow-y-auto">
                {MIGRATION_SQL}
              </pre>
            </div>

            {/* Security info */}
            <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
              <h3 className="text-base font-serif font-semibold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#d4af37]" />
                Security & Configuration
              </h3>
              <div className="space-y-3 text-xs">
                <InfoRow label="Backend" value="Lovable Cloud" status="connected" />
                <InfoRow label="Auth Strategy" value="JWT (auto-refresh enabled)" status="active" />
                <InfoRow label="RLS Policies" value="Enabled on all tables" status="enforced" />
                <InfoRow label="Storage Bucket" value="property-images (public)" status="pending" />
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-xl border border-white/10 bg-[#141414] p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <div className="h-16 w-16 rounded-full bg-[#d4af37]/20 text-[#d4af37] border-2 border-[#d4af37] flex items-center justify-center font-bold text-2xl uppercase shadow-lg shadow-[#d4af37]/10">
                  {user?.email?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">Administrator Account</h3>
                  <p className="text-xs text-zinc-400">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider border border-emerald-500/20">
                    <UserCheck className="h-3 w-3" />
                    Authenticated Admin
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-zinc-400">User ID</span>
                  <p className="font-mono text-zinc-200 font-medium mt-1 truncate">{user?.id}</p>
                </div>
                <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-zinc-400">Last Sign-In</span>
                  <p className="text-zinc-200 font-medium mt-1">
                    {user?.last_sign_in_at ? format(new Date(user.last_sign_in_at), "PPpp") : "Current session"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-zinc-400">Email Status</span>
                  <p className="text-emerald-400 font-medium mt-1 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Administrator
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-zinc-400">Access Scope</span>
                  <p className="text-[#d4af37] font-medium mt-1">Full CMS Admin</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}

function InfoRow({ label, value, status }: { label: string; value: string; status: "connected" | "active" | "enforced" | "pending" }) {
  const colors = {
    connected: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    active: "text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/20",
    enforced: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };
  return (
    <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
      <div>
        <p className="font-semibold text-white">{label}</p>
        <p className="text-zinc-400 mt-0.5">{value}</p>
      </div>
      <span className={`px-2.5 py-1 rounded border font-bold text-[10px] uppercase tracking-wider ${colors[status]}`}>
        {status}
      </span>
    </div>
  );
}
