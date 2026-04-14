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

export function CollectionsManager({ collections }: { collections: CollectionRow[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CollectionRow | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this collection?")) return;
    setDeleting(id);
    await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[#707070]">{collections.length} collections</p>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="h-9 px-4 bg-[#121212] text-white rounded text-sm font-medium"
        >
          + New Collection
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Order</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Title</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Products</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Status</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]">
            {collections.map((col) => (
              <tr key={col.id} className="hover:bg-[#f8f9fa]">
                <td className="px-4 py-3 text-[#707070]">{col.sortOrder}</td>
                <td className="px-4 py-3 font-medium">{col.title}</td>
                <td className="px-4 py-3 text-[#707070] font-mono text-xs">{col.slug}</td>
                <td className="px-4 py-3">{col._count.products}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    col.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {col.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => { setEditing(col); setShowForm(true); }}
                    className="text-xs text-[#6767A7] hover:underline font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(col.id)}
                    disabled={deleting === col.id}
                    className="text-xs text-red-600 hover:underline font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {collections.length === 0 && (
          <p className="text-center py-8 text-sm text-[#707070]">No collections yet</p>
        )}
      </div>

      {showForm && (
        <CollectionForm
          collection={editing || undefined}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </>
  );
}
