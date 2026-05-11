"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DiscountInitial {
  id?: string;
  code: string;
  description: string | null;
  discountType: "percentage" | "fixed";
  value: number;
  minOrderTotal: number | null;
  startsAt: string;
  expiresAt: string | null;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  isActive: boolean;
  usageCount?: number;
}

export function DiscountForm({
  discount,
  mode,
}: {
  discount: DiscountInitial;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState(discount.code);
  const [description, setDescription] = useState(discount.description ?? "");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(discount.discountType);
  const [value, setValue] = useState(String(discount.value || ""));
  const [minOrderTotal, setMinOrderTotal] = useState(
    discount.minOrderTotal != null ? String(discount.minOrderTotal) : ""
  );
  const [expiresAt, setExpiresAt] = useState(
    discount.expiresAt ? discount.expiresAt.slice(0, 10) : ""
  );
  const [usageLimit, setUsageLimit] = useState(
    discount.usageLimit != null ? String(discount.usageLimit) : ""
  );
  const [perCustomerLimit, setPerCustomerLimit] = useState(
    discount.perCustomerLimit != null ? String(discount.perCustomerLimit) : ""
  );
  const [isActive, setIsActive] = useState(discount.isActive);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      code: code.trim().toUpperCase(),
      description: description.trim() || null,
      discountType,
      value: parseFloat(value),
      minOrderTotal: minOrderTotal ? parseFloat(minOrderTotal) : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
      perCustomerLimit: perCustomerLimit ? parseInt(perCustomerLimit, 10) : null,
      isActive,
    };

    const url = mode === "create" ? "/api/admin/discounts" : `/api/admin/discounts/${discount.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Gabim gjatë ruajtjes");
      return;
    }

    router.push("/admin/discounts");
    router.refresh();
  }

  async function handleDelete() {
    if (!discount.id) return;
    if (!confirm("Je i sigurt që dëshiron të fshish këtë kupon?")) return;
    setSaving(true);
    await fetch(`/api/admin/discounts/${discount.id}`, { method: "DELETE" });
    router.push("/admin/discounts");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/admin/discounts"
          className="flex items-center gap-2 text-[12px] font-bold text-[rgba(18,18,18,0.5)] hover:text-[#062F35] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Kthehu te kuponët
        </Link>
        <div className="flex gap-3 items-center">
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="text-[11px] font-bold text-[#C62828] hover:text-[#E53935] transition-colors disabled:opacity-50"
            >
              Fshij
            </button>
          )}
          <Link
            href="/admin/discounts"
            className="h-[40px] px-5 flex items-center border-2 border-[#E8E8E8] rounded-[8px] text-[12px] font-bold text-[#062F35] hover:bg-[#F5F5F5] transition-colors"
          >
            Anulo
          </Link>
          <button
            type="submit"
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
        <div className="lg:col-span-2 space-y-5">
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Kupon
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                  Kodi
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  readOnly={mode === "edit"}
                  placeholder="P.SH. EID2026"
                  className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[14px] text-[#062F35] font-bold font-mono outline-none focus:border-[#062F35] transition-colors disabled:bg-[#F5F5F5] read-only:bg-[#F8F8F8]"
                />
                {mode === "edit" && (
                  <p className="text-[10px] text-[rgba(18,18,18,0.35)] mt-1">
                    Kodi nuk mund të ndryshohet pasi krijohet
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                  Tipi
                </label>
                <div className="flex h-[44px] bg-[#F5F5F5] rounded-[8px] p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setDiscountType("percentage")}
                    className={`flex-1 rounded-[6px] text-[12px] font-bold transition-colors ${
                      discountType === "percentage"
                        ? "bg-white text-[#062F35] shadow-sm"
                        : "text-[rgba(18,18,18,0.45)] hover:text-[#062F35]"
                    }`}
                  >
                    Përqindje (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("fixed")}
                    className={`flex-1 rounded-[6px] text-[12px] font-bold transition-colors ${
                      discountType === "fixed"
                        ? "bg-white text-[#062F35] shadow-sm"
                        : "text-[rgba(18,18,18,0.45)] hover:text-[#062F35]"
                    }`}
                  >
                    Shumë fikse (€)
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                  Vlera {discountType === "percentage" ? "(%)" : "(€)"}
                </label>
                <input
                  type="number"
                  step={discountType === "percentage" ? "1" : "0.01"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                  Minimumi i porosisë (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={minOrderTotal}
                  onChange={(e) => setMinOrderTotal(e.target.value)}
                  placeholder="Bosh = pa minimum"
                  className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Përshkrimi (vetëm për ty)
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="P.sh. Fushata e Bajramit 2026"
                className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
              />
            </div>
          </section>

          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Kufijtë
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                  Skadon më
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full h-[44px] px-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                  Limiti total i përdorimit
                </label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Bosh = pakufizuar"
                  className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                  Limiti për klient
                </label>
                <input
                  type="number"
                  value={perCustomerLimit}
                  onChange={(e) => setPerCustomerLimit(e.target.value)}
                  placeholder="Bosh = pakufizuar"
                  className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Statusi
            </h3>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-[13px] font-semibold text-[#062F35]">Aktiv</span>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-[#062F35]"
              />
            </label>
            {mode === "edit" && discount.usageCount !== undefined && (
              <p className="text-[11px] text-[rgba(18,18,18,0.45)] pt-2 border-t border-[#F0F0F0]">
                Përdorur deri tani: <span className="font-bold text-[#062F35]">{discount.usageCount}</span>
                {discount.usageLimit != null && ` / ${discount.usageLimit}`}
              </p>
            )}
          </section>

          <section className="bg-[#FFF8E1] border border-[#FFE082] rounded-[12px] p-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#B8860B] mb-2">
              Si funksionon
            </h3>
            <ul className="text-[12px] text-[#062F35] space-y-1.5 leading-relaxed">
              <li>· Klienti vendos kodin gjatë porosisë (në checkout).</li>
              <li>· Zbritja zbatohet mbi nën-totalin para transportit.</li>
              <li>· Çdo përdorim numërohet automatikisht në porosinë e ardhshme.</li>
            </ul>
          </section>
        </div>
      </div>
    </form>
  );
}
