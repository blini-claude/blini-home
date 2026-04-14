import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { CustomersTable } from "@/components/admin/customers-table";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const where: any = {};
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

  const byPhone = new Map<string, {
    name: string;
    phone: string;
    city: string;
    orderCount: number;
    totalSpent: number;
    lastOrder: string;
  }>();

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

  const customers = Array.from(byPhone.values())
    .sort((a, b) => b.orderCount - a.orderCount);

  return (
    <>
      <AdminHeader title="Customers" />
      <div className="p-6 space-y-4">
        <form action="/admin/customers" className="max-w-xs">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name or phone..."
            className="w-full h-9 px-3 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7]"
          />
        </form>

        <p className="text-sm text-[#707070]">{customers.length} customers</p>

        <CustomersTable customers={customers} />
      </div>
    </>
  );
}
