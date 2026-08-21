import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "@/lib/property-images";
import { STATUS_LABELS, generateId } from "@/lib/admin-utils";
import { format } from "date-fns";
import {
  Edit, Trash2, Copy, ExternalLink, Eye, EyeOff, Star,
  CheckSquare, Home, Clock, Search, SlidersHorizontal,
  MoreHorizontal, RefreshCw, PlusCircle, Archive,
} from "lucide-react";

export interface PropertyRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  type: string;
  price: string;
  lease_price?: string | null;
  city: string;
  state: string;
  created_at: string;
  is_published?: boolean;
  is_featured?: boolean;
  is_draft?: boolean;
  is_hidden?: boolean;
  is_archived?: boolean;
  image_key: string;
  gallery_keys?: string[];
  [key: string]: any;
}

interface PropertyTableProps {
  properties: PropertyRow[];
  loading: boolean;
  onEdit: (property: PropertyRow) => void;
  onCreate: () => void;
  onRefresh: () => void;
}

type FilterStatus = "all" | "for-sale" | "for-lease" | "sold" | "leased" | "pending" | "draft" | "hidden" | "archived";

function StatusBadge({ p }: { p: PropertyRow }) {
  if (p.is_draft) return <span className="inline-flex items-center gap-1 rounded border border-zinc-600/50 bg-zinc-700/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Draft</span>;
  if (p.is_archived) return <span className="inline-flex items-center gap-1 rounded border border-zinc-600/50 bg-zinc-700/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Archived</span>;
  if (p.is_hidden) return <span className="inline-flex items-center gap-1 rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">Hidden</span>;
  const meta = STATUS_LABELS[p.status] ?? { label: p.status, color: "bg-zinc-700/30 text-zinc-400 border-zinc-600/30" };
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.color}`}>
      {meta.label}
    </span>
  );
}

export const PropertyTable: React.FC<PropertyTableProps> = ({
  properties,
  loading,
  onEdit,
  onCreate,
  onRefresh,
}) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = properties.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q) ||
      p.mls?.toLowerCase().includes(q);

    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "draft" && p.is_draft) ||
      (filterStatus === "hidden" && p.is_hidden) ||
      (filterStatus === "archived" && p.is_archived) ||
      (!p.is_draft && !p.is_hidden && !p.is_archived && p.status === filterStatus);

    return matchSearch && matchStatus;
  });

  const act = async (id: string, fn: () => any) => {
    setActionLoading(id);
    setOpenMenu(null);
    try { await fn(); } catch (e) { console.error(e); } finally {
      setActionLoading(null);
      onRefresh();
    }
  };

  const handleDelete = (p: PropertyRow) => {
    if (deleteConfirm === p.id) {
      act(p.id, async () => {
        await supabase.from("properties").delete().eq("id", p.id);
      });
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(p.id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleDuplicate = (p: PropertyRow) => {
    const newId = generateId();
    const newSlug = `${p.slug}-copy-${Date.now().toString(36)}`;
    act(newId, async () => {
      await supabase.from("properties").insert({
        id: newId,
        slug: newSlug,
        title: `${p.title} (Copy)`,
        status: p.status as any,
        price: p.price || "—",
        address: p.address || "",
        city: p.city || "",
        state: p.state || "",
        zip: p.zip || "",
        type: p.type || "",
        beds: p.beds || 0,
        baths: p.baths || 0,
        description: p.description || "",
        is_published: false,
        is_draft: true,
        is_featured: false,
        is_hidden: p.is_hidden ?? false,
        is_archived: false,
        image_key: p.image_key || "",
        gallery_keys: p.gallery_keys ?? [],
        features: p.features ?? [],
        amenities: p.amenities ?? [],
        sort_order: p.sort_order ?? 0,
      } as any);
    });
  };

  const patch = (p: PropertyRow, update: Record<string, any>) =>
    act(p.id, async () => {
      await supabase.from("properties").update(update as any).eq("id", p.id);
    });

  const statusCounts: Record<string, number> = {
    all: properties.length,
    draft: properties.filter((p) => p.is_draft).length,
    hidden: properties.filter((p) => p.is_hidden).length,
    archived: properties.filter((p) => p.is_archived).length,
    "for-sale": properties.filter((p) => !p.is_draft && !p.is_hidden && !p.is_archived && p.status === "for-sale").length,
    "for-lease": properties.filter((p) => !p.is_draft && !p.is_hidden && !p.is_archived && p.status === "for-lease").length,
    sold: properties.filter((p) => !p.is_draft && !p.is_hidden && !p.is_archived && p.status === "sold").length,
    leased: properties.filter((p) => !p.is_draft && !p.is_hidden && !p.is_archived && p.status === "leased").length,
    pending: properties.filter((p) => !p.is_draft && !p.is_hidden && !p.is_archived && p.status === "pending").length,
  };

  const filterLabels: { id: FilterStatus; label: string }[] = [
    { id: "all",      label: `All (${statusCounts.all})` },
    { id: "for-sale", label: `For Sale (${statusCounts["for-sale"]})` },
    { id: "for-lease",label: `For Lease (${statusCounts["for-lease"]})` },
    { id: "pending",  label: `Pending (${statusCounts.pending})` },
    { id: "sold",     label: `Sold (${statusCounts.sold})` },
    { id: "leased",   label: `Leased (${statusCounts.leased})` },
    { id: "draft",    label: `Draft (${statusCounts.draft})` },
    { id: "hidden",   label: `Hidden (${statusCounts.hidden})` },
    { id: "archived", label: `Archived (${statusCounts.archived})` },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by title, city, MLS…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-[#141414] pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37]/60 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#141414] px-3 py-2 text-xs text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#d4af37] ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={onCreate}
            className="flex items-center gap-1.5 rounded-lg bg-[#d4af37] px-4 py-2 text-xs font-bold text-black hover:bg-[#c9a52e] transition-colors shadow-lg shadow-[#d4af37]/20"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Property
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {filterLabels.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
              filterStatus === f.id
                ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]"
                : "border-white/10 bg-transparent text-zinc-400 hover:text-white hover:border-white/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-[#141414] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] border-b border-white/10 text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="py-3 px-4 font-semibold w-12">Thumb</th>
                <th className="py-3 px-4 font-semibold min-w-[200px]">Title</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold">City</th>
                <th className="py-3 px-4 font-semibold">Created</th>
                <th className="py-3 px-4 font-semibold text-center">Published</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#d4af37]" />
                    Loading properties…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-500">
                    No properties found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={`group hover:bg-white/[0.02] transition-colors ${
                      actionLoading === p.id ? "opacity-50" : ""
                    }`}
                  >
                    {/* Thumbnail */}
                    <td className="py-2.5 px-4">
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-zinc-800 border border-white/10">
                        <img
                          src={resolveImage(p.image_key)}
                          alt={p.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate max-w-[220px]" title={p.title}>
                            {p.title}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[220px]">
                            /{p.slug}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0 mt-0.5">
                          {p.is_featured && (
                            <span title="Featured">
                              <Star className="h-3 w-3 text-[#d4af37]" />
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-4"><StatusBadge p={p} /></td>

                    {/* Type */}
                    <td className="py-2.5 px-4 text-zinc-300 whitespace-nowrap">{p.type}</td>

                    {/* Price */}
                    <td className="py-2.5 px-4 font-semibold text-[#d4af37] whitespace-nowrap">
                      {p.price || "—"}
                      {p.lease_price && (
                        <div className="text-[10px] text-zinc-400 font-normal">{p.lease_price}</div>
                      )}
                    </td>

                    {/* City */}
                    <td className="py-2.5 px-4 text-zinc-300 whitespace-nowrap">{p.city}, {p.state}</td>

                    {/* Created */}
                    <td className="py-2.5 px-4 text-zinc-400 whitespace-nowrap">
                      {p.created_at ? format(new Date(p.created_at), "MMM d, yyyy") : "—"}
                    </td>

                    {/* Published toggle */}
                    <td className="py-2.5 px-4 text-center">
                      <button
                        type="button"
                        title={p.is_published ? "Published — click to unpublish" : "Unpublished — click to publish"}
                        onClick={() => patch(p, { is_published: !p.is_published, is_draft: false })}
                        className={`relative inline-flex h-4.5 w-8 shrink-0 rounded-full border transition-colors ${
                          p.is_published
                            ? "bg-emerald-500/80 border-emerald-500"
                            : "bg-zinc-700 border-zinc-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 mt-px rounded-full bg-white shadow transition-transform ${
                            p.is_published ? "translate-x-3.5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4">
                      <div className="relative flex items-center justify-end gap-1">
                        {/* Quick Edit */}
                        <button
                          title="Edit"
                          onClick={() => onEdit(p)}
                          className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>

                        {/* Preview */}
                        <a
                          href={`/properties/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Preview on site"
                          className="p-1.5 rounded text-zinc-400 hover:text-blue-400 hover:bg-white/10 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>

                        {/* More Actions */}
                        <div className="relative">
                          <button
                            title="More actions"
                            onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>

                          {openMenu === p.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenu(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-xl border border-white/15 bg-[#1a1a1d] shadow-2xl py-1 text-xs">
                                {/* Status changes */}
                                <MenuSection label="Mark As" />
                                <MenuItem icon={<Home className="h-3.5 w-3.5 text-emerald-400" />} label="Available (For Sale)" onClick={() => patch(p, { status: "for-sale", is_draft: false, is_hidden: false, is_archived: false })} />
                                <MenuItem icon={<Home className="h-3.5 w-3.5 text-blue-400" />} label="For Lease" onClick={() => patch(p, { status: "for-lease", is_draft: false, is_hidden: false, is_archived: false })} />
                                <MenuItem icon={<Clock className="h-3.5 w-3.5 text-amber-400" />} label="Pending" onClick={() => patch(p, { status: "pending" })} />
                                <MenuItem icon={<CheckSquare className="h-3.5 w-3.5 text-zinc-400" />} label="Sold" onClick={() => patch(p, { status: "sold", is_published: true })} />
                                <MenuItem icon={<CheckSquare className="h-3.5 w-3.5 text-purple-400" />} label="Leased" onClick={() => patch(p, { status: "leased", is_published: true })} />
                                <div className="my-1 border-t border-white/10" />
                                {/* Visibility */}
                                <MenuSection label="Visibility" />
                                <MenuItem
                                  icon={p.is_published ? <EyeOff className="h-3.5 w-3.5 text-zinc-400" /> : <Eye className="h-3.5 w-3.5 text-emerald-400" />}
                                  label={p.is_published ? "Unpublish" : "Publish"}
                                  onClick={() => patch(p, { is_published: !p.is_published, is_draft: false })}
                                />
                                <MenuItem
                                  icon={<EyeOff className="h-3.5 w-3.5 text-red-400" />}
                                  label={p.is_hidden ? "Show (Unhide)" : "Hide"}
                                  onClick={() => patch(p, { is_hidden: !p.is_hidden })}
                                />
                                <MenuItem
                                  icon={<Star className="h-3.5 w-3.5 text-[#d4af37]" />}
                                  label={p.is_featured ? "Unfeature" : "Feature"}
                                  onClick={() => patch(p, { is_featured: !p.is_featured })}
                                />
                                <div className="my-1 border-t border-white/10" />
                                {/* Operations */}
                                <MenuSection label="Operations" />
                                <MenuItem icon={<Copy className="h-3.5 w-3.5 text-blue-400" />} label="Duplicate" onClick={() => handleDuplicate(p)} />
                                <MenuItem
                                  icon={<Archive className="h-3.5 w-3.5 text-zinc-400" />}
                                  label={p.is_archived ? "Unarchive" : "Archive"}
                                  onClick={() => patch(p, { is_archived: !p.is_archived, is_published: false })}
                                />
                                <div className="my-1 border-t border-white/10" />
                                <button
                                  onClick={() => handleDelete(p)}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 transition-colors ${
                                    deleteConfirm === p.id
                                      ? "text-red-300 bg-red-500/20"
                                      : "text-red-400 hover:bg-red-500/10"
                                  }`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  {deleteConfirm === p.id ? "Click again to confirm" : "Delete Property"}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-4 py-2.5 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Showing {filtered.length} of {properties.length} properties</span>
          {search || filterStatus !== "all" ? (
            <button
              onClick={() => { setSearch(""); setFilterStatus("all"); }}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

function MenuSection({ label }: { label: string }) {
  return (
    <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
      {label}
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}
