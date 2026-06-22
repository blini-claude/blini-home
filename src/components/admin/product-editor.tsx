"use client";

import { useRef, useState } from "react";
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

interface NavCat {
  label: string;
  slug: string;
  children: { label: string; tag: string }[];
}

const EMPTY: EditorProduct = {
  id: "",
  title: "",
  slug: "",
  description: "",
  price: 0,
  compareAtPrice: null,
  category: "",
  tags: [],
  stock: 0,
  images: [],
  thumbnail: null,
  isActive: true,
  isFeatured: false,
  sourceStore: "manual",
  sourceUrl: "",
  collectionIds: [],
};

export function ProductEditor({
  product,
  collections,
  categories,
  navCategories = [],
  backHref,
}: {
  product?: EditorProduct;
  collections: CollectionRow[];
  categories: string[];
  navCategories?: NavCat[];
  backHref: string;
}) {
  const router = useRouter();
  const isCreate = !product;
  const initial = product ?? EMPTY;

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? "");
  const [price, setPrice] = useState(initial.price ? String(initial.price) : "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    initial.compareAtPrice != null ? String(initial.compareAtPrice) : ""
  );
  const [category, setCategory] = useState(initial.category);
  const [stock, setStock] = useState(String(initial.stock));
  const [isActive, setIsActive] = useState(initial.isActive);
  const [isFeatured, setIsFeatured] = useState(initial.isFeatured);
  const [thumbnail, setThumbnail] = useState(initial.thumbnail ?? "");
  const [images, setImages] = useState<string[]>(initial.images);
  const [collectionIds, setCollectionIds] = useState<string[]>(initial.collectionIds);
  const [tags, setTags] = useState<string[]>(initial.tags);

  // Map nav categories → backing collection (by slug). These drive the
  // "where it appears" placement cards. Collections without a nav category
  // are shown separately as plain checkboxes.
  const collBySlug = new Map(collections.map((c) => [c.slug, c]));
  const navWithColl = navCategories
    .map((n) => ({ nav: n, coll: collBySlug.get(n.slug) }))
    .filter((x): x is { nav: NavCat; coll: CollectionRow } => Boolean(x.coll));
  const mappedCollIds = new Set(navWithColl.map((x) => x.coll.id));
  const otherCollections = collections.filter((c) => !mappedCollIds.has(c.id));

  // All tags known to the taxonomy → rendered as chips. Anything else the
  // product carries is shown in the free-text "extra tags" field.
  const knownTags = new Set(
    navCategories.flatMap((n) => n.children.map((c) => c.tag).filter(Boolean))
  );
  const extraTags = tags.filter((t) => !knownTags.has(t));
  const [extraTagsInput, setExtraTagsInput] = useState(extraTags.join(", "));

  function toggleCollection(id: string) {
    setCollectionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }
  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
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
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Ngarkimi dështoi");
      setImages((prev) => [...prev, ...(data.urls as string[])]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ngarkimi dështoi");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const extra = extraTagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const taxonomyTags = tags.filter((t) => knownTags.has(t));
    const finalTags = Array.from(new Set([...taxonomyTags, ...extra]));

    const payload = {
      title,
      description: description || null,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      category,
      tags: finalTags,
      stock: parseInt(stock, 10) || 0,
      isActive,
      isFeatured,
      thumbnail: thumbnail || images[0] || null,
      images,
      collectionIds,
    };

    const res = await fetch(
      isCreate ? "/api/admin/products" : `/api/admin/products/${initial.id}`,
      {
        method: isCreate ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

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
            disabled={saving || uploading}
            className="h-[40px] px-5 bg-[#062F35] text-white rounded-[8px] text-[12px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? "Duke ruajtur..." : isCreate ? "Krijo produktin" : "Ruaj ndryshimet"}
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
                placeholder="p.sh. Tavë gatimi prej qeramike 28cm"
                className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
              />
              {!isCreate && (
                <p className="text-[10px] text-[rgba(18,18,18,0.35)] mt-1">
                  Slug: <code className="font-mono">{initial.slug}</code>
                </p>
              )}
              {isCreate && (
                <p className="text-[10px] text-[rgba(18,18,18,0.35)] mt-1">
                  Adresa (slug) krijohet automatikisht nga titulli.
                </p>
              )}
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

          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Çmimi dhe stoku
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                  Çmimi (€)
                </label>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                  Çmimi i vjetër (€)
                </label>
                <input type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                  Stoku
                </label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors" />
              </div>
            </div>
          </section>

          {/* Images — with upload */}
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
                Imazhet ({images.length})
              </h3>
              <p className="text-[11px] text-[rgba(18,18,18,0.4)]">
                Imazhi i parë është faqja kryesore
              </p>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                uploadFiles(e.dataTransfer.files);
              }}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-[#D0D0D0] rounded-[10px] p-6 text-center cursor-pointer hover:border-[#062F35] transition-colors"
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => uploadFiles(e.target.files)}
                className="hidden"
              />
              <p className="text-[13px] font-bold text-[#062F35]">
                {uploading ? "Duke ngarkuar..." : "Kliko ose tërhiq imazhet këtu"}
              </p>
              <p className="text-[11px] text-[rgba(18,18,18,0.4)] mt-1">
                JPG, PNG, WEBP — optimizohen automatikisht
              </p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {images.map((src, idx) => (
                  <div key={src + idx} className="relative group bg-[#F5F5F5] rounded-[8px] overflow-hidden aspect-square">
                    <Image src={src} alt="" fill sizes="200px" className="object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-[#FFC334] text-[#062F35] text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase">
                        Kryesore
                      </span>
                    )}
                    <div className="absolute inset-0 bg-[#062F35]/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                      {idx > 0 && (
                        <button type="button" onClick={() => makePrimary(idx)} className="text-[10px] font-bold text-white bg-[#FFC334] px-2 py-1 rounded-[4px] hover:bg-white hover:text-[#062F35] transition-colors cursor-pointer">
                          Bëje kryesore
                        </button>
                      )}
                      <div className="flex gap-1">
                        <button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0} className="text-[10px] text-white border border-white/40 px-2 py-1 rounded-[4px] hover:bg-white hover:text-[#062F35] disabled:opacity-30 cursor-pointer">‹</button>
                        <button type="button" onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1} className="text-[10px] text-white border border-white/40 px-2 py-1 rounded-[4px] hover:bg-white hover:text-[#062F35] disabled:opacity-30 cursor-pointer">›</button>
                      </div>
                      <button type="button" onClick={() => removeImage(idx)} className="text-[10px] font-bold text-white bg-[#C62828] px-2 py-1 rounded-[4px] hover:bg-white hover:text-[#C62828] transition-colors cursor-pointer">
                        Fshi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Placement — where the product shows */}
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
                Vendosja në dyqan
              </h3>
              <p className="text-[11px] text-[rgba(18,18,18,0.4)] mt-1">
                Zgjidh menytë ku shfaqet produkti dhe nënkategoritë përkatëse.
              </p>
            </div>

            {navWithColl.length === 0 && (
              <p className="text-[12px] text-[rgba(18,18,18,0.45)]">
                Asnjë kategori e menysë me koleksion përkatës. Krijo koleksione me të njëjtin
                slug si kategoritë te{" "}
                <Link href="/admin/nav" className="underline text-[#062F35]">Menyja e dyqanit</Link>.
              </p>
            )}

            <div className="space-y-2.5">
              {navWithColl.map(({ nav, coll }) => {
                const checked = collectionIds.includes(coll.id);
                return (
                  <div key={coll.id} className={`rounded-[8px] border transition-colors ${checked ? "border-[#062F35] bg-[#F0F7F8]" : "border-[#E8E8E8]"}`}>
                    <label className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer">
                      <input type="checkbox" checked={checked} onChange={() => toggleCollection(coll.id)} className="w-4 h-4 accent-[#062F35]" />
                      <span className="text-[13px] font-bold text-[#062F35]">{nav.label}</span>
                      <span className="text-[10px] font-mono text-[rgba(18,18,18,0.35)]">/{coll.slug}</span>
                    </label>
                    {checked && nav.children.length > 0 && (
                      <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                        {nav.children.filter((c) => c.tag).map((c) => {
                          const on = tags.includes(c.tag);
                          return (
                            <button
                              key={c.tag}
                              type="button"
                              onClick={() => toggleTag(c.tag)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${on ? "bg-[#062F35] text-white border-[#062F35]" : "bg-white text-[#062F35] border-[#D8D8D8] hover:border-[#062F35]"}`}
                            >
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {otherCollections.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-[#062F35] mb-2 uppercase tracking-wider">
                  Koleksione të tjera
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {otherCollections.map((c) => {
                    const on = collectionIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCollection(c.id)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${on ? "bg-[#062F35] text-white border-[#062F35]" : "bg-white text-[#062F35] border-[#D8D8D8] hover:border-[#062F35]"}`}
                      >
                        {c.title}
                        {!c.isActive && " (joaktiv)"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Statusi
            </h3>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-[13px] font-semibold text-[#062F35]">Aktiv në dyqan</span>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 accent-[#062F35]" />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-[13px] font-semibold text-[#062F35]">I veçuar (në ballinë)</span>
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-[#FFC334]" />
            </label>
          </section>

          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Kategoria kryesore
            </h3>
            <div>
              <input
                list="categories-list"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="p.sh. Kuzhinë"
                className="w-full h-[40px] px-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
              />
              <datalist id="categories-list">
                {navCategories.map((n) => (
                  <option key={`nav-${n.slug}`} value={n.label} />
                ))}
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <p className="text-[10px] text-[rgba(18,18,18,0.35)] mt-1">
                Përdoret për filtra dhe kërkim.
              </p>
            </div>
          </section>

          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Etiketa shtesë
            </h3>
            <input
              value={extraTagsInput}
              onChange={(e) => setExtraTagsInput(e.target.value)}
              placeholder="dhuratë, premium"
              className="w-full h-[40px] px-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
            />
            <p className="text-[10px] text-[rgba(18,18,18,0.35)]">
              Nda me presje. Nënkategoritë e zgjedhura më sipër shtohen automatikisht.
            </p>
          </section>
        </div>
      </div>
    </form>
  );
}
