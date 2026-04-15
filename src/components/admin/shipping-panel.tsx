"use client";

import { useState } from "react";
import Link from "next/link";

interface ShippingOrder {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

export function ShippingPanel({
  orders,
  hasApiKey,
}: {
  orders: ShippingOrder[];
  hasApiKey: boolean;
}) {
  const [registering, setRegistering] = useState<string | null>(null);
  const [registered, setRegistered] = useState<Set<string>>(new Set());

  async function handleRegister(orderId: string) {
    if (!hasApiKey) {
      alert("Ju lutem konfiguroni API key të Izi Post në Cilësimet para se të regjistroni dërgesa.");
      return;
    }
    setRegistering(orderId);
    // API call placeholder — actual integration pending API key
    try {
      const res = await fetch("/api/admin/shipping/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (res.ok) {
        setRegistered((prev) => new Set(prev).add(orderId));
      } else {
        const data = await res.json();
        alert(data.error || "Gabim gjatë regjistrimit");
      }
    } catch {
      alert("Gabim gjatë lidhjes me serverin");
    } finally {
      setRegistering(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* API Status */}
      <div
        className={`rounded-[12px] p-5 flex items-center gap-4 ${
          hasApiKey
            ? "bg-[#E8F5E9] border border-[#C8E6C9]"
            : "bg-[#FFF8E1] border border-[#FFE082]"
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            hasApiKey ? "bg-[#2E7D32]" : "bg-[#F9A825]"
          }`}
        >
          {hasApiKey ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-[#062F35]">
            {hasApiKey ? "Izi Post i lidhur" : "API Key mungon"}
          </p>
          <p className="text-[11px] text-[rgba(18,18,18,0.5)]">
            {hasApiKey
              ? "Mund të regjistroni dërgesa direkt nga ky panel"
              : "Shkoni te Cilësimet për të shtuar API key të Izi Post"}
          </p>
        </div>
        {!hasApiKey && (
          <Link
            href="/admin/settings"
            className="text-[11px] font-bold text-[#062F35] bg-white px-4 py-2 rounded-[8px] border border-[#E0E0E0] hover:bg-[#F5F5F5] transition-colors"
          >
            Konfiguro
          </Link>
        )}
      </div>

      {/* Orders ready for shipping */}
      <div>
        <h3 className="text-[13px] font-bold text-[#062F35] mb-3">
          Porosi gati për dërgesë ({orders.length})
        </h3>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-12 text-center">
            <p className="text-[13px] text-[rgba(18,18,18,0.4)]">
              Nuk ka porosi të konfirmuara për dërgesë
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isRegistered = registered.has(order.id);
              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-[12px] border p-5 transition-colors ${
                    isRegistered ? "border-[#C8E6C9] bg-[#FAFFF9]" : "border-[#E8E8E8]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-[36px] h-[36px] rounded-full bg-[#F0F7F8] flex items-center justify-center text-[11px] font-bold text-[#062F35]">
                        {order.customerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-bold text-[#062F35]">
                            {order.orderNumber}
                          </p>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] ${
                              order.status === "confirmed"
                                ? "bg-[#E3F2FD] text-[#1565C0]"
                                : "bg-[#EDE7F6] text-[#5E35B1]"
                            }`}
                          >
                            {order.status === "confirmed"
                              ? "Konfirmuar"
                              : "Në dërgesë"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[rgba(18,18,18,0.4)] mt-0.5">
                          {order.customerName} · {order.customerPhone}
                        </p>
                      </div>
                    </div>
                    <p className="text-[14px] font-bold text-[#062F35]">
                      €{order.total.toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-[11px] text-[rgba(18,18,18,0.45)]">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {order.city}, {order.address}
                    </span>
                    <span>{order.itemCount} artikuj</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-[10px] text-[rgba(18,18,18,0.3)]">
                      {new Date(order.createdAt).toLocaleDateString("sq-AL", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {isRegistered ? (
                      <span className="text-[11px] font-bold text-[#2E7D32] flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        Regjistruar në Izi Post
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegister(order.id)}
                        disabled={registering === order.id || !hasApiKey}
                        className="text-[11px] font-bold bg-[#062F35] text-white px-4 py-2 rounded-[6px] border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        {registering === order.id
                          ? "Duke regjistruar..."
                          : "Regjistro dërgesën"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
