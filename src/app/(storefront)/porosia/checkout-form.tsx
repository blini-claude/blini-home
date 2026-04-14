"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";

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
        setError(data.error || "Diçka shkoi keq");
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/porosia/konfirmim/${data.order.id}`);
    } catch {
      setError("Diçka shkoi keq. Ju lutem provoni përsëri.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary text-lg mb-4">Shporta juaj është bosh</p>
        <a href="/" className="text-sm font-semibold underline">Kthehu në kryefaqje</a>
      </div>
    );
  }

  const inputClass = "w-full h-12 px-3 border border-border rounded-none text-sm outline-none focus:ring-1 focus:ring-text";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Form fields */}
      <div className="lg:col-span-3 space-y-4">
        <h2 className="text-xl font-bold mb-2">Të dhënat e dërgesës</h2>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Emri i plotë *</label>
          <input
            id="name"
            name="name"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">Numri i telefonit *</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="+383 4X XXX XXX"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email (opsional)</label>
          <input
            id="email"
            name="email"
            type="email"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">Qyteti *</label>
          <select
            id="city"
            name="city"
            required
            className={`${inputClass} bg-white`}
          >
            <option value="">Zgjidhni qytetin</option>
            <option value="Prishtinë">Prishtinë</option>
            <option value="Prizren">Prizren</option>
            <option value="Pejë">Pejë</option>
            <option value="Mitrovicë">Mitrovicë</option>
            <option value="Gjilan">Gjilan</option>
            <option value="Ferizaj">Ferizaj</option>
            <option value="Gjakovë">Gjakovë</option>
          </select>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-1">Adresa *</label>
          <input
            id="address"
            name="address"
            required
            placeholder="Rruga, numri, kati..."
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">Shënime (opsional)</label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full px-3 py-3 border border-border rounded-none text-sm outline-none focus:ring-1 focus:ring-text resize-none"
          />
        </div>

        {error && (
          <p className="text-sale text-sm font-medium">{error}</p>
        )}
      </div>

      {/* Order summary */}
      <div className="lg:col-span-2">
        <div className="bg-card-bg p-6 sticky top-20">
          <h2 className="text-lg font-bold mb-4">Përmbledhja e porosisë</h2>

          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="line-clamp-1 mr-2">{item.title} x {item.quantity}</span>
                <span className="font-medium flex-shrink-0">{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Nëntotali</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Dërgimi</span>
              <span>{deliveryFee === 0 ? "FALAS" : `€${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
              <span>Totali</span>
              <span>{total.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-xs text-text-secondary mt-3 mb-4">
            Pagesa: Para ne dore (COD)
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-white py-4 rounded-[5px] text-base font-semibold hover:bg-[#1A1A1A]/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Duke dërguar..." : `Konfirmo Porosinë — €${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </form>
  );
}
