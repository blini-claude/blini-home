"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  city: string;
  total: number;
  createdAt: string;
  items: { id: string; quantity: number; price: number; product: { title: string } }[];
}

const STATUS_FLOW = ["pending", "confirmed", "delivering", "delivered"];

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

  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Order</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Customer</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">City</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Total</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Status</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Date</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb]">
          {orders.map((order) => {
            const currentIdx = STATUS_FLOW.indexOf(order.status);
            const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1
              ? STATUS_FLOW[currentIdx + 1]
              : null;

            return (
              <>
                <tr
                  key={order.id}
                  className="hover:bg-[#f8f9fa] cursor-pointer"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div>{order.customerName}</div>
                    <div className="text-xs text-[#707070]">{order.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3">{order.city}</td>
                  <td className="px-4 py-3 font-semibold">€{order.total.toFixed(2)}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-[#707070]">
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3">
                    {nextStatus && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(order.id, nextStatus);
                        }}
                        disabled={updating === order.id}
                        className="text-xs bg-[#121212] text-white px-3 py-1.5 rounded font-medium hover:bg-[#121212]/80 disabled:opacity-50"
                      >
                        {updating === order.id ? "..." : `→ ${nextStatus}`}
                      </button>
                    )}
                    {order.status !== "cancelled" && order.status !== "delivered" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(order.id, "cancelled");
                        }}
                        disabled={updating === order.id}
                        className="text-xs text-red-600 hover:text-red-800 ml-2 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === order.id && (
                  <tr key={`${order.id}-detail`}>
                    <td colSpan={7} className="px-4 py-3 bg-[#f8f9fa]">
                      <div className="text-xs space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>{item.product.title} × {item.quantity}</span>
                            <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
      {orders.length === 0 && (
        <p className="text-center py-8 text-sm text-[#707070]">No orders found</p>
      )}
    </div>
  );
}
