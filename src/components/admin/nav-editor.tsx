"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Child {
  label: string;
  tag: string;
  href: string;
}
interface Category {
  label: string;
  slug: string;
  color: string;
  promoTitle: string;
  promoSubtitle: string;
  isActive: boolean;
  children: Child[];
}

const EMPTY_CHILD: Child = { label: "", tag: "", href: "" };
const newCategory = (): Category => ({
  label: "",
  slug: "",
  color: "#E8F0E4",
  promoTitle: "",
  promoSubtitle: "",
  isActive: true,
  children: [],
});

export function NavEditor({
  initial,
  collectionSlugs,
}: {
  initial: Category[];
  collectionSlugs: { slug: string; title: string }[];
}) {
  const router = useRouter();
  const [cats, setCats] = useState<Category[]>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(initial.length ? 0 : null);

  const slugSet = new Set(collectionSlugs.map((c) => c.slug));

  function update(i: number, patch: Partial<Category>) {
    setCats((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }
  function move(i: number, dir: -1 | 1) {
    setCats((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setOpen(null);
  }
  function remove(i: number) {
    if (!confirm("Të fshihet kjo kategori nga menyja?")) return;
    setCats((prev) => prev.filter((_, idx) => idx !== i));
    setOpen(null);
  }
  function add() {
    setCats((prev) => [...prev, newCategory()]);
    setOpen(cats.length);
  }

  function updateChild(ci: number, chi: number, patch: Partial<Child>) {
    setCats((prev) =>
      prev.map((c, idx) =>
        idx === ci
          ? { ...c, children: c.children.map((ch, j) => (j === chi ? { ...ch, ...patch } : ch)) }
          : c
      )
    );
  }
  function addChild(ci: number) {
    setCats((prev) =>
      prev.map((c, idx) => (idx === ci ? { ...c, children: [...c.children, { ...EMPTY_CHILD }] } : c))
    );
  }
  function removeChild(ci: number, chi: number) {
    setCats((prev) =>
      prev.map((c, idx) =>
        idx === ci ? { ...c, children: c.children.filter((_, j) => j !== chi) } : c
      )
    );
  }
  function moveChild(ci: number, chi: number, dir: -1 | 1) {
    setCats((prev) =>
      prev.map((c, idx) => {
        if (idx !== ci) return c;
        const next = [...c.children];
        const j = chi + dir;
        if (j < 0 || j >= next.length) return c;
        [next[chi], next[j]] = [next[j], next[chi]];
        return { ...c, children: next };
      })
    );
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSavedAt(null);
    const res = await fetch("/api/admin/nav", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: cats }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Ruajtja dështoi");
      return;
    }
    setSavedAt(new Date().toLocaleTimeString("sq"));
    router.refresh();
  }

  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-[13px] text-[rgba(18,18,18,0.6)] max-w-[640px]">
          Çdo kategori shfaqet në menynë e sipërme dhe çon te{" "}
          <code className="font-mono text-[12px]">/koleksion/&lt;slug&gt;</code>. Që produktet të
          shfaqen aty, slug-u duhet të përputhet me një koleksion. Nënkategoritë filtrojnë sipas
          etiketës (tag).
        </p>
        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="text-[12px] font-semibold text-[#2E7D32]">U ruajt {savedAt}</span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="h-[40px] px-5 bg-[#062F35] text-white rounded-[8px] text-[12px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? "Duke ruajtur..." : "Ruaj menynë"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] border border-[#EF5350] text-[#C62828] text-[12px] font-semibold px-4 py-3 rounded-[8px]">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {cats.map((cat, i) => {
          const isOpen = open === i;
          const slugMissing = cat.slug && !slugSet.has(cat.slug);
          return (
            <div key={i} className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
              {/* Row header */}
              <div className="flex items-center gap-3 px-4 h-[56px]">
                <span
                  className="w-[14px] h-[14px] rounded-full flex-shrink-0 border border-[rgba(0,0,0,0.1)]"
                  style={{ backgroundColor: cat.color }}
                />
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex-1 text-left flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-[14px] font-bold text-[#062F35]">
                    {cat.label || "Pa titull"}
                  </span>
                  <span className="text-[11px] text-[rgba(18,18,18,0.4)] font-mono">/{cat.slug}</span>
                  <span className="text-[11px] text-[rgba(18,18,18,0.4)]">
                    · {cat.children.length} nënkat.
                  </span>
                  {!cat.isActive && (
                    <span className="text-[9px] font-bold uppercase text-[rgba(18,18,18,0.35)]">
                      Joaktiv
                    </span>
                  )}
                  {slugMissing && (
                    <span className="text-[9px] font-bold uppercase text-[#C62828]" title="Slug-u s'ka koleksion">
                      ⚠ pa koleksion
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[#F5F5F5] disabled:opacity-30 cursor-pointer text-[#062F35]" aria-label="Lart">↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === cats.length - 1} className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[#F5F5F5] disabled:opacity-30 cursor-pointer text-[#062F35]" aria-label="Poshtë">↓</button>
                  <button onClick={() => remove(i)} className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[#FFEBEE] text-[#C62828] cursor-pointer" aria-label="Fshi">✕</button>
                </div>
              </div>

              {/* Expanded editor */}
              {isOpen && (
                <div className="border-t border-[#F0F0F0] p-4 space-y-4 bg-[#FBFBFB]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Titulli">
                      <input value={cat.label} onChange={(e) => update(i, { label: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Slug (lihet bosh = nga titulli)">
                      <input value={cat.slug} onChange={(e) => update(i, { slug: e.target.value })} placeholder="auto" className={`${inputCls} font-mono`} list="collection-slugs" />
                      <datalist id="collection-slugs">
                        {collectionSlugs.map((c) => (
                          <option key={c.slug} value={c.slug}>{c.title}</option>
                        ))}
                      </datalist>
                    </Field>
                    <Field label="Ngjyra (mega-menu)">
                      <div className="flex items-center gap-2">
                        <input type="color" value={cat.color} onChange={(e) => update(i, { color: e.target.value })} className="w-[40px] h-[40px] rounded-[8px] border-2 border-[#E8E8E8] cursor-pointer p-0.5" />
                        <input value={cat.color} onChange={(e) => update(i, { color: e.target.value })} className={`${inputCls} font-mono`} />
                      </div>
                    </Field>
                    <Field label="Aktiv në meny">
                      <label className="flex items-center gap-2 h-[40px] cursor-pointer">
                        <input type="checkbox" checked={cat.isActive} onChange={(e) => update(i, { isActive: e.target.checked })} className="w-4 h-4 accent-[#062F35]" />
                        <span className="text-[13px] text-[#062F35]">Shfaqe këtë kategori</span>
                      </label>
                    </Field>
                    <Field label="Promo titulli (mega-menu)">
                      <input value={cat.promoTitle} onChange={(e) => update(i, { promoTitle: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Promo nëntitulli">
                      <input value={cat.promoSubtitle} onChange={(e) => update(i, { promoSubtitle: e.target.value })} className={inputCls} />
                    </Field>
                  </div>

                  {/* Children */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
                        Nënkategoritë ({cat.children.length})
                      </p>
                      <button onClick={() => addChild(i)} className="text-[11px] font-bold text-[#062F35] hover:text-[#FFC334] cursor-pointer">
                        + Shto nënkategori
                      </button>
                    </div>
                    <div className="space-y-2">
                      {cat.children.map((ch, chi) => (
                        <div key={chi} className="flex items-center gap-2 bg-white border border-[#E8E8E8] rounded-[8px] p-2">
                          <div className="flex flex-col">
                            <button onClick={() => moveChild(i, chi, -1)} disabled={chi === 0} className="text-[10px] leading-none px-1 disabled:opacity-30 cursor-pointer">▲</button>
                            <button onClick={() => moveChild(i, chi, 1)} disabled={chi === cat.children.length - 1} className="text-[10px] leading-none px-1 disabled:opacity-30 cursor-pointer">▼</button>
                          </div>
                          <input value={ch.label} onChange={(e) => updateChild(i, chi, { label: e.target.value })} placeholder="Emri" className={`${inputCls} flex-1`} />
                          <input value={ch.tag} onChange={(e) => updateChild(i, chi, { tag: e.target.value })} placeholder="Etiketa (tag)" className={`${inputCls} flex-1`} />
                          <input value={ch.href} onChange={(e) => updateChild(i, chi, { href: e.target.value })} placeholder="Link (opsional)" className={`${inputCls} flex-1 font-mono`} />
                          <button onClick={() => removeChild(i, chi)} className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-[6px] hover:bg-[#FFEBEE] text-[#C62828] cursor-pointer" aria-label="Fshi">✕</button>
                        </div>
                      ))}
                      {cat.children.length === 0 && (
                        <p className="text-[12px] text-[rgba(18,18,18,0.4)] py-1">Asnjë nënkategori.</p>
                      )}
                    </div>
                    <p className="text-[10px] text-[rgba(18,18,18,0.4)] mt-2">
                      <b>Etiketa</b> filtron koleksionin sipas tag-ut të produktit (
                      <code className="font-mono">?tag=...</code>). Lëre bosh dhe vendos një <b>Link</b> për një adresë të personalizuar.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={add}
        className="w-full h-[48px] border-2 border-dashed border-[#D0D0D0] rounded-[12px] text-[13px] font-bold text-[rgba(18,18,18,0.5)] hover:border-[#062F35] hover:text-[#062F35] transition-colors cursor-pointer"
      >
        + Shto kategori të re
      </button>
    </div>
  );
}

const inputCls =
  "h-[40px] px-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors w-full bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
