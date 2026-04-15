import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { OrdersTable } from "@/components/admin/orders-table";
import Link from "next/link";

const STATUSES = [
  { value: "all", label: "Të gjitha" },
  { value: "pending", label: "Në pritje" },
  { value: "confirmed", label: "Konfirmuar" },
  { value: "delivering", label: "Në dërgesë" },
  { value: "delivered", label: "Dërguar" },
  { value: "cancelled", label: "Anuluar" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; search?: string }>;
}) {
  const { status, page = "1", search } = await searchParams;
  const pageNum = Math.max(1, parseInt(page));
  const limit = 25;
  const offset = (pageNum - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search } },
    ];
  }

  const [orders, total, statusCounts] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: { items: { include: { product: true } } },
    }),
    db.order.count({ where }),
    Promise.all(
      STATUSES.filter((s) => s.value !== "all").map(async (s) => ({
        status: s.value,
        count: await db.order.count({ where: { status: s.value } }),
      }))
    ),
  ]);

  const totalPages = Math.ceil(total / limit);
  const totalAll = statusCounts.reduce((sum, s) => sum + s.count, 0);

  const serialized = orders.map((o) => ({
    ...o,
    subtotal: Number(o.subtotal),
    deliveryFee: Number(o.deliveryFee),
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items.map((i) => ({
      ...i,
      price: Number(i.price),
      product: { title: i.product.title, thumbnail: i.product.thumbnail },
    })),
  }));

  const baseQuery = [
    status && status !== "all" ? `status=${status}` : "",
    search ? `search=${search}` : "",
  ].filter(Boolean).join("&");

  return (
    <>
      <AdminHeader title="Porositë" subtitle={`${total} porosi`} />
      <div className="p-6 md:p-8 space-y-5">
        {/* Status tabs with counts */}
        <div className="flex gap-1 bg-white rounded-[10px] border border-[#E8E8E8] p-1 w-fit flex-wrap">
          {STATUSES.map((s) => {
            const count =
              s.value === "all"
                ? totalAll
                : statusCounts.find((sc) => sc.status === s.value)?.count || 0;
            return (
              <Link
                key={s.value}
                href={`/admin/orders${s.value === "all" ? "" : `?status=${s.value}`}${search ? `${s.value === "all" ? "?" : "&"}search=${search}` : ""}`}
                className={`px-3.5 py-1.5 text-[11px] font-bold rounded-[6px] transition-colors flex items-center gap-1.5 ${
                  (s.value === "all" && !status) || s.value === status
                    ? "bg-[#062F35] text-white"
                    : "text-[rgba(18,18,18,0.5)] hover:text-[#062F35] hover:bg-[#F5F5F5]"
                }`}
              >
                {s.label}
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] ${
                    (s.value === "all" && !status) || s.value === status
                      ? "bg-[rgba(255,255,255,0.2)]"
                      : "bg-[#F5F5F5]"
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Search */}
        <form action="/admin/orders" className="max-w-xs">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(18,18,18,0.3)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Kërko me nr. porosie, emër ose telefon..."
              className="w-full h-[40px] pl-10 pr-4 border-2 border-[#E8E8E8] rounded-[8px] text-[12px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors bg-white"
            />
            {status && status !== "all" && (
              <input type="hidden" name="status" value={status} />
            )}
          </div>
        </form>

        <OrdersTable orders={serialized} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {pageNum > 1 && (
              <Link
                href={`/admin/orders?${baseQuery}${baseQuery ? "&" : ""}page=${pageNum - 1}`}
                className="w-9 h-9 flex items-center justify-center text-[12px] font-bold rounded-[8px] bg-white border border-[#E8E8E8] hover:bg-[#F5F5F5] text-[#062F35]"
              >
                ‹
              </Link>
            )}
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(
              (p) => (
                <Link
                  key={p}
                  href={`/admin/orders?${baseQuery}${baseQuery ? "&" : ""}page=${p}`}
                  className={`w-9 h-9 flex items-center justify-center text-[12px] font-bold rounded-[8px] ${
                    p === pageNum
                      ? "bg-[#062F35] text-white"
                      : "bg-white border border-[#E8E8E8] hover:bg-[#F5F5F5] text-[#062F35]"
                  }`}
                >
                  {p}
                </Link>
              )
            )}
            {pageNum < totalPages && (
              <Link
                href={`/admin/orders?${baseQuery}${baseQuery ? "&" : ""}page=${pageNum + 1}`}
                className="w-9 h-9 flex items-center justify-center text-[12px] font-bold rounded-[8px] bg-white border border-[#E8E8E8] hover:bg-[#F5F5F5] text-[#062F35]"
              >
                ›
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
