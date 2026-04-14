import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatsCard } from "@/components/admin/stats-card";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const [
    totalProducts,
    activeProducts,
    todayOrders,
    todayRevenue,
    pendingOrders,
    weekOrders,
    totalOrders,
    recentOrders,
    syncLogs,
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
    db.order.count(),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: true },
    }),
    db.syncLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <>
      <AdminHeader title="Dashboard" />
      <div className="p-8 space-y-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            label="Today's Orders"
            value={todayOrders}
            subtitle={`${Number(todayRevenue._sum.total || 0).toFixed(0)} ALL revenue`}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m7.5 4.27 9 5.15" />
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            }
            iconBg="bg-green-50"
          />
          <StatsCard
            label="Pending Orders"
            value={pendingOrders}
            subtitle="Awaiting confirmation"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
            iconBg="bg-orange-50"
          />
          <StatsCard
            label="This Week"
            value={weekOrders}
            subtitle={`${totalOrders} total all time`}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            }
            iconBg="bg-blue-50"
          />
          <StatsCard
            label="Active Products"
            value={activeProducts}
            subtitle={`${totalProducts} total`}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              </svg>
            }
            iconBg="bg-purple-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent orders */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-text">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm text-text-secondary hover:text-text transition-colors">
                View all &rarr;
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <p className="px-6 py-8 text-sm text-text-secondary text-center">No orders yet</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-text">{order.orderNumber}</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {order.customerName} &middot; {order.city}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <OrderStatusBadge status={order.status} />
                      <p className="text-sm font-semibold text-text min-w-[70px] text-right">
                        {Number(order.total).toFixed(0)} ALL
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sync status */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-text">Sync Status</h2>
              <Link href="/admin/sync" className="text-sm text-text-secondary hover:text-text transition-colors">
                Manage &rarr;
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {syncLogs.length === 0 ? (
                <p className="px-6 py-8 text-sm text-text-secondary text-center">No syncs yet</p>
              ) : (
                syncLogs.map((log) => (
                  <div key={log.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-text capitalize">{log.sourceStore}</p>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                        log.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                        log.status === "running" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1.5">
                      +{log.productsAdded} added &middot; {log.productsUpdated} updated
                      {log.errors.length > 0 && ` \u00b7 ${log.errors.length} errors`}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {new Date(log.startedAt).toLocaleString("en-GB")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
