import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatsCard } from "@/components/admin/stats-card";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import Link from "next/link";

const GREETINGS = [
  "Mirëmëngjesi",
  "Ditë e mbarë",
  "Mirëdita",
  "Punë të mbarë",
  "Mirësevini përsëri",
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return GREETINGS[0];
  if (hour < 17) return GREETINGS[2];
  return GREETINGS[4];
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    totalProducts,
    activeProducts,
    todayOrders,
    todayRevenue,
    pendingOrders,
    weekOrders,
    weekRevenue,
    monthOrders,
    monthRevenue,
    lastMonthRevenue,
    totalOrders,
    totalRevenue,
    recentOrders,
    syncLogs,
    subscriberCount,
    newSubscribersThisMonth,
    customerCount,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { isActive: true } }),
    db.order.count({ where: { createdAt: { gte: todayStart } } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: todayStart } },
    }),
    db.order.count({ where: { status: "pending" } }),
    db.order.count({ where: { createdAt: { gte: weekStart } } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: weekStart } },
    }),
    db.order.count({ where: { createdAt: { gte: monthStart } } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: monthStart } },
    }),
    db.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),
    db.order.count(),
    db.order.aggregate({ _sum: { total: true } }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: true },
    }),
    db.syncLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 3,
    }),
    db.subscriber.count({ where: { isActive: true } }),
    db.subscriber.count({
      where: { isActive: true, createdAt: { gte: monthStart } },
    }),
    db.order
      .findMany({
        select: { customerPhone: true },
        distinct: ["customerPhone"],
      })
      .then((r) => r.length),
  ]);

  const todayRev = Number(todayRevenue._sum.total || 0);
  const weekRev = Number(weekRevenue._sum.total || 0);
  const monthRev = Number(monthRevenue._sum.total || 0);
  const lastMonthRev = Number(lastMonthRevenue._sum.total || 0);
  const totalRev = Number(totalRevenue._sum.total || 0);
  const monthGrowth =
    lastMonthRev > 0
      ? Math.round(((monthRev - lastMonthRev) / lastMonthRev) * 100)
      : 0;

  const greeting = getGreeting();

  return (
    <>
      <AdminHeader title="Dashboard" />
      <div className="p-6 md:p-8 space-y-6">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-[#062F35] to-[#0a4a54] rounded-[14px] p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#FFC334] rounded-full opacity-[0.07] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-[40%] w-[120px] h-[120px] bg-[#FFC334] rounded-full opacity-[0.05] translate-y-1/2" />
          <div className="relative z-10">
            <p className="text-[14px] text-[rgba(255,255,255,0.6)] font-medium">
              {greeting}! 👋
            </p>
            <h2 className="text-[24px] md:text-[28px] font-bold tracking-[-1px] mt-1">
              Ja ku jemi sot
            </h2>
            <div className="flex flex-wrap gap-6 mt-5">
              <div>
                <p className="text-[11px] text-[rgba(255,255,255,0.45)] uppercase tracking-wider font-semibold">
                  Porositë sot
                </p>
                <p className="text-[28px] font-bold tracking-[-1px] mt-0.5">
                  {todayOrders}
                </p>
              </div>
              <div className="w-px bg-[rgba(255,255,255,0.1)]" />
              <div>
                <p className="text-[11px] text-[rgba(255,255,255,0.45)] uppercase tracking-wider font-semibold">
                  Të ardhurat sot
                </p>
                <p className="text-[28px] font-bold tracking-[-1px] mt-0.5">
                  €{todayRev.toFixed(0)}
                </p>
              </div>
              <div className="w-px bg-[rgba(255,255,255,0.1)]" />
              <div>
                <p className="text-[11px] text-[rgba(255,255,255,0.45)] uppercase tracking-wider font-semibold">
                  Në pritje
                </p>
                <p className="text-[28px] font-bold tracking-[-1px] mt-0.5 text-[#FFC334]">
                  {pendingOrders}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Këtë javë"
            value={weekOrders}
            subtitle={`€${weekRev.toFixed(0)} qarkullim`}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            }
            iconBg="bg-[#E8F5F0]"
          />
          <StatsCard
            label="Këtë muaj"
            value={`€${monthRev.toFixed(0)}`}
            subtitle={`${monthOrders} porosi`}
            trend={
              monthGrowth !== 0
                ? { value: `${Math.abs(monthGrowth)}%`, positive: monthGrowth > 0 }
                : undefined
            }
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 18V6" />
              </svg>
            }
            iconBg="bg-[#FFF8E1]"
          />
          <StatsCard
            label="Klientë"
            value={customerCount}
            subtitle={`${subscriberCount} abonentë`}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            iconBg="bg-[#EDE7F6]"
          />
          <StatsCard
            label="Produkte"
            value={activeProducts}
            subtitle={`${totalProducts} gjithsej`}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              </svg>
            }
            iconBg="bg-[#E3F2FD]"
          />
        </div>

        {/* Revenue overview row */}
        <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5">
          <h3 className="text-[13px] font-bold text-[#062F35] mb-4">
            Pasqyrë e qarkullimit
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-[10px] bg-[#F8F9FA]">
              <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
                Sot
              </p>
              <p className="text-[22px] font-bold text-[#062F35] mt-1 tracking-[-0.5px]">
                €{todayRev.toFixed(0)}
              </p>
            </div>
            <div className="text-center p-4 rounded-[10px] bg-[#F8F9FA]">
              <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
                Këtë javë
              </p>
              <p className="text-[22px] font-bold text-[#062F35] mt-1 tracking-[-0.5px]">
                €{weekRev.toFixed(0)}
              </p>
            </div>
            <div className="text-center p-4 rounded-[10px] bg-[#F8F9FA]">
              <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
                Këtë muaj
              </p>
              <p className="text-[22px] font-bold text-[#062F35] mt-1 tracking-[-0.5px]">
                €{monthRev.toFixed(0)}
              </p>
            </div>
            <div className="text-center p-4 rounded-[10px] bg-[#FFF8E1]">
              <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
                Gjithsej
              </p>
              <p className="text-[22px] font-bold text-[#062F35] mt-1 tracking-[-0.5px]">
                €{totalRev.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent orders */}
          <div className="lg:col-span-2 bg-white rounded-[12px] border border-[#E8E8E8]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F0F0]">
              <h2 className="text-[14px] font-bold text-[#062F35]">
                Porositë e fundit
              </h2>
              <Link
                href="/admin/orders"
                className="text-[12px] font-semibold text-[#062F35] hover:text-[#FFC334] transition-colors"
              >
                Shiko të gjitha →
              </Link>
            </div>
            <div className="divide-y divide-[#F5F5F5]">
              {recentOrders.length === 0 ? (
                <p className="px-5 py-10 text-[13px] text-[rgba(18,18,18,0.4)] text-center">
                  Nuk ka porosi ende
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FAFBFC] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-[36px] h-[36px] rounded-full bg-[#F0F7F8] flex items-center justify-center text-[12px] font-bold text-[#062F35]">
                        {order.customerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#062F35]">
                          {order.orderNumber}
                        </p>
                        <p className="text-[11px] text-[rgba(18,18,18,0.4)] mt-0.5">
                          {order.customerName} · {order.city} ·{" "}
                          {order.items.length} artikuj
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <p className="text-[13px] font-bold text-[#062F35] min-w-[60px] text-right">
                        €{Number(order.total).toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Quick actions */}
            <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5">
              <h3 className="text-[13px] font-bold text-[#062F35] mb-3">
                Veprime të shpejta
              </h3>
              <div className="space-y-2">
                <Link
                  href="/admin/orders?status=pending"
                  className="flex items-center gap-3 p-3 rounded-[8px] bg-[#FFF8E1] hover:bg-[#FFF0C4] transition-colors"
                >
                  <div className="w-8 h-8 rounded-[6px] bg-[#FFC334] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[#062F35]">
                      {pendingOrders} porosi në pritje
                    </p>
                    <p className="text-[10px] text-[rgba(18,18,18,0.45)]">
                      Konfirmo ose anulo
                    </p>
                  </div>
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 p-3 rounded-[8px] bg-[#F0F7F8] hover:bg-[#E0EDF0] transition-colors"
                >
                  <div className="w-8 h-8 rounded-[6px] bg-[#062F35] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[#062F35]">
                      Cilësimet
                    </p>
                    <p className="text-[10px] text-[rgba(18,18,18,0.45)]">
                      Hero, WhatsApp, dërgesa
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Sync status */}
            <div className="bg-white rounded-[12px] border border-[#E8E8E8]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F0F0]">
                <h2 className="text-[13px] font-bold text-[#062F35]">
                  Sinkronizimi
                </h2>
                <Link
                  href="/admin/sync"
                  className="text-[11px] font-semibold text-[#062F35] hover:text-[#FFC334] transition-colors"
                >
                  Menaxho →
                </Link>
              </div>
              <div className="divide-y divide-[#F5F5F5]">
                {syncLogs.length === 0 ? (
                  <p className="px-5 py-8 text-[12px] text-[rgba(18,18,18,0.4)] text-center">
                    Nuk ka sinkronizime
                  </p>
                ) : (
                  syncLogs.map((log) => (
                    <div key={log.id} className="px-5 py-3.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-semibold text-[#062F35] capitalize">
                          {log.sourceStore}
                        </p>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-[4px] font-bold ${
                            log.status === "completed"
                              ? "bg-[#ECFDF5] text-[#059669]"
                              : log.status === "running"
                              ? "bg-[#EFF6FF] text-[#2563EB]"
                              : "bg-[#FEF2F2] text-[#DC2626]"
                          }`}
                        >
                          {log.status === "completed"
                            ? "Përfunduar"
                            : log.status === "running"
                            ? "Duke punuar"
                            : "Gabim"}
                        </span>
                      </div>
                      <p className="text-[10px] text-[rgba(18,18,18,0.4)] mt-1">
                        +{log.productsAdded} shtuar · {log.productsUpdated}{" "}
                        përditësuar
                        {log.errors.length > 0 &&
                          ` · ${log.errors.length} gabime`}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Subscribers mini card */}
            <div className="bg-gradient-to-br from-[#062F35] to-[#0a4a54] rounded-[12px] p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider font-semibold">
                    Abonentë
                  </p>
                  <p className="text-[28px] font-bold tracking-[-1px] mt-1">
                    {subscriberCount}
                  </p>
                  <p className="text-[11px] text-[rgba(255,255,255,0.5)] mt-1">
                    +{newSubscribersThisMonth} këtë muaj
                  </p>
                </div>
                <div className="w-[42px] h-[42px] rounded-[10px] bg-[rgba(255,195,52,0.15)] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFC334" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
              </div>
              <Link
                href="/admin/subscribers"
                className="block mt-4 text-center text-[11px] font-bold text-[#FFC334] bg-[rgba(255,195,52,0.1)] py-2 rounded-[6px] hover:bg-[rgba(255,195,52,0.2)] transition-colors"
              >
                Shiko listën →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
