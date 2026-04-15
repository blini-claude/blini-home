import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { CustomersTable } from "@/components/admin/customers-table";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search } },
    ];
  }

  const orders = await db.order.findMany({
    where,
    select: {
      customerName: true,
      customerPhone: true,
      city: true,
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const byPhone = new Map<
    string,
    {
      name: string;
      phone: string;
      city: string;
      orderCount: number;
      totalSpent: number;
      lastOrder: string;
    }
  >();

  for (const order of orders) {
    const existing = byPhone.get(order.customerPhone);
    if (existing) {
      existing.orderCount++;
      existing.totalSpent += Number(order.total);
    } else {
      byPhone.set(order.customerPhone, {
        name: order.customerName,
        phone: order.customerPhone,
        city: order.city,
        orderCount: 1,
        totalSpent: Number(order.total),
        lastOrder: order.createdAt.toISOString(),
      });
    }
  }

  const customers = Array.from(byPhone.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <>
      <AdminHeader
        title="Klientët"
        subtitle={`${customers.length} klientë · €${totalSpent.toFixed(0)} gjithsej`}
      />
      <div className="p-6 md:p-8 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 text-center">
            <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
              Klientë
            </p>
            <p className="text-[28px] font-bold text-[#062F35] mt-1 tracking-[-1px]">
              {customers.length}
            </p>
          </div>
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 text-center">
            <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
              Porosi gjithsej
            </p>
            <p className="text-[28px] font-bold text-[#062F35] mt-1 tracking-[-1px]">
              {orders.length}
            </p>
          </div>
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 text-center">
            <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
              Shpenzim mesatar
            </p>
            <p className="text-[28px] font-bold text-[#062F35] mt-1 tracking-[-1px]">
              €{customers.length > 0 ? (totalSpent / customers.length).toFixed(0) : 0}
            </p>
          </div>
        </div>

        {/* Search */}
        <form action="/admin/customers" className="max-w-xs">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(18,18,18,0.3)]"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Kërko me emër ose telefon..."
              className="w-full h-[40px] pl-10 pr-4 border-2 border-[#E8E8E8] rounded-[8px] text-[12px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors bg-white"
            />
          </div>
        </form>

        <CustomersTable customers={customers} />
      </div>
    </>
  );
}
