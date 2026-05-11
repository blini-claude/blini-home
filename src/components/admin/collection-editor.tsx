"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface CollectionInitial {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  productIds: string[];
}

interface ProductRow {
  id: string;
  title: string;
  thumbnail: string | null;
  sourceStore: string;
  category: string;
  price: number;
  isActive: boolean;
}

export function CollectionEditor({
  collection,
  allProducts,
}: {
  collection: CollectionInitial;
  allProducts: ProductRow[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(collection.title);
  const [slug, setSlug] = useState(collection.slug);
  const [description, setDescription] = useState(collection.description ?? "");
  const [image, setImage] = useState(collection.image ?? "");
  const [isActive, setIsActive] = useState(collection.isActive);
  const [sortOrder, setSortOrder] = useState(String(collection.sortOrder));
  const [selected, setSelected] = useState<Set<string>>(new Set(collection.productIds));

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [onlySelected, setOnlySelected] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allProducts.filter((p) => {
      if (onlySelected && !selected.has(p.id)) return false;
      if (sourceFilter !== "all" && p.sourceStore !== sourceFilter) return false;
      if (q && !p.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allProducts, search, sourceFilter, onlySelected, selected]);

  const sources = useMemo(() => {
    const s = new Set<string>();
    allProducts.forEach((p) => s.add(p.sourceStore));
    return Array.from(s).sort();
  }, [allProducts]);

  function toggleProduct(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisible(check: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((p) => {
        if (check) next.add(p.id);
        else next.delete(p.id);
      });
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    // First save the collection metadata.
    const metaRes = await fetch(`/api/admin/collections/${collection.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        description: description || null,
        image: image || null,
        isActive,
        sortOrder: parseInt(sortOrder, 10) || 0,
      }),
    });

    if (!metaRes.ok) {
      setSaving(false);
      const data = await metaRes.json().catch(() => null);
      setError(data?.error || "Gabim gjatë ruajtjes së të dhënave");
      return;
    }

    // Then sync product membership.
    const memberRes = await fetch(`/api/admin/collections/${collection.id}/products`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: Array.from(selected) }),
    });

    setSaving(false);

    if (!memberRes.ok) {
      const data = await memberRes.json().catch(() => null);
      setError(data?.error || "Gabim gjatë lidhjes së produkteve");
      return;
    }

    router.push("/admin/collections");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Je i sigurt që dëshiron të fshish këtë koleksion?")) return;
    setSaving(true);
    await fetch(`/api/admin/collections/${collection.id}`, { method: "DELETE" });
    router.push("/admin/collections");
    router.refresh();
  }

  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/admin/collections"
          className="flex items-center gap-2 text-[12px] font-bold text-[rgba(18,18,18,0.5)] hover:text-[#062F35] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Kthehu te koleksionet
        </Link>
        <div className="flex gap-3 items-center">
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="text-[11px] font-bold text-[#C62828] hover:text-[#E53935] transition-colors disabled:opacity-50"
          >
            Fshij koleksionin
          </button>
          <Link
            href="/admin/collections"
            className="h-[40px] px-5 flex items-center border-2 border-[#E8E8E8] rounded-[8px] text-[12px] font-bold text-[#062F35] hover:bg-[#F5F5F5] transition-colors"
          >
            Anulo
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-[40px] px-5 bg-[#062F35] text-white rounded-[8px] text-[12px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? "Duke ruajtur..." : "Ruaj"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] border border-[#EF5350] text-[#C62828] text-[12px] font-semibold px-4 py-3 rounded-[8px]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — metadata */}
        <div className="space-y-5">
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Detajet
            </h3>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Titulli
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Slug
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] font-mono outline-none focus:border-[#062F35] transition-colors"
              />
              <p className="text-[10px] text-[rgba(18,18,18,0.35)] mt-1">
                URL: /koleksione/{slug}
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Përshkrimi
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors resize-y"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                URL e imazhit
              </label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full h-[40px] px-3 border-2 border-[#E8E8E8] rounded-[8px] text-[12px] font-mono text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
              />
              {image && (
                <div className="mt-2 w-full h-[120px] bg-[#F5F5F5] rounded-[8px] overflow-hidden relative">
                  <Image src={image} alt="" fill sizes="320px" className="object-cover" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                  Renditja
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full h-[40px] px-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
                />
              </div>
              <label className="flex items-end gap-2.5 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#062F35]"
                />
                <span className="text-[12px] font-semibold text-[#062F35]">Aktiv</span>
              </label>
            </div>
          </section>
        </div>

        {/* Right — product membership */}
        <div className="lg:col-span-2 space-y-5">
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#F0F0F0] flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
                Produktet në koleksion ({selected.size})
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleVisible(true)}
                  className="text-[11px] font-bold text-[#062F35] hover:text-[#FFC334] transition-colors px-2 py-1 rounded-[4px] hover:bg-[#F8F8F8]"
                >
                  Zgjidh të dukshmet
                </button>
                <button
                  type="button"
                  onClick={() => toggleVisible(false)}
                  className="text-[11px] font-bold text-[rgba(18,18,18,0.5)] hover:text-[#C62828] transition-colors px-2 py-1 rounded-[4px] hover:bg-[#F8F8F8]"
                >
                  Hiqi të dukshmet
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="px-5 py-3 bg-[#FAFBFC] border-b border-[#F0F0F0] flex items-center gap-3 flex-wrap">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Kërko produkte..."
                className="flex-1 min-w-[200px] h-[36px] px-3 border-2 border-[#E8E8E8] rounded-[8px] text-[12px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors bg-white"
              />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="h-[36px] px-3 border-2 border-[#E8E8E8] rounded-[8px] text-[12px] text-[#062F35] outline-none focus:border-[#062F35] bg-white"
              >
                <option value="all">Të gjitha burimet</option>
                {sources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-[12px] font-semibold text-[#062F35] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlySelected}
                  onChange={(e) => setOnlySelected(e.target.checked)}
                  className="w-4 h-4 accent-[#062F35]"
                />
                Vetëm të zgjedhurat
              </label>
            </div>

            {/* List */}
            <div className="max-h-[640px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-5 py-8 text-center text-[13px] text-[rgba(18,18,18,0.4)]">
                  Nuk u gjetën produkte
                </div>
              ) : (
                <ul>
                  {filtered.map((p) => {
                    const isOn = selected.has(p.id);
                    return (
                      <li
                        key={p.id}
                        onClick={() => toggleProduct(p.id)}
                        className={`flex items-center gap-3 px-5 py-2.5 border-b border-[#F8F8F8] last:border-b-0 cursor-pointer transition-colors ${
                          isOn ? "bg-[#F0F7F8]" : "hover:bg-[#FAFBFC]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isOn}
                          readOnly
                          className="w-4 h-4 accent-[#062F35]"
                        />
                        <div className="w-[40px] h-[40px] bg-[#F5F5F5] rounded-[6px] overflow-hidden relative flex-shrink-0">
                          {p.thumbnail ? (
                            <Image src={p.thumbnail} alt="" fill sizes="40px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#062F35] truncate">
                            {p.title}
                          </p>
                          <p className="text-[10px] text-[rgba(18,18,18,0.45)] capitalize">
                            {p.sourceStore} · {p.category}
                          </p>
                        </div>
                        <span className="text-[12px] font-bold text-[#062F35] flex-shrink-0">
                          €{p.price.toFixed(2)}
                        </span>
                        {!p.isActive && (
                          <span className="text-[9px] font-bold text-[rgba(18,18,18,0.35)] uppercase">
                            Joaktiv
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
