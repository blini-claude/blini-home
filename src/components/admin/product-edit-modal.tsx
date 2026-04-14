"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EditableProduct {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  description: string | null;
  isActive: boolean;
  isFeatured: boolean;
}

export function ProductEditModal({
  product,
  onClose,
}: {
  product: EditableProduct;
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);

    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: parseFloat(form.get("price") as string),
        compareAtPrice: form.get("compareAtPrice")
          ? parseFloat(form.get("compareAtPrice") as string)
          : null,
        description: form.get("description") || null,
        isActive: form.get("isActive") === "on",
        isFeatured: form.get("isFeatured") === "on",
      }),
    });

    setSaving(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Edit Product</h2>
        <p className="text-sm text-[#707070] mb-4 line-clamp-1">{product.title}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Price (€)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={product.price}
                required
                className="w-full h-9 px-2 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Compare Price (€)</label>
              <input
                name="compareAtPrice"
                type="number"
                step="0.01"
                defaultValue={product.compareAtPrice ?? ""}
                className="w-full h-9 px-2 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={product.description ?? ""}
              className="w-full px-2 py-1.5 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7] resize-none"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input name="isActive" type="checkbox" defaultChecked={product.isActive} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input name="isFeatured" type="checkbox" defaultChecked={product.isFeatured} />
              Featured
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-9 bg-[#121212] text-white rounded text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
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
