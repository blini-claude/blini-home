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
  category: string;
  tags: string[];
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
  const [tags, setTags] = useState(product.tags.join(", "));

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
        category: form.get("category") || product.category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isActive: form.get("isActive") === "on",
        isFeatured: form.get("isFeatured") === "on",
      }),
    });

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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0]">
          <div>
            <h2 className="text-[16px] font-bold text-[#062F35]">
              Ndrysho produktin
            </h2>
            <p className="text-[12px] text-[rgba(18,18,18,0.4)] mt-0.5 truncate max-w-[300px]">
              {product.title}
            </p>
          </div>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Çmimi (€)
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={product.price}
                required
                className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Çmimi i vjetër
              </label>
              <input
                name="compareAtPrice"
                type="number"
                step="0.01"
                defaultValue={product.compareAtPrice ?? ""}
                className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
              Kategoria
            </label>
            <input
              name="category"
              type="text"
              defaultValue={product.category}
              className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
              Etiketat
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Elektronike, Shtëpi, Kuzhine"
              className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
            />
            <p className="text-[10px] text-[rgba(18,18,18,0.35)] mt-1">
              Nda me presje
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
              Përshkrimi
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={product.description ?? ""}
              className="w-full px-4 py-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors resize-none"
            />
          </div>

          <div className="flex gap-6 py-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked={product.isActive}
                className="w-4 h-4 rounded accent-[#062F35]"
              />
              <span className="text-[12px] font-semibold text-[#062F35]">Aktiv</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                name="isFeatured"
                type="checkbox"
                defaultChecked={product.isFeatured}
                className="w-4 h-4 rounded accent-[#FFC334]"
              />
              <span className="text-[12px] font-semibold text-[#062F35]">I veçuar</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-[44px] bg-[#062F35] text-white rounded-[8px] text-[13px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {saving ? "Duke ruajtur..." : "Ruaj ndryshimet"}
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
