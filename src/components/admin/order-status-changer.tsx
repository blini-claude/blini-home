"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  { key: "pending", label: "Në pritje", color: "#B8860B", bg: "#FFF8E1" },
  { key: "confirmed", label: "Konfirmuar", color: "#062F35", bg: "#F0F7F8" },
  { key: "delivering", label: "Në dërgesë", color: "#1E88E5", bg: "#E3F2FD" },
  { key: "delivered", label: "Dërguar", color: "#2E7D32", bg: "#E8F5E9" },
  { key: "cancelled", label: "Anuluar", color: "#C62828", bg: "#FFEBEE" },
];

export function OrderStatusChanger({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  async function setNew(next: string) {
    if (next === status) return;
    setUpdating(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setUpdating(false);
    if (res.ok) {
      setStatus(next);
      router.refresh();
    }
  }

  return (
    <div className="space-y-1.5">
      {STATUSES.map((s) => (
        <button
          key={s.key}
          type="button"
          disabled={updating}
          onClick={() => setNew(s.key)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-[12px] font-bold transition-colors disabled:opacity-50 ${
            status === s.key ? "border-2" : "border border-[#E8E8E8] hover:bg-[#F8F8F8]"
          }`}
          style={
            status === s.key
              ? { backgroundColor: s.bg, color: s.color, borderColor: s.color }
              : { color: "#062F35" }
          }
        >
          <span>{s.label}</span>
          {status === s.key && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
