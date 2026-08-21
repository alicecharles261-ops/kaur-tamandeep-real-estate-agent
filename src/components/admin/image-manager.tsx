import React, { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { compressImage, generateId } from "@/lib/admin-utils";
import { resolveImage } from "@/lib/property-images";
import { Upload, X, Star, GripVertical, RefreshCw, ImageIcon } from "lucide-react";

interface ImageManagerProps {
  propertyId: string;
  imageKey: string;        // featured image storage key
  galleryKeys: string[];   // all gallery image keys (first = featured)
  onChange: (imageKey: string, galleryKeys: string[]) => void;
}

interface UploadItem {
  key: string;
  uploading?: boolean;
  error?: string;
}

export const ImageManager: React.FC<ImageManagerProps> = ({
  propertyId,
  imageKey,
  galleryKeys,
  onChange,
}) => {
  // All keys shown in manager (union of gallery + featured)
  const allKeys = galleryKeys.length > 0 ? galleryKeys : imageKey ? [imageKey] : [];
  const [items, setItems] = useState<UploadItem[]>(allKeys.map((k) => ({ key: k })));
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const emitChange = (updated: UploadItem[]) => {
    const keys = updated.filter((i) => !i.uploading && !i.error).map((i) => i.key);
    const featured = keys[0] || "";
    onChange(featured, keys);
  };

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);

    const placeholders: UploadItem[] = files.map(() => ({
      key: `__uploading__${generateId()}`,
      uploading: true,
    }));

    setItems((prev) => {
      const next = [...prev, ...placeholders];
      emitChange(next);
      return next;
    });

    const uploaded: UploadItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const placeholder = placeholders[i];
      try {
        // Compress image
        const blob = await compressImage(file, 1920, 0.85);
        const ext = "jpg";
        const path = `properties/${propertyId}/${Date.now()}-${i}.${ext}`;

        const { error } = await supabase.storage
          .from("property-images")
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });

        if (error) throw error;
        uploaded.push({ key: path });
      } catch (err: any) {
        uploaded.push({ key: placeholder.key, error: err?.message || "Upload failed" });
      }
    }

    setItems((prev) => {
      const next = prev.map((item) => {
        const match = uploaded.find((u) => {
          const placeholderKeys = placeholders.map((p) => p.key);
          return item.key === placeholders[uploaded.indexOf(u)]?.key;
        });
        return match || item;
      });
      // Replace placeholders with uploaded
      const replaced = prev.slice();
      placeholders.forEach((ph, idx) => {
        const i = replaced.findIndex((r) => r.key === ph.key);
        if (i !== -1) replaced[i] = uploaded[idx];
      });
      emitChange(replaced);
      return replaced;
    });

    setUploading(false);
  }, [propertyId]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) uploadFiles(files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-[#d4af37]");
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length) uploadFiles(files);
  };

  const handleDeleteImage = async (idx: number) => {
    const item = items[idx];
    // Try to remove from storage (best-effort)
    if (item.key && !item.key.startsWith("__") && item.key.includes("/")) {
      await supabase.storage.from("property-images").remove([item.key]);
    }
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    emitChange(next);
  };

  const handleSetFeatured = (idx: number) => {
    if (idx === 0) return;
    const next = [...items];
    const [item] = next.splice(idx, 1);
    next.unshift(item);
    setItems(next);
    emitChange(next);
  };

  // Drag-to-reorder
  const handleDragStart = (idx: number) => setDragIndex(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIndex(idx);
  };
  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      const next = [...items];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(dragOverIndex, 0, moved);
      setItems(next);
      emitChange(next);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleReplaceImage = async (idx: number, file: File) => {
    const item = items[idx];
    try {
      const blob = await compressImage(file, 1920, 0.85);
      const path = `properties/${propertyId}/${Date.now()}-replaced.jpg`;
      const { error } = await supabase.storage
        .from("property-images")
        .upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (error) throw error;

      // Delete old if it's a storage path
      if (item.key && item.key.includes("/")) {
        await supabase.storage.from("property-images").remove([item.key]);
      }

      const next = [...items];
      next[idx] = { key: path };
      setItems(next);
      emitChange(next);
    } catch (err) {
      console.error("Replace failed", err);
    }
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone / Upload Trigger */}
      <div
        ref={dropZoneRef}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("border-[#d4af37]");
        }}
        onDragLeave={(e) => e.currentTarget.classList.remove("border-[#d4af37]")}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-[#0d0d0f] py-8 cursor-pointer hover:border-[#d4af37]/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <RefreshCw className="h-6 w-6 text-[#d4af37] animate-spin" />
        ) : (
          <Upload className="h-6 w-6 text-zinc-400" />
        )}
        <p className="text-xs text-zinc-400">
          {uploading ? "Uploading…" : "Drag & drop images or click to browse"}
        </p>
        <p className="text-[10px] text-zinc-500">JPG, PNG, WebP — max 10 MB each. Auto-compressed.</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Image Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {items.map((item, idx) => (
            <div
              key={item.key}
              draggable={!item.uploading}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                idx === 0
                  ? "border-[#d4af37]"
                  : dragOverIndex === idx
                  ? "border-blue-400"
                  : "border-white/10"
              } ${item.uploading ? "opacity-50" : ""}`}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-zinc-800">
                {item.uploading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-[#d4af37] animate-spin" />
                  </div>
                ) : item.error ? (
                  <div className="w-full h-full flex items-center justify-center text-red-400 text-[10px] px-1 text-center">
                    {item.error}
                  </div>
                ) : (
                  <img
                    src={resolveImage(item.key)}
                    alt={`Property image ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>

              {/* Featured badge */}
              {idx === 0 && !item.uploading && (
                <div className="absolute top-1 left-1 rounded bg-[#d4af37] px-1.5 py-0.5 text-[9px] font-bold text-black uppercase tracking-wider">
                  Featured
                </div>
              )}

              {/* Drag handle */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <GripVertical className="h-4 w-4 text-white drop-shadow" />
              </div>

              {/* Overlay actions */}
              {!item.uploading && !item.error && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end gap-1 p-1.5">
                  {idx !== 0 && (
                    <button
                      type="button"
                      title="Set as featured"
                      onClick={() => handleSetFeatured(idx)}
                      className="flex-1 flex items-center justify-center gap-0.5 rounded bg-[#d4af37]/20 border border-[#d4af37]/30 py-1 text-[10px] text-[#d4af37] hover:bg-[#d4af37]/40 transition-colors"
                    >
                      <Star className="h-3 w-3" />
                    </button>
                  )}
                  <label
                    title="Replace"
                    className="flex-1 flex items-center justify-center rounded bg-blue-500/20 border border-blue-500/30 py-1 cursor-pointer hover:bg-blue-500/40 transition-colors"
                  >
                    <ImageIcon className="h-3 w-3 text-blue-400" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleReplaceImage(idx, f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    title="Delete"
                    onClick={() => handleDeleteImage(idx)}
                    className="flex-1 flex items-center justify-center rounded bg-red-500/20 border border-red-500/30 py-1 text-red-400 hover:bg-red-500/40 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <p className="text-[10px] text-zinc-500">
          Drag to reorder · First image = featured · {items.filter(i => !i.uploading && !i.error).length} image{items.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
};
