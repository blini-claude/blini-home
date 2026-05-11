"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface ProductSuggestion {
  id: string;
  title: string;
  price: number;
  thumbnail: string | null;
  sourceStore: string;
  stock: number;
}

interface LineItem {
  productId: string;
  title: string;
  thumbnail: string | null;
  quantity: number;
  price: number;
  sourceStore: string;
}

const KOSOVO_CITIES = [
  "Prishtinë", "Prizren", "Pejë", "Gjakovë", "Mitrovicë", "Ferizaj", "Gjilan",
  "Vushtrri", "Suharekë", "Rahovec", "Lipjan", "Malishevë", "Skenderaj",
  "Podujevë (Besianë)", "Kamenicë", "Kaçanik", "Drenas (Gllogoc)",
  "Fushë Kosovë", "Istog", "Klinë", "Deçan", "Dragash", "Obiliq", "Shtime",
  "Viti", "Han i Elezit", "Hani i Elezit", "Junik", "Mamushë", "Artanë (Novobërdë)",
  "Graçanicë", "Kllokot", "Ranillug", "Shtërpcë", "Leposaviq", "Zubin Potok",
  "Zveçan", "Mitrovicë e Veriut", "Therandë (Suharekë)",
];

export function ManualOrderForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [status, setStatus] = useState("confirmed");

  const [items, setItems] = useState<LineItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState("0");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!search.trim() || search.length < 2) {
      setSuggestions([]);
      return;
    }
    searchDebounce.current = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setSuggestions(
        (data.products || []).slice(0, 10).map((p: ProductSuggestion) => p)
      );
      setSearching(false);
      setShowSuggestions(true);
    }, 250);
    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [search]);

  function addProduct(p: ProductSuggestion) {
    const existing = items.find((i) => i.productId === p.id);
    if (existing) {
      setItems(items.map((i) => (i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setItems([
        ...items,
        {
          productId: p.id,
          title: p.title,
          thumbnail: p.thumbnail,
          quantity: 1,
          price: p.price,
          sourceStore: p.sourceStore,
        },
      ]);
    }
    setSearch("");
    setSuggestions([]);
    setShowSuggestions(false);
  }

  function updateQuantity(productId: string, qty: number) {
    if (qty <= 0) {
      setItems(items.filter((i) => i.productId !== productId));
    } else {
      setItems(items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)));
    }
  }

  function updatePrice(productId: string, price: number) {
    setItems(items.map((i) => (i.productId === productId ? { ...i, price } : i)));
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = Math.max(0, Math.min(subtotal, parseFloat(discountAmount) || 0));
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const computedFee = deliveryFee === "" ? (discountedSubtotal >= 30 ? 0 : 2.5) : parseFloat(deliveryFee);
  const total = discountedSubtotal + computedFee;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) {
      setError("Shto të paktën një artikull");
      return;
    }
    setSaving(true);
    setError(null);

    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        customerPhone: phone,
        customerEmail: email || undefined,
        city,
        address,
        notes: notes || undefined,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        discountAmount: discount,
        deliveryFee: computedFee,
        paymentMethod,
        status,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Gabim gjatë krijimit të porosisë");
      return;
    }

    const created = await res.json();
    router.push(`/admin/orders/${created.id}`);
    router.refresh();
  }

  const inputClass =
    "w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors";

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/admin/orders"
          className="flex items-center gap-2 text-[12px] font-bold text-[rgba(18,18,18,0.5)] hover:text-[#062F35] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Kthehu te porositë
        </Link>
        <button
          type="submit"
          disabled={saving || items.length === 0}
          className="h-[40px] px-5 bg-[#062F35] text-white rounded-[8px] text-[12px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] disabled:opacity-50 transition-colors cursor-pointer"
        >
          {saving ? "Duke krijuar..." : "Krijo porosinë"}
        </button>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] border border-[#EF5350] text-[#C62828] text-[12px] font-semibold px-4 py-3 rounded-[8px]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — items */}
        <div className="lg:col-span-2 space-y-5">
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Artikujt ({items.length})
            </h3>

            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Kërko produkte për të shtuar..."
                className={inputClass}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 top-[48px] left-0 right-0 bg-white border border-[#E8E8E8] rounded-[8px] shadow-lg max-h-[360px] overflow-y-auto">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#FAFBFC] text-left border-b border-[#F8F8F8] last:border-b-0"
                    >
                      <div className="w-[32px] h-[32px] bg-[#F5F5F5] rounded-[6px] overflow-hidden relative flex-shrink-0">
                        {p.thumbnail && (
                          <Image src={p.thumbnail} alt="" fill sizes="32px" className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#062F35] truncate">{p.title}</p>
                        <p className="text-[10px] text-[rgba(18,18,18,0.45)] capitalize">
                          {p.sourceStore} · stok {p.stock}
                        </p>
                      </div>
                      <span className="text-[12px] font-bold text-[#062F35] flex-shrink-0">
                        €{p.price.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {searching && (
                <p className="text-[10px] text-[rgba(18,18,18,0.45)] mt-1">Duke kërkuar...</p>
              )}
            </div>

            {items.length === 0 ? (
              <div className="bg-[#FAFBFC] rounded-[8px] p-8 text-center text-[12px] text-[rgba(18,18,18,0.45)]">
                Ende asnjë artikull
              </div>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3 bg-[#FAFBFC] rounded-[8px] p-3">
                    <div className="w-[40px] h-[40px] bg-white rounded-[6px] overflow-hidden relative flex-shrink-0">
                      {item.thumbnail && (
                        <Image src={item.thumbnail} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#062F35] truncate">{item.title}</p>
                      <p className="text-[10px] text-[rgba(18,18,18,0.45)] capitalize">
                        {item.sourceStore}
                      </p>
                    </div>
                    <input
                      type="number"
                      value={item.quantity}
                      min={0}
                      onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                      className="w-[60px] h-[36px] px-2 border-2 border-[#E8E8E8] rounded-[6px] text-[12px] text-center text-[#062F35] outline-none focus:border-[#062F35]"
                    />
                    <span className="text-[11px] text-[rgba(18,18,18,0.45)]">×</span>
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updatePrice(item.productId, parseFloat(e.target.value) || 0)}
                      className="w-[80px] h-[36px] px-2 border-2 border-[#E8E8E8] rounded-[6px] text-[12px] text-right text-[#062F35] outline-none focus:border-[#062F35]"
                    />
                    <span className="text-[12px] font-bold text-[#062F35] w-[70px] text-right">
                      €{(item.quantity * item.price).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, 0)}
                      className="text-[rgba(18,18,18,0.35)] hover:text-[#C62828] text-[18px] leading-none"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Totals */}
            <div className="pt-3 border-t border-[#F0F0F0] space-y-2">
              <div className="flex justify-between text-[12px] text-[rgba(18,18,18,0.6)]">
                <span>Nën-total</span>
                <span className="font-semibold">€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[12px] text-[rgba(18,18,18,0.6)]">
                <span>Zbritja (€)</span>
                <input
                  type="number"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-[90px] h-[32px] px-2 border-2 border-[#E8E8E8] rounded-[6px] text-[12px] text-right text-[#062F35] outline-none focus:border-[#062F35]"
                />
              </div>
              <div className="flex justify-between items-center text-[12px] text-[rgba(18,18,18,0.6)]">
                <span>Transporti (€)</span>
                <input
                  type="number"
                  step="0.01"
                  value={deliveryFee}
                  placeholder="Auto"
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-[90px] h-[32px] px-2 border-2 border-[#E8E8E8] rounded-[6px] text-[12px] text-right text-[#062F35] outline-none focus:border-[#062F35]"
                />
              </div>
              <div className="flex justify-between text-[16px] font-bold text-[#062F35] pt-2 border-t border-[#E8E8E8]">
                <span>Totali</span>
                <span>€{total.toFixed(2)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right — customer */}
        <div className="space-y-5">
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Klienti
            </h3>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Emri *
              </label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Telefoni *
              </label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" required placeholder="+383 4X XXX XXX" className={inputClass} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputClass} />
            </div>
          </section>

          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Adresa
            </h3>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Qyteti *
              </label>
              <select value={city} onChange={(e) => setCity(e.target.value)} required className={`${inputClass} bg-white cursor-pointer`}>
                <option value="">Zgjidh...</option>
                {KOSOVO_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Adresa *
              </label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Rruga, numri, kati..." className={inputClass} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Shënime
              </label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] resize-y" />
            </div>
          </section>

          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
              Cilësimet
            </h3>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Pagesa
              </label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={`${inputClass} bg-white cursor-pointer`}>
                <option value="COD">Para në dorë (COD)</option>
                <option value="bank-transfer">Transfertë bankare</option>
                <option value="other">Tjetër</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
                Statusi fillestar
              </label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} bg-white cursor-pointer`}>
                <option value="pending">Në pritje</option>
                <option value="confirmed">Konfirmuar</option>
              </select>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
