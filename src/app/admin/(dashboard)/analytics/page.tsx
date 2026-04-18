import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { RevenueChart } from "@/components/admin/revenue-chart";

export const dynamic = "force-dynamic";

type RangeKey = "7d" | "30d" | "90d";
const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: "7d", label: "7 ditët e fundit", days: 7 },
  { key: "30d", label: "30 ditët e fundit", days: 30 },
  { key: "90d", label: "90 ditët e fundit", days: 90 },
];

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: RangeKey }>;
}) {
  const { range = "30d" } = await searchParams;
  const rangeMeta = RANGES.find((r) => r.key === range) ?? RANGES[1];
  const now = new Date();
  const since = startOfDay(new Date(now.getTime() - rangeMeta.days * 86400_000));

  const [
    orders,
    prevOrders,
    topProducts,
    topCities,
    topSources,
    repeatCustomers,
    newCustomers,
  ] = await Promise.all([
    db.order.findMany({
      where: { createdAt: { gte: since } },
      select: {
        id: true,
        total: true,
        subtotal: true,
        createdAt: true,
        status: true,
        customerPhone: true,
        city: true,
        items: {
          select: {
            quantity: true,
            price: true,
            product: {
              select: { id: true, title: true, sourceStore: true, thumbnail: true, slug: true },
            },
          },
        },
      },
    }),
    db.order.findMany({
      where: {
        createdAt: {
          gte: new Date(since.getTime() - rangeMeta.days * 86400_000),
          lt: since,
        },
      },
      select: { total: true },
    }),
    db.orderItem.groupBy({
      by: ["productId"],
      where: { order: { createdAt: { gte: since } } },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    db.order.groupBy({
      by: ["city"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      _sum: { total: true },
      orderBy: { _count: { city: "desc" } },
      take: 8,
    }),
    db.orderItem.findMany({
      where: { order: { createdAt: { gte: since } } },
      select: { quantity: true, product: { select: { sourceStore: true } } },
    }),
    db.order.groupBy({
      by: ["customerPhone"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      having: { customerPhone: { _count: { gt: 1 } } },
    }),
    db.order.groupBy({
      by: ["customerPhone"],
      where: { createdAt: { gte: since } },
    }),
  ]);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const prevRevenue = prevOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const revenueGrowth =
    prevRevenue > 0
      ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100)
      : 0;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;
  const cancelRate = totalOrders ? (cancelledCount / totalOrders) * 100 : 0;

  const daily: Record<string, { revenue: number; orders: number }> = {};
  for (let i = 0; i < rangeMeta.days; i++) {
    const day = startOfDay(new Date(now.getTime() - i * 86400_000));
    daily[dayKey(day)] = { revenue: 0, orders: 0 };
  }
  for (const order of orders) {
    const key = dayKey(order.createdAt);
    if (!daily[key]) daily[key] = { revenue: 0, orders: 0 };
    daily[key].revenue += Number(order.total);
    daily[key].orders += 1;
  }
  const dailySeries = Object.entries(daily)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }));

  const productMap = new Map<string, { title: string; thumbnail: string | null; slug: string; source: string }>();
  for (const order of orders) {
    for (const item of order.items) {
      productMap.set(item.product.id, {
        title: item.product.title,
        thumbnail: item.product.thumbnail,
        slug: item.product.slug,
        source: item.product.sourceStore,
      });
    }
  }
  const topProductsEnriched = topProducts.map((p) => {
    const meta = productMap.get(p.productId);
    return {
      id: p.productId,
      title: meta?.title || "Produkt",
      thumbnail: meta?.thumbnail || null,
      slug: meta?.slug || "",
      source: meta?.source || "—",
      unitsSold: p._sum.quantity || 0,
      revenue: Number(p._sum.price || 0) * (p._sum.quantity || 0),
    };
  });

  const sourceBreakdown = new Map<string, number>();
  for (const item of topSources) {
    const key = item.product.sourceStore;
    sourceBreakdown.set(key, (sourceBreakdown.get(key) || 0) + item.quantity);
  }
  const sourceRows = Array.from(sourceBreakdown.entries())
    .map(([source, units]) => ({ source, units }))
    .sort((a, b) => b.units - a.units);
  const totalUnits = sourceRows.reduce((s, r) => s + r.units, 0) || 1;

  const uniqueCustomers = newCustomers.length;
  const returningCustomers = repeatCustomers.length;
  const repeatRate = uniqueCustomers
    ? (returningCustomers / uniqueCustomers) * 100
    : 0;

  return (
    <>
      <AdminHeader
        title="Analitika"
        subtitle={`Pasqyrë e thellë — ${rangeMeta.label.toLowerCase()}`}
      />
      <div className="p-6 md:p-8 space-y-6">
        {/* Range selector */}
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <a
              key={r.key}
              href={`/admin/analytics?range=${r.key}`}
              className={`px-4 py-2 text-[12px] font-bold rounded-[8px] border transition-colors ${
                r.key === range
                  ? "bg-[#062F35] text-white border-[#062F35]"
                  : "bg-white border-[#E8E8E8] text-[#062F35] hover:bg-[#F5F5F5]"
              }`}
            >
              {r.label}
            </a>
          ))}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Të ardhurat"
            value={`€${totalRevenue.toFixed(0)}`}
            trend={revenueGrowth}
          />
          <KpiCard
            label="Porosi"
            value={totalOrders.toString()}
            subtitle={`${cancelledCount} anuluar`}
          />
          <KpiCard
            label="Vlera mesatare"
            value={`€${avgOrderValue.toFixed(2)}`}
          />
          <KpiCard
            label="Klientë përsëritës"
            value={`${repeatRate.toFixed(0)}%`}
            subtitle={`${returningCustomers}/${uniqueCustomers} klientë`}
          />
        </div>

        {/* Revenue chart */}
        <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5">
          <h3 className="text-[13px] font-bold text-[#062F35] mb-4">
            Të ardhurat ditore
          </h3>
          <RevenueChart data={dailySeries} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top products */}
          <div className="bg-white rounded-[12px] border border-[#E8E8E8]">
            <div className="px-5 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[#062F35]">
                Produktet më të shitura
              </h3>
              <span className="text-[11px] text-[rgba(18,18,18,0.4)]">
                Top 10
              </span>
            </div>
            <div className="divide-y divide-[#F5F5F5]">
              {topProductsEnriched.length === 0 ? (
                <p className="px-5 py-10 text-[13px] text-[rgba(18,18,18,0.4)] text-center">
                  Nuk ka shitje
                </p>
              ) : (
                topProductsEnriched.map((p, i) => (
                  <div
                    key={p.id}
                    className="px-5 py-3 flex items-center gap-3 hover:bg-[#FAFBFC] transition-colors"
                  >
                    <span className="text-[11px] font-bold text-[rgba(18,18,18,0.3)] w-5 text-center">
                      {i + 1}
                    </span>
                    <div className="w-9 h-9 bg-[#F5F5F5] rounded-[6px] overflow-hidden shrink-0">
                      {p.thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#062F35] truncate">
                        {p.title}
                      </p>
                      <p className="text-[10px] text-[rgba(18,18,18,0.4)]">
                        {p.unitsSold} copë · {p.source}
                      </p>
                    </div>
                    <p className="text-[12px] font-bold text-[#062F35]">
                      €{p.revenue.toFixed(0)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top cities */}
          <div className="bg-white rounded-[12px] border border-[#E8E8E8]">
            <div className="px-5 py-4 border-b border-[#F0F0F0]">
              <h3 className="text-[13px] font-bold text-[#062F35]">
                Qytetet kryesore
              </h3>
            </div>
            <div className="divide-y divide-[#F5F5F5]">
              {topCities.length === 0 ? (
                <p className="px-5 py-10 text-[13px] text-[rgba(18,18,18,0.4)] text-center">
                  Nuk ka porosi
                </p>
              ) : (
                topCities.map((c) => {
                  const revenue = Number(c._sum.total || 0);
                  return (
                    <div
                      key={c.city}
                      className="px-5 py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[13px] font-semibold text-[#062F35]">
                          {c.city}
                        </p>
                        <p className="text-[10px] text-[rgba(18,18,18,0.4)]">
                          {c._count._all} porosi
                        </p>
                      </div>
                      <p className="text-[13px] font-bold text-[#062F35]">
                        €{revenue.toFixed(0)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Source breakdown + Cancel rate */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 lg:col-span-2">
            <h3 className="text-[13px] font-bold text-[#062F35] mb-4">
              Shpërndarja e shitjeve sipas burimit
            </h3>
            <div className="space-y-3">
              {sourceRows.length === 0 ? (
                <p className="text-[13px] text-[rgba(18,18,18,0.4)] text-center py-6">
                  Nuk ka të dhëna
                </p>
              ) : (
                sourceRows.map((r) => {
                  const pct = (r.units / totalUnits) * 100;
                  return (
                    <div key={r.source}>
                      <div className="flex items-center justify-between text-[12px] mb-1.5">
                        <span className="font-semibold text-[#062F35] capitalize">
                          {r.source}
                        </span>
                        <span className="text-[rgba(18,18,18,0.5)]">
                          {r.units} copë · {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#062F35] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5">
            <h3 className="text-[13px] font-bold text-[#062F35] mb-3">
              Shëndeti i porosive
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] text-[rgba(18,18,18,0.45)] uppercase tracking-wider font-semibold">
                  Shkalla e anulimit
                </p>
                <p className="text-[26px] font-bold text-[#062F35] mt-1 tracking-[-0.8px]">
                  {cancelRate.toFixed(1)}%
                </p>
                <p className="text-[11px] text-[rgba(18,18,18,0.45)] mt-0.5">
                  {cancelledCount} nga {totalOrders}
                </p>
              </div>
              <div className="pt-3 border-t border-[#F0F0F0]">
                <p className="text-[11px] text-[rgba(18,18,18,0.45)] uppercase tracking-wider font-semibold">
                  Rritja e të ardhurave
                </p>
                <p
                  className={`text-[26px] font-bold mt-1 tracking-[-0.8px] ${
                    revenueGrowth >= 0 ? "text-[#2E7D32]" : "text-[#C62828]"
                  }`}
                >
                  {revenueGrowth >= 0 ? "+" : ""}
                  {revenueGrowth}%
                </p>
                <p className="text-[11px] text-[rgba(18,18,18,0.45)] mt-0.5">
                  vs. periudha e kaluar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function KpiCard({
  label,
  value,
  subtitle,
  trend,
}: {
  label: string;
  value: string;
  subtitle?: string;
  trend?: number;
}) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5">
      <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
        {label}
      </p>
      <p className="text-[26px] font-bold text-[#062F35] mt-1 tracking-[-0.8px]">
        {value}
      </p>
      {(subtitle || trend !== undefined) && (
        <p className="text-[11px] text-[rgba(18,18,18,0.5)] mt-1">
          {subtitle}
          {trend !== undefined && (
            <span
              className={`ml-1 font-bold ${
                trend >= 0 ? "text-[#2E7D32]" : "text-[#C62828]"
              }`}
            >
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
          )}
        </p>
      )}
    </div>
  );
}
