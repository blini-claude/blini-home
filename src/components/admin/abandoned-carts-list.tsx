"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  title: string;
  thumbnail: string | null;
}

interface AbandonedCart {
  id: string;
  phone: string;
  customerName: string | null;
  customerEmail: string | null;
  city: string | null;
  items: CartItem[];
  subtotal: number;
  contacted: boolean;
  contactedAt: string | null;
  recovered: boolean;
  recoveredAt: string | null;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} orë`;
  const days = Math.floor(hours / 24);
  return `${days} ditë`;
}

export function AbandonedCartsList({ carts }: { carts: AbandonedCart[] }) {
  const router = useRouter();
  const [working, setWorking] = useState<string | null>(null);

  async function mark(id: string, body: object) {
    setWorking(id);
    await fetch(`/api/admin/abandoned-carts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setWorking(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Fshij këtë karrocë?")) return;
    setWorking(id);
    await fetch(`/api/admin/abandoned-carts/${id}`, { method: "DELETE" });
    setWorking(null);
    router.refresh();
  }

  if (carts.length === 0) {
    return (
      <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-12 text-center">
        <p className="text-[13px] text-[rgba(18,18,18,0.4)]">Asnjë karrocë e braktisur këtu</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {carts.map((cart) => {
        const phoneDigits = cart.phone.replace(/\D/g, "");
        const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);
        return (
          <article
            key={cart.id}
            className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden"
          >
            <header className="px-5 py-3 flex items-center justify-between gap-4 flex-wrap border-b border-[#F0F0F0]">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[13px] font-bold text-[#062F35]">
                    {cart.customerName || "I panjohur"}
                  </p>
                  <p className="text-[11px] text-[rgba(18,18,18,0.5)]">
                    {cart.phone} · {cart.city || "—"}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-[4px] bg-[#FFF8E1] text-[#B8860B]">
                  {timeAgo(cart.createdAt)} më parë
                </span>
                {cart.recovered && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-[4px] bg-[#E8F5E9] text-[#2E7D32]">
                    Rikuperuar
                  </span>
                )}
                {cart.contacted && !cart.recovered && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-[4px] bg-[#E3F2FD] text-[#1E88E5]">
                    Kontaktuar
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-[18px] font-bold text-[#062F35]">€{cart.subtotal.toFixed(2)}</p>
                <p className="text-[10px] text-[rgba(18,18,18,0.45)]">
                  {totalItems} artikuj · {cart.items.length} produkte
                </p>
              </div>
            </header>

            <ul className="px-5 py-3 space-y-2">
              {cart.items.slice(0, 4).map((item, i) => (
                <li key={`${cart.id}-${i}`} className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] bg-[#F5F5F5] rounded-[6px] overflow-hidden relative flex-shrink-0">
                    {item.thumbnail && (
                      <Image src={item.thumbnail} alt="" fill sizes="40px" className="object-cover" />
                    )}
                  </div>
                  <p className="flex-1 text-[12px] text-[#062F35] truncate">{item.title}</p>
                  <p className="text-[11px] text-[rgba(18,18,18,0.5)] flex-shrink-0">
                    {item.quantity} × €{item.price.toFixed(2)}
                  </p>
                </li>
              ))}
              {cart.items.length > 4 && (
                <p className="text-[11px] text-[rgba(18,18,18,0.45)] pl-[52px]">
                  + {cart.items.length - 4} të tjerë
                </p>
              )}
            </ul>

            <footer className="px-5 py-3 bg-[#FAFBFC] border-t border-[#F0F0F0] flex items-center justify-between gap-3 flex-wrap">
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${phoneDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold bg-[#25D366] text-white px-3 py-1.5 rounded-[6px] hover:bg-[#1FAE54] transition-colors"
                >
                  WhatsApp
                </a>
                <a
                  href={`tel:${cart.phone}`}
                  className="text-[11px] font-bold border border-[#E8E8E8] text-[#062F35] px-3 py-1.5 rounded-[6px] hover:bg-[#F5F5F5] transition-colors"
                >
                  Telefono
                </a>
              </div>
              <div className="flex gap-2 items-center">
                {!cart.contacted && !cart.recovered && (
                  <button
                    type="button"
                    onClick={() => mark(cart.id, { contacted: true })}
                    disabled={working === cart.id}
                    className="text-[11px] font-bold text-[#062F35] hover:text-[#FFC334] px-2 py-1 transition-colors"
                  >
                    Shëno si i kontaktuar
                  </button>
                )}
                {!cart.recovered && (
                  <button
                    type="button"
                    onClick={() => mark(cart.id, { recovered: true })}
                    disabled={working === cart.id}
                    className="text-[11px] font-bold text-[#2E7D32] hover:underline px-2 py-1 transition-colors"
                  >
                    Shëno si i rikuperuar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(cart.id)}
                  disabled={working === cart.id}
                  className="text-[11px] font-bold text-[rgba(18,18,18,0.4)] hover:text-[#C62828] px-2 py-1 transition-colors"
                >
                  Fshi
                </button>
              </div>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
