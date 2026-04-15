"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  city: string;
  address: string;
  notes: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: { title: string; thumbnail: string | null };
  }[];
}

const STATUS_FLOW = ["pending", "confirmed", "delivering", "delivered"];
const STATUS_LABELS: Record<string, string> = {
  confirmed: "Konfirmo",
  delivering: "Në dërgesë",
  delivered: "Dërguar",
};

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdating(orderId);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(null);
    router.refresh();
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(18,18,18,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        </div>
        <p className="text-[13px] text-[rgba(18,18,18,0.4)]">
          Nuk u gjetën porosi
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#F0F0F0]">
            <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Porosia
            </th>
            <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Klienti
            </th>
            <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Qyteti
            </th>
            <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Totali
            </th>
            <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Statusi
            </th>
            <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Data
            </th>
            <th className="text-right text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Veprime
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const currentIdx = STATUS_FLOW.indexOf(order.status);
            const nextStatus =
              currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1
                ? STATUS_FLOW[currentIdx + 1]
                : null;
            const isExpanded = expandedId === order.id;

            return (
              <Fragment key={order.id}>
                <tr
                  className={`border-b border-[#F8F8F8] cursor-pointer transition-colors ${
                    isExpanded ? "bg-[#F8F9FA]" : "hover:bg-[#FAFBFC]"
                  }`}
                  onClick={() =>
                    setExpandedId(isExpanded ? null : order.id)
                  }
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[32px] h-[32px] rounded-full bg-[#F0F7F8] flex items-center justify-center text-[10px] font-bold text-[#062F35]">
                        {order.customerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <span className="text-[13px] font-bold text-[#062F35]">
                        {order.orderNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-[12px] font-semibold text-[#062F35]">
                      {order.customerName}
                    </p>
                    <p className="text-[11px] text-[rgba(18,18,18,0.4)] mt-0.5">
                      {order.customerPhone}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-[rgba(18,18,18,0.5)]">
                    {order.city}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-bold text-[#062F35]">
                      €{order.total.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-[rgba(18,18,18,0.4)]">
                    {new Date(order.createdAt).toLocaleDateString("sq-AL", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div
                      className="flex items-center gap-2 justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {nextStatus && (
                        <button
                          onClick={() => updateStatus(order.id, nextStatus)}
                          disabled={updating === order.id}
                          className="text-[10px] bg-[#062F35] text-white px-3 py-1.5 rounded-[6px] font-bold hover:bg-[#0a4a54] disabled:opacity-50 cursor-pointer transition-colors"
                        >
                          {updating === order.id
                            ? "..."
                            : `→ ${STATUS_LABELS[nextStatus] || nextStatus}`}
                        </button>
                      )}
                      {order.status !== "cancelled" &&
                        order.status !== "delivered" && (
                          <button
                            onClick={() => updateStatus(order.id, "cancelled")}
                            disabled={updating === order.id}
                            className="text-[10px] text-[#C62828] hover:text-[#E53935] font-bold cursor-pointer transition-colors"
                          >
                            Anulo
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-5 bg-[#FAFBFC] border-b border-[#E8E8E8]"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Order items */}
                        <div className="md:col-span-2">
                          <p className="text-[10px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider mb-3">
                            Artikujt e porosisë
                          </p>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between bg-white rounded-[8px] px-4 py-2.5 border border-[#F0F0F0]"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] font-medium text-[#062F35]">
                                    {item.product.title}
                                  </span>
                                  <span className="text-[11px] text-[rgba(18,18,18,0.35)]">
                                    × {item.quantity}
                                  </span>
                                </div>
                                <span className="text-[12px] font-bold text-[#062F35]">
                                  €{(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          {/* Totals */}
                          <div className="mt-3 pt-3 border-t border-[#F0F0F0] space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[rgba(18,18,18,0.45)]">
                                Nëntotali
                              </span>
                              <span className="font-semibold text-[#062F35]">
                                €{order.subtotal.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[rgba(18,18,18,0.45)]">
                                Dërgesa
                              </span>
                              <span className="font-semibold text-[#062F35]">
                                €{order.deliveryFee.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-[13px] pt-1">
                              <span className="font-bold text-[#062F35]">
                                Totali
                              </span>
                              <span className="font-bold text-[#062F35]">
                                €{order.total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Customer info */}
                        <div>
                          <p className="text-[10px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider mb-3">
                            Detajet e klientit
                          </p>
                          <div className="bg-white rounded-[8px] border border-[#F0F0F0] p-4 space-y-3">
                            <div>
                              <p className="text-[10px] text-[rgba(18,18,18,0.35)] uppercase tracking-wider">
                                Emri
                              </p>
                              <p className="text-[12px] font-semibold text-[#062F35] mt-0.5">
                                {order.customerName}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[rgba(18,18,18,0.35)] uppercase tracking-wider">
                                Telefoni
                              </p>
                              <p className="text-[12px] font-semibold text-[#062F35] mt-0.5">
                                {order.customerPhone}
                              </p>
                            </div>
                            {order.customerEmail && (
                              <div>
                                <p className="text-[10px] text-[rgba(18,18,18,0.35)] uppercase tracking-wider">
                                  Email
                                </p>
                                <p className="text-[12px] font-semibold text-[#062F35] mt-0.5">
                                  {order.customerEmail}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-[10px] text-[rgba(18,18,18,0.35)] uppercase tracking-wider">
                                Adresa
                              </p>
                              <p className="text-[12px] font-semibold text-[#062F35] mt-0.5">
                                {order.address}, {order.city}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[rgba(18,18,18,0.35)] uppercase tracking-wider">
                                Pagesa
                              </p>
                              <p className="text-[12px] font-semibold text-[#062F35] mt-0.5">
                                {order.paymentMethod === "COD"
                                  ? "Para në dorë"
                                  : order.paymentMethod}
                              </p>
                            </div>
                            {order.notes && (
                              <div>
                                <p className="text-[10px] text-[rgba(18,18,18,0.35)] uppercase tracking-wider">
                                  Shënime
                                </p>
                                <p className="text-[12px] text-[#062F35] mt-0.5 italic">
                                  {order.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
