"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";

// All 38 Kosovo municipalities + major cities, sorted alphabetically.
// Source: OSCE/Kosovo official list of komunat (2025).
const KOSOVO_CITIES = [
  "Artanë (Novobërdë)",
  "Deçan",
  "Dragash",
  "Drenas (Gllogoc)",
  "Ferizaj",
  "Fushë Kosovë",
  "Gjakovë",
  "Gjilan",
  "Graçanicë",
  "Han i Elezit",
  "Istog",
  "Junik",
  "Kaçanik",
  "Kamenicë",
  "Klinë",
  "Kllokot",
  "Leposaviq",
  "Lipjan",
  "Malishevë",
  "Mamushë",
  "Mitrovicë",
  "Mitrovicë e Veriut",
  "Obiliq",
  "Pejë",
  "Podujevë (Besianë)",
  "Prishtinë",
  "Prizren",
  "Rahovec",
  "Ranillug",
  "Shtërpcë",
  "Shtime",
  "Skenderaj",
  "Suharekë",
  "Therandë (Suharekë)",
  "Viti",
  "Vushtrri",
  "Zubin Potok",
  "Zveçan",
];

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const deliveryFee = subtotal >= 30 ? 0 : 2.5;
  const total = subtotal + deliveryFee;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("name"),
          customerPhone: form.get("phone"),
          customerEmail: form.get("email") || undefined,
          city: form.get("city"),
          address: form.get("address"),
          notes: form.get("notes") || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Dicka shkoi keq");
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/porosia/konfirmim/${data.order.id}`);
    } catch {
      setError("Dicka shkoi keq. Ju lutem provoni perseri.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary text-[16px] mb-4">Shporta juaj është bosh</p>
        <a href="/" className="text-[13px] font-bold text-text-primary underline underline-offset-4">
          Kthehu në kryefaqje
        </a>
      </div>
    );
  }

  const inputClass = "w-full h-12 px-4 border border-border rounded-lg text-[14px] outline-none focus:border-text-primary transition-colors";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
      {/* Form fields */}
      <div className="lg:col-span-3 space-y-5">
        <h2 className="text-[20px] font-bold text-text-primary mb-4">Të dhënat e dërgesës</h2>

        <div>
          <label htmlFor="name" className="block text-[13px] font-bold text-text-primary mb-1.5">Emri i plote *</label>
          <input id="name" name="name" required className={inputClass} />
        </div>

        <div>
          <label htmlFor="phone" className="block text-[13px] font-bold text-text-primary mb-1.5">Numri i telefonit *</label>
          <input id="phone" name="phone" type="tel" required placeholder="+383 4X XXX XXX" className={inputClass} />
        </div>

        <div>
          <label htmlFor="email" className="block text-[13px] font-bold text-text-primary mb-1.5">Email (opsional)</label>
          <input id="email" name="email" type="email" className={inputClass} />
        </div>

        <div>
          <label htmlFor="city" className="block text-[13px] font-bold text-text-primary mb-1.5">Qyteti / Komuna *</label>
          <select id="city" name="city" required className={`${inputClass} bg-white cursor-pointer`}>
            <option value="">Zgjidhni qytetin</option>
            {KOSOVO_CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="address" className="block text-[13px] font-bold text-text-primary mb-1.5">Adresa *</label>
          <input id="address" name="address" required placeholder="Rruga, numri, kati..." className={inputClass} />
        </div>

        <div>
          <label htmlFor="notes" className="block text-[13px] font-bold text-text-primary mb-1.5">Shënime (opsional)</label>
          <textarea id="notes" name="notes" rows={3} className="w-full px-4 py-3 border border-border rounded-lg text-[14px] outline-none focus:border-text-primary transition-colors resize-none" />
        </div>

        {error && (
          <p className="text-sale text-[13px] font-bold">{error}</p>
        )}
      </div>

      {/* Order summary */}
      <div className="lg:col-span-2">
        <div className="bg-[#F7F7F7] rounded-2xl p-6 sticky top-24">
          <h2 className="text-[18px] font-bold text-text-primary mb-5">Përmbledhja e porosisë</h2>

          <div className="space-y-3 mb-5">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-[13px]">
                <span className="line-clamp-1 mr-2 text-text">{item.title} x {item.quantity}</span>
                <span className="font-bold text-text-primary flex-shrink-0">&euro;{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-2.5">
            <div className="flex justify-between text-[13px]">
              <span className="text-text-secondary">Nëntotali</span>
              <span className="text-text-primary">&euro;{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-text-secondary">Dërgimi</span>
              <span className="text-text-primary">{deliveryFee === 0 ? "FALAS" : `€${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-[16px] font-bold text-text-primary pt-3 border-t border-border">
              <span>Totali</span>
              <span>&euro;{total.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-[12px] text-text-secondary mt-4 mb-5">
            Pagesa: Para në dorë (COD)
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#062F35] text-white py-4 rounded-[8px] text-[14px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors disabled:opacity-50"
          >
            {loading ? "Duke dërguar..." : `Konfirmo Porosinë — €${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </form>
  );
}
