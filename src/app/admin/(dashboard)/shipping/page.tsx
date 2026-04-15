import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { ShippingPanel } from "@/components/admin/shipping-panel";
import Link from "next/link";

export default async function AdminShippingPage() {
  const settings = await db.siteSettings.findUnique({ where: { id: "main" } });
  const hasApiKey = !!settings?.iziPostApiKey;

  const recentOrders = await db.order.findMany({
    where: { status: { in: ["confirmed", "delivering"] } },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { items: { include: { product: true } } },
  });

  const serialized = recentOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    city: o.city,
    address: o.address,
    total: Number(o.total),
    itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <>
      <AdminHeader
        title="Dërgesa"
        subtitle="Menaxho dërgesat me Izi Post"
        actions={
          <Link
            href="/admin/settings"
            className="text-[11px] font-bold text-[#062F35] bg-[#F5F5F5] hover:bg-[#F0F0F0] px-3 py-1.5 rounded-[6px] transition-colors"
          >
            Cilësimet API →
          </Link>
        }
      />
      <div className="p-6 md:p-8">
        <ShippingPanel orders={serialized} hasApiKey={hasApiKey} />
      </div>
    </>
  );
}
