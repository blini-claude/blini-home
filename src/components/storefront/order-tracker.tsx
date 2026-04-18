"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type TrackedOrder = {
  orderNumber: string;
  status: string;
  customerName: string;
  city: string;
  address: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    productTitle: string;
    productSlug: string;
    productImage: string | null;
  }[];
};

const STATUS_STEPS: { key: string; label: string }[] = [
  { key: "pending", label: "Në pritje" },
  { key: "confirmed", label: "Konfirmuar" },
  { key: "shipped", label: "Dërguar" },
  { key: "delivered", label: "Dorëzuar" },
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Në pritje të konfirmimit",
  confirmed: "Konfirmuar — në përgatitje",
  shipped: "Në rrugë",
  delivered: "Dorëzuar",
  cancelled: "Anuluar",
  refunded: "Rimbursuar",
};

function statusIndex(status: string): number {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export function OrderTracker({ defaultOrderNumber = "" }: { defaultOrderNumber?: string }) {
  const [orderNumber, setOrderNumber] = useState(defaultOrderNumber);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gabim");
        return;
      }
      setOrder(data.order);
    } catch {
      setError("Gabim në rrjet. Provo përsëri.");
    } finally {
      setSubmitting(false);
    }
  }

  const isCancelled = order?.status === "cancelled" || order?.status === "refunded";
  const activeStep = order ? statusIndex(order.status) : 0;

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 md:p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-[#062F35] mb-1.5">
              Numri i porosisë
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="BH-XXXX-XXXX"
              required
              className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[14px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#062F35] mb-1.5">
              Telefoni
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+355 69 ..."
              required
              className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[14px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting || !orderNumber.trim() || !phone.trim()}
          className="w-full md:w-auto h-[44px] px-6 bg-[#062F35] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#0a4049] transition-colors cursor-pointer disabled:opacity-60"
        >
          {submitting ? "Duke kërkuar..." : "Ndiq porosinë"}
        </button>
        {error && (
          <p className="text-[13px] text-[#C62828] font-medium">{error}</p>
        )}
      </form>

      {order && (
        <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 md:p-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#F0F0F0]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.4)]">
                Numri i porosisë
              </p>
              <p className="text-[18px] font-bold text-[#062F35] font-mono mt-1">
                {order.orderNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.4)]">
                Data
              </p>
              <p className="text-[13px] text-[#062F35] mt-1">
                {new Date(order.createdAt).toLocaleDateString("sq-AL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {isCancelled ? (
            <div className="rounded-[8px] bg-[#FFF4F4] border border-[#FAD4D4] p-4">
              <p className="text-[13px] font-bold text-[#C62828]">
                {STATUS_LABELS[order.status] || order.status}
              </p>
              <p className="text-[12px] text-[rgba(18,18,18,0.6)] mt-1">
                Kontaktoni me ne në WhatsApp për më shumë informacion.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[13px] font-semibold text-[#062F35] mb-4">
                {STATUS_LABELS[order.status] || order.status}
              </p>
              <div className="flex items-center justify-between gap-2">
                {STATUS_STEPS.map((step, idx) => {
                  const isActive = idx <= activeStep;
                  const isCurrent = idx === activeStep;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 ${
                          isActive
                            ? "bg-[#062F35] text-white border-[#062F35]"
                            : "bg-white text-[rgba(18,18,18,0.3)] border-[#E8E8E8]"
                        } ${isCurrent ? "ring-4 ring-[#FFC334]/40" : ""}`}
                      >
                        {isActive ? "✓" : idx + 1}
                      </div>
                      <p
                        className={`text-[10px] md:text-[11px] font-semibold mt-2 text-center ${
                          isActive ? "text-[#062F35]" : "text-[rgba(18,18,18,0.4)]"
                        }`}
                      >
                        {step.label}
                      </p>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div
                          className={`hidden md:block absolute h-[2px] ${
                            idx < activeStep ? "bg-[#062F35]" : "bg-[#E8E8E8]"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.4)]">
              Produktet
            </p>
            {order.items.map((item) => (
              <Link
                key={item.id}
                href={`/produkt/${item.productSlug}`}
                className="flex items-center gap-3 rounded-[8px] hover:bg-[#FAFBFC] p-2 transition-colors"
              >
                <div className="w-14 h-14 relative bg-[#F5F5F5] rounded-[6px] overflow-hidden shrink-0">
                  {item.productImage && (
                    <Image
                      src={item.productImage}
                      alt={item.productTitle}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#062F35] truncate">
                    {item.productTitle}
                  </p>
                  <p className="text-[12px] text-[rgba(18,18,18,0.5)]">
                    {item.quantity} × €{item.price.toFixed(2)}
                  </p>
                </div>
                <p className="text-[13px] font-bold text-[#062F35]">
                  €{(item.quantity * item.price).toFixed(2)}
                </p>
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-[#F0F0F0] space-y-1.5 text-[13px]">
            <div className="flex justify-between text-[rgba(18,18,18,0.7)]">
              <span>Nëntotali</span>
              <span>€{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[rgba(18,18,18,0.7)]">
              <span>Dërgimi</span>
              <span>
                {order.deliveryFee === 0 ? "FALAS" : `€${order.deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-[#062F35] text-[14px] pt-2 border-t border-[#F0F0F0]">
              <span>Totali</span>
              <span>€{order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0F0F0] text-[12px] text-[rgba(18,18,18,0.55)] leading-relaxed">
            <p>
              <strong className="text-[#062F35]">Dërgimi tek:</strong>{" "}
              {order.customerName}, {order.address}, {order.city}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
