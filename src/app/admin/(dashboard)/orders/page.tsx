import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { OrdersTable } from "@/components/admin/orders-table";
import Link from "next/link";

const STATUSES = ["all", "pending", "confirmed", "delivering", "delivered", "cancelled"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page = "1" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page));
  const limit = 25;
  const offset = (pageNum - 1) * limit;

  const where: any = {};
  if (status && status !== "all") where.status = status;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: { items: { include: { product: true } } },
    }),
    db.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const serialized = orders.map((o) => ({
    ...o,
    subtotal: Number(o.subtotal),
    deliveryFee: Number(o.deliveryFee),
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
  }));

  return (
    <>
      <AdminHeader title="Orders" />
      <div className="p-6 space-y-4">
        {/* Status filter tabs */}
        <div className="flex gap-1 bg-white rounded-lg border border-[#e5e7eb] p-1 w-fit">
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/orders${s === "all" ? "" : `?status=${s}`}`}
              className={`px-3 py-1.5 text-xs font-medium rounded capitalize ${
                (s === "all" && !status) || s === status
                  ? "bg-[#121212] text-white"
                  : "text-[#707070] hover:text-[#121212]"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        <p className="text-sm text-[#707070]">{total} orders</p>

        <OrdersTable orders={serialized} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/orders?${status ? `status=${status}&` : ""}page=${p}`}
                className={`w-8 h-8 flex items-center justify-center text-xs font-medium rounded ${
                  p === pageNum ? "bg-[#121212] text-white" : "bg-white border border-[#e5e7eb] hover:bg-[#f8f9fa]"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
