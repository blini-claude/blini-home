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
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-text-secondary">{collections.length} collections</p>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="h-10 px-5 bg-text text-white rounded-[5px] text-sm font-semibold hover:bg-text/90 transition-colors cursor-pointer"
        >
          + New Collection
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Order</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Title</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Slug</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Products</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {collections.map((col) => (
              <tr key={col.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-text-secondary">{col.sortOrder}</td>
                <td className="px-6 py-4 font-medium text-text">{col.title}</td>
                <td className="px-6 py-4 text-text-secondary font-mono text-xs">{col.slug}</td>
                <td className="px-6 py-4 text-text">{col._count.products}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                    col.isActive
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  }`}>
                    {col.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setEditing(col); setShowForm(true); }}
                      className="text-sm text-text-secondary hover:text-text font-medium transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(col.id)}
                      disabled={deleting === col.id}
                      className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {collections.length === 0 && (
          <p className="text-center py-12 text-sm text-text-secondary">No collections yet</p>
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
