import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { AbandonedCartsList } from "@/components/admin/abandoned-carts-list";

export default async function AdminAbandonedCartsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "active" } = await searchParams;

  const where: Record<string, unknown> = {};
  if (tab === "active") {
    where.recovered = false;
    where.contacted = false;
  } else if (tab === "contacted") {
    where.contacted = true;
    where.recovered = false;
  } else if (tab === "recovered") {
    where.recovered = true;
  }

  const [carts, activeCount, contactedCount, recoveredCount] = await Promise.all([
    db.abandonedCart.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.abandonedCart.count({ where: { recovered: false, contacted: false } }),
    db.abandonedCart.count({ where: { recovered: false, contacted: true } }),
    db.abandonedCart.count({ where: { recovered: true } }),
  ]);

  const serialized = carts.map((c) => ({
    ...c,
    subtotal: Number(c.subtotal),
    items: (c.items as unknown) as Array<{
      productId: string;
      quantity: number;
      price: number;
      title: string;
      thumbnail: string | null;
    }>,
    createdAt: c.createdAt.toISOString(),
    contactedAt: c.contactedAt?.toISOString() || null,
    recoveredAt: c.recoveredAt?.toISOString() || null,
  }));

  const potentialRevenue = serialized.reduce((sum, c) => sum + c.subtotal, 0);

  return (
    <>
      <AdminHeader
        title="Karocat e braktisura"
        subtitle={`${activeCount} aktive · €${potentialRevenue.toFixed(0)} potenciale`}
      />
      <div className="p-6 md:p-8 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-[10px] border border-[#E8E8E8] p-1 w-fit">
          <Tab href="?tab=active" label="Aktive" count={activeCount} active={tab === "active"} />
          <Tab href="?tab=contacted" label="Të kontaktuara" count={contactedCount} active={tab === "contacted"} />
          <Tab href="?tab=recovered" label="Të rikuperuara" count={recoveredCount} active={tab === "recovered"} />
        </div>

        <AbandonedCartsList carts={serialized} />
      </div>
    </>
  );
}

function Tab({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <a
      href={href}
      className={`px-3.5 py-1.5 text-[11px] font-bold rounded-[6px] transition-colors flex items-center gap-1.5 ${
        active
          ? "bg-[#062F35] text-white"
          : "text-[rgba(18,18,18,0.5)] hover:text-[#062F35] hover:bg-[#F5F5F5]"
      }`}
    >
      {label}
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-[4px] ${
          active ? "bg-white/20 text-white" : "bg-[#F5F5F5] text-[rgba(18,18,18,0.45)]"
        }`}
      >
        {count}
      </span>
    </a>
  );
}
