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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Order</th>
            <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Customer</th>
            <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">City</th>
            <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Total</th>
            <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Status</th>
            <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Date</th>
            <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => {
            const currentIdx = STATUS_FLOW.indexOf(order.status);
            const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1
              ? STATUS_FLOW[currentIdx + 1]
              : null;

            return (
              <Fragment key={order.id}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <td className="px-6 py-4 font-semibold text-text">{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text">{order.customerName}</div>
                    <div className="text-xs text-text-secondary mt-0.5">{order.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{order.city}</td>
                  <td className="px-6 py-4 font-semibold text-text">{order.total.toFixed(0)} ALL</td>
                  <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-6 py-4 text-text-secondary">
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {nextStatus && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(order.id, nextStatus);
                          }}
                          disabled={updating === order.id}
                          className="text-xs bg-text text-white px-3 py-1.5 rounded-[5px] font-medium hover:bg-text/80 disabled:opacity-50 cursor-pointer transition-colors"
                        >
                          {updating === order.id ? "..." : `\u2192 ${nextStatus}`}
                        </button>
                      )}
                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(order.id, "cancelled");
                          }}
                          disabled={updating === order.id}
                          className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === order.id && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Order Items</p>
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-text">{item.product.title} &times; {item.quantity}</span>
                            <span className="font-medium text-text">{(item.price * item.quantity).toFixed(0)} ALL</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      {orders.length === 0 && (
        <p className="text-center py-12 text-sm text-text-secondary">No orders found</p>
      )}
    </div>
  );
}
