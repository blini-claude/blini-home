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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? "Edit Collection" : "New Collection"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">Title</label>
            <input
              name="title"
              required
              defaultValue={collection?.title}
              className="w-full h-9 px-2 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">Slug</label>
            <input
              name="slug"
              required
              defaultValue={collection?.slug}
              placeholder="e.g. shtepi-kuzhine"
              className="w-full h-9 px-2 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">Description</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={collection?.description ?? ""}
              className="w-full px-2 py-1.5 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Sort Order</label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={collection?.sortOrder ?? 0}
                className="w-full h-9 px-2 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7]"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input name="isActive" type="checkbox" defaultChecked={collection?.isActive ?? true} />
                Active
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-9 bg-[#121212] text-white rounded text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : isEditing ? "Save" : "Create"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 border border-[#d1d5db] rounded text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
