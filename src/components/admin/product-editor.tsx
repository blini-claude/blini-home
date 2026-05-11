"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface EditorProduct {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  category: string;
  tags: string[];
  stock: number;
  images: string[];
  thumbnail: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sourceStore: string;
  sourceUrl: string;
  collectionIds: string[];
}

interface CollectionRow {
  id: string;
  title: string;
  slug: string;
  isActive: boolean;
}

export function ProductEditor({
  product,
  collections,
  categories,
  backHref,
}: {
  product: EditorProduct;
  collections: CollectionRow[];
  categories: string[];
  backHref: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state — controlled so we can do collection multi-select cleanly.
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(String(product.price));
  const [compareAtPrice, setCompareAtPrice] = useState(
    product.compareAtPrice != null ? String(product.compareAtPrice) : ""
  );
  const [category, setCategory] = useState(product.category);
  const [tagsInput, setTagsInput] = useState(product.tags.join(", "));
  const [stock, setStock] = useState(String(product.stock));
  const [isActive, setIsActive] = useState(product.isActive);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured);
  const [thumbnail, setThumbnail] = useState(product.thumbnail ?? "");
  const [images, setImages] = useState<string[]>(product.images);
  const [collectionIds, setCollectionIds] = useState<string[]>(product.collectionIds);

  function toggleCollection(id: string) {
    setCollectionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function moveImage(idx: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  }

  function makePrimary(idx: number) {
    if (idx === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const [chosen] = next.splice(idx, 1);
      next.unshift(chosen);
      return next;
    });
    setThumbnail(images[idx]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      description: description || null,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      category,
      tags,
      stock: parseInt(stock, 10) || 0,
      isActive,
      isFeatured,
      thumbnail: thumbnail || null,
      images,
      collectionIds,
    };

    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Ndodhi një gabim gjatë ruajtjes");
      return;
    }

    router.push(backHref);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={backHref}
          className="flex items-center gap-2 text-[12px] font-bold text-[rgba(18,18,18,0.5)] hover:text-[#062F35] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Kthehu te produktet
        </Link>
        <div className="flex gap-3">
          <Link
            href={backHref}
            className="h-[40px] px-5 flex items-center border-2 border-[#E8E8E8] rounded-[8px] text-[12px] font-bold text-[#062F35] hover:bg-[#F5F5F5] transition-colors"
          >
            Anulo
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="h-[40px] px-5 bg-[#062F35] text-white rounded-[8px] text-[12px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? "Duke ruajtur..." : "Ruaj ndryshimet"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] border border-[#EF5350] text-[#C62828] text-[12px] font-semibold px-4 py-3 rounded-[8px]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column — main fields */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basics */}
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Të dhënat bazë
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Titulli
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
              />
              <p className="text-[10px] text-[rgba(18,18,18,0.35)] mt-1">
                Slug: <code className="font-mono">{product.slug}</code>
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Përshkrimi
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors resize-y"
              />
            </div>
          </section>

          {/* Pricing & stock */}
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Çmimi dhe stoku
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                  Çmimi (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                  Çmimi i vjetër (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                  Stoku
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
                Imazhet ({images.length})
              </h3>
              <p className="text-[11px] text-[rgba(18,18,18,0.4)]">
                Imazhi i parë është faqja kryesore
              </p>
            </div>
            {images.length === 0 ? (
              <div className="bg-[#F8F8F8] rounded-[8px] p-8 text-center text-[12px] text-[rgba(18,18,18,0.4)]">
                Asnjë imazh
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {images.map((src, idx) => (
                  <div
                    key={src + idx}
                    className="relative group bg-[#F5F5F5] rounded-[8px] overflow-hidden aspect-square"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-[#FFC334] text-[#062F35] text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase">
                        Kryesore
                      </span>
                    )}
                    <div className="absolute inset-0 bg-[#062F35]/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => makePrimary(idx)}
                          className="text-[10px] font-bold text-white bg-[#FFC334] px-2 py-1 rounded-[4px] hover:bg-white hover:text-[#062F35] transition-colors cursor-pointer"
                        >
                          Bëje kryesore
                        </button>
                      )}
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveImage(idx, -1)}
                          disabled={idx === 0}
                          className="text-[10px] text-white border border-white/40 px-2 py-1 rounded-[4px] hover:bg-white hover:text-[#062F35] disabled:opacity-30 cursor-pointer"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 1)}
                          disabled={idx === images.length - 1}
                          className="text-[10px] text-white border border-white/40 px-2 py-1 rounded-[4px] hover:bg-white hover:text-[#062F35] disabled:opacity-30 cursor-pointer"
                        >
                          ›
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="text-[10px] font-bold text-white bg-[#C62828] px-2 py-1 rounded-[4px] hover:bg-white hover:text-[#C62828] transition-colors cursor-pointer"
                      >
                        Fshi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column — meta + collections */}
        <div className="space-y-5">
          {/* Status */}
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Statusi
            </h3>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-[13px] font-semibold text-[#062F35]">Aktiv në dyqan</span>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-[#062F35]"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-[13px] font-semibold text-[#062F35]">I veçuar (featured)</span>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#FFC334]"
              />
            </label>
          </section>

          {/* Category & tags */}
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Kategoria dhe etiketat
            </h3>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Kategoria
              </label>
              <input
                list="categories-list"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-[40px] px-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
              />
              <datalist id="categories-list">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <p className="text-[10px] text-[rgba(18,18,18,0.35)] mt-1">
                Shkruaj një kategori ekzistuese ose krijo një të re
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Etiketat
              </label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Elektronike, Shtëpi, Kuzhinë"
                className="w-full h-[40px] px-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
              />
              <p className="text-[10px] text-[rgba(18,18,18,0.35)] mt-1">Nda me presje</p>
            </div>
          </section>

          {/* Collections — the actual fix for "switching categories" */}
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
                Koleksionet ({collectionIds.length})
              </h3>
              <Link
                href="/admin/collections"
                className="text-[10px] font-bold text-[#062F35] hover:text-[#FFC334] transition-colors"
              >
                Menaxho →
              </Link>
            </div>
            {collections.length === 0 ? (
              <p className="text-[12px] text-[rgba(18,18,18,0.4)] py-2">
                Asnjë koleksion. Krijo një nga{" "}
                <Link href="/admin/collections" className="text-[#062F35] underline">
                  faqja e koleksioneve
                </Link>
                .
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                {collections.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] cursor-pointer transition-colors ${
                      collectionIds.includes(c.id)
                        ? "bg-[#F0F7F8] border border-[#062F35]"
                        : "border border-transparent hover:bg-[#F8F8F8]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={collectionIds.includes(c.id)}
                      onChange={() => toggleCollection(c.id)}
                      className="w-4 h-4 accent-[#062F35]"
                    />
                    <span className="text-[12px] font-semibold text-[#062F35] flex-1">
                      {c.title}
                    </span>
                    {!c.isActive && (
                      <span className="text-[9px] font-bold text-[rgba(18,18,18,0.35)] uppercase">
                        Joaktiv
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Source */}
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Burimi
            </h3>
            <p className="text-[12px] font-semibold text-[#062F35] capitalize">
              {product.sourceStore}
            </p>
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[11px] text-[rgba(18,18,18,0.5)] hover:text-[#062F35] underline truncate"
            >
              {product.sourceUrl}
            </a>
          </section>
        </div>
      </div>
    </form>
  );
}
