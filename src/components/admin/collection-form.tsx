"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CollectionData {
  id?: string;
  title: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export function CollectionForm({
  collection,
  onClose,
}: {
  collection?: CollectionData;
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isEditing = !!collection?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title") as string,
      slug: form.get("slug") as string,
      description: (form.get("description") as string) || null,
      isActive: form.get("isActive") === "on",
      sortOrder: parseInt(form.get("sortOrder") as string) || 0,
    };

    if (isEditing) {
      await fetch(`/api/admin/collections/${collection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }

    setSaving(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#062F35]/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[14px] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0]">
          <h2 className="text-[16px] font-bold text-[#062F35]">
            {isEditing ? "Ndrysho koleksionin" : "Koleksion i ri"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] hover:bg-[#F5F5F5] flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(18,18,18,0.4)" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
              Titulli
            </label>
            <input
              name="title"
              required
              defaultValue={collection?.title}
              className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
              Slug
            </label>
            <input
              name="slug"
              required
              defaultValue={collection?.slug}
              placeholder="p.sh. shtepi-kuzhine"
              className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
              Përshkrimi
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={collection?.description ?? ""}
              className="w-full px-4 py-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Renditja
              </label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={collection?.sortOrder ?? 0}
                className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
              />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  name="isActive"
                  type="checkbox"
                  defaultChecked={collection?.isActive ?? true}
                  className="w-4 h-4 rounded accent-[#062F35]"
                />
                <span className="text-[12px] font-semibold text-[#062F35]">
                  Aktiv
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-[44px] bg-[#062F35] text-white rounded-[8px] text-[13px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {saving
                ? "Duke ruajtur..."
                : isEditing
                ? "Ruaj ndryshimet"
                : "Krijo koleksionin"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[44px] border-2 border-[#E8E8E8] rounded-[8px] text-[13px] font-bold text-[#062F35] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
            >
              Anulo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
