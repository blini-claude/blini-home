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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text">
            {isEditing ? "Edit Collection" : "New Collection"}
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text transition-colors cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Title</label>
            <input
              name="title"
              required
              defaultValue={collection?.title}
              className="w-full h-12 px-4 border border-gray-200 rounded-[5px] text-sm text-text outline-none focus:border-text focus:ring-1 focus:ring-text transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Slug</label>
            <input
              name="slug"
              required
              defaultValue={collection?.slug}
              placeholder="e.g. shtepi-kuzhine"
              className="w-full h-12 px-4 border border-gray-200 rounded-[5px] text-sm text-text outline-none focus:border-text focus:ring-1 focus:ring-text transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={collection?.description ?? ""}
              className="w-full px-4 py-3 border border-gray-200 rounded-[5px] text-sm text-text outline-none focus:border-text focus:ring-1 focus:ring-text transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Sort Order</label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={collection?.sortOrder ?? 0}
                className="w-full h-12 px-4 border border-gray-200 rounded-[5px] text-sm text-text outline-none focus:border-text focus:ring-1 focus:ring-text transition-colors"
              />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2.5 text-sm text-text cursor-pointer">
                <input
                  name="isActive"
                  type="checkbox"
                  defaultChecked={collection?.isActive ?? true}
                  className="w-4 h-4 rounded border-gray-300"
                />
                Active
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-12 bg-text text-white rounded-[5px] text-sm font-semibold disabled:opacity-50 hover:bg-text/90 transition-colors cursor-pointer"
            >
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Collection"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 border border-gray-200 rounded-[5px] text-sm font-semibold text-text hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
