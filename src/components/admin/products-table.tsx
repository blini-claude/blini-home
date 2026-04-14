"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ProductEditModal } from "./product-edit-modal";

interface ProductRow {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  description: string | null;
  thumbnail: string | null;
  sourceStore: string;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
}

export function ProductsTable({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  async function toggleActive(id: string, isActive: boolean) {
    setToggling(id);
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setToggling(null);
    router.refresh();
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Product</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Source</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Category</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Price</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Status</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-[#f8f9fa]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-[#f5f5f5] flex-shrink-0 relative">
                      {product.thumbnail && (
                        <Image src={product.thumbnail} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <span className="font-medium line-clamp-1">{product.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">{product.sourceStore}</td>
                <td className="px-4 py-3 text-[#707070]">{product.category}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold">€{product.price.toFixed(2)}</span>
                  {product.compareAtPrice && (
                    <span className="text-xs text-[#707070] line-through ml-1">
                      €{product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(product.id, product.isActive)}
                    disabled={toggling === product.id}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      product.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {product.isActive ? "Active" : "Disabled"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="text-xs text-[#6767A7] hover:underline font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center py-8 text-sm text-[#707070]">No products found</p>
        )}
      </div>

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </>
  );
}
