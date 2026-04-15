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
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  stock: number;
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

  async function toggleFeatured(id: string, isFeatured: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !isFeatured }),
    });
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(18,18,18,0.3)" strokeWidth="1.5">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          </svg>
        </div>
        <p className="text-[13px] text-[rgba(18,18,18,0.4)]">Nuk u gjetën produkte</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F0F0F0]">
              <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                Produkti
              </th>
              <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                Burimi
              </th>
              <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                Kategoria
              </th>
              <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                Çmimi
              </th>
              <th className="text-center text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                Statusi
              </th>
              <th className="text-center text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-3 py-3">
                ★
              </th>
              <th className="text-right text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                Veprime
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-[#F8F8F8] hover:bg-[#FAFBFC] transition-colors"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] h-[40px] bg-[#F5F5F5] flex-shrink-0 relative rounded-[8px] overflow-hidden">
                      {product.thumbnail ? (
                        <Image
                          src={product.thumbnail}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(18,18,18,0.2)" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#062F35] truncate max-w-[250px]">
                        {product.title}
                      </p>
                      {product.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {product.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] bg-[#F0F7F8] text-[#062F35]"
                            >
                              {tag}
                            </span>
                          ))}
                          {product.tags.length > 2 && (
                            <span className="text-[9px] text-[rgba(18,18,18,0.3)]">
                              +{product.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="text-[11px] font-bold px-2 py-1 rounded-[4px] bg-[#F5F5F5] text-[rgba(18,18,18,0.5)] capitalize">
                    {product.sourceStore}
                  </span>
                </td>
                <td className="px-5 py-3 text-[12px] text-[rgba(18,18,18,0.5)]">
                  {product.category}
                </td>
                <td className="px-5 py-3">
                  <span className="text-[13px] font-bold text-[#062F35]">
                    €{product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-[11px] text-[rgba(18,18,18,0.35)] line-through ml-1.5">
                      €{product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-center">
                  <button
                    onClick={() => toggleActive(product.id, product.isActive)}
                    disabled={toggling === product.id}
                    className={`text-[10px] px-2.5 py-1 rounded-[4px] font-bold cursor-pointer transition-colors ${
                      product.isActive
                        ? "bg-[#E8F5E9] text-[#2E7D32]"
                        : "bg-[#F5F5F5] text-[rgba(18,18,18,0.35)]"
                    }`}
                  >
                    {product.isActive ? "Aktiv" : "Joaktiv"}
                  </button>
                </td>
                <td className="px-3 py-3 text-center">
                  <button
                    onClick={() => toggleFeatured(product.id, product.isFeatured)}
                    className={`text-[16px] cursor-pointer transition-colors ${
                      product.isFeatured ? "text-[#FFC334]" : "text-[#E0E0E0] hover:text-[#FFC334]"
                    }`}
                    title={product.isFeatured ? "Hiq nga të veçuarat" : "Shto te të veçuarat"}
                  >
                    ★
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="text-[11px] font-bold text-[#062F35] hover:text-[#FFC334] transition-colors cursor-pointer bg-[#F5F5F5] hover:bg-[#F0F7F8] px-3 py-1.5 rounded-[6px]"
                  >
                    Ndrysho
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
