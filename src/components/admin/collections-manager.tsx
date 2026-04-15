"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CollectionForm } from "./collection-form";

interface CollectionRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: { products: number };
}

export function CollectionsManager({
  collections,
}: {
  collections: CollectionRow[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CollectionRow | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Je i sigurt që dëshiron të fshish këtë koleksion?")) return;
    setDeleting(id);
    await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <p className="text-[12px] text-[rgba(18,18,18,0.45)] font-semibold">
          {collections.length} koleksione
        </p>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="h-[40px] px-5 bg-[#062F35] text-white rounded-[8px] text-[12px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors cursor-pointer"
        >
          + Koleksion i ri
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-12 text-center">
          <p className="text-[13px] text-[rgba(18,18,18,0.4)]">
            Nuk ka koleksione ende
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0F0F0]">
                <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3 w-[60px]">
                  #
                </th>
                <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                  Titulli
                </th>
                <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                  Slug
                </th>
                <th className="text-center text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                  Produkte
                </th>
                <th className="text-center text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                  Statusi
                </th>
                <th className="text-right text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                  Veprime
                </th>
              </tr>
            </thead>
            <tbody>
              {collections.map((col) => (
                <tr
                  key={col.id}
                  className="border-b border-[#F8F8F8] hover:bg-[#FAFBFC] transition-colors"
                >
                  <td className="px-5 py-3.5 text-[12px] text-[rgba(18,18,18,0.35)]">
                    {col.sortOrder}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-semibold text-[#062F35]">
                      {col.title}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <code className="text-[11px] text-[rgba(18,18,18,0.4)] bg-[#F5F5F5] px-2 py-0.5 rounded-[4px]">
                      {col.slug}
                    </code>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="text-[11px] font-bold px-2 py-1 rounded-[4px] bg-[#F0F7F8] text-[#062F35]">
                      {col._count.products}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-[4px] ${
                        col.isActive
                          ? "bg-[#E8F5E9] text-[#2E7D32]"
                          : "bg-[#F5F5F5] text-[rgba(18,18,18,0.35)]"
                      }`}
                    >
                      {col.isActive ? "Aktiv" : "Joaktiv"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => {
                          setEditing(col);
                          setShowForm(true);
                        }}
                        className="text-[11px] font-bold text-[#062F35] hover:text-[#FFC334] transition-colors cursor-pointer bg-[#F5F5F5] hover:bg-[#F0F7F8] px-3 py-1.5 rounded-[6px]"
                      >
                        Ndrysho
                      </button>
                      <button
                        onClick={() => handleDelete(col.id)}
                        disabled={deleting === col.id}
                        className="text-[11px] font-bold text-[rgba(18,18,18,0.3)] hover:text-[#C62828] transition-colors cursor-pointer"
                      >
                        Fshij
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <CollectionForm
          collection={editing || undefined}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
