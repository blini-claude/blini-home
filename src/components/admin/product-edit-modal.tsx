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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-text">Edit Product</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text transition-colors cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-text-secondary mb-6 line-clamp-1">{product.title}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Price (ALL)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={product.price}
                required
                className="w-full h-12 px-4 border border-gray-200 rounded-[5px] text-sm text-text outline-none focus:border-text focus:ring-1 focus:ring-text transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Compare Price</label>
              <input
                name="compareAtPrice"
                type="number"
                step="0.01"
                defaultValue={product.compareAtPrice ?? ""}
                className="w-full h-12 px-4 border border-gray-200 rounded-[5px] text-sm text-text outline-none focus:border-text focus:ring-1 focus:ring-text transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={product.description ?? ""}
              className="w-full px-4 py-3 border border-gray-200 rounded-[5px] text-sm text-text outline-none focus:border-text focus:ring-1 focus:ring-text transition-colors resize-none"
            />
          </div>

          <div className="flex gap-6 py-1">
            <label className="flex items-center gap-2.5 text-sm text-text cursor-pointer">
              <input name="isActive" type="checkbox" defaultChecked={product.isActive} className="w-4 h-4 rounded border-gray-300" />
              Active
            </label>
            <label className="flex items-center gap-2.5 text-sm text-text cursor-pointer">
              <input name="isFeatured" type="checkbox" defaultChecked={product.isFeatured} className="w-4 h-4 rounded border-gray-300" />
              Featured
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-12 bg-text text-white rounded-[5px] text-sm font-semibold disabled:opacity-50 hover:bg-text/90 transition-colors cursor-pointer"
            >
              {saving ? "Saving..." : "Save Changes"}
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
