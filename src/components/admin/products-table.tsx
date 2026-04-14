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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Product</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Source</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Category</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Price</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 flex-shrink-0 relative rounded overflow-hidden">
                      {product.thumbnail && (
                        <Image src={product.thumbnail} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <span className="font-medium text-text line-clamp-1">{product.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 capitalize text-text-secondary">{product.sourceStore}</td>
                <td className="px-6 py-4 text-text-secondary">{product.category}</td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-text">{product.price.toFixed(0)} ALL</span>
                  {product.compareAtPrice && (
                    <span className="text-xs text-text-secondary line-through ml-2">
                      {product.compareAtPrice.toFixed(0)} ALL
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(product.id, product.isActive)}
                    disabled={toggling === product.id}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium border cursor-pointer transition-colors ${
                      product.isActive
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="text-sm text-text-secondary hover:text-text font-medium transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center py-12 text-sm text-text-secondary">No products found</p>
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
