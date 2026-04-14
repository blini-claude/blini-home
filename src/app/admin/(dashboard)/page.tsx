import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatsCard } from "@/components/admin/stats-card";
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
      <div className="p-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Today's Orders"
            value={todayOrders}
            subtitle={`€${Number(todayRevenue._sum.total || 0).toFixed(2)} revenue`}
          />
          <StatsCard
            label="Pending Orders"
            value={pendingOrders}
            subtitle="Awaiting confirmation"
          />
          <StatsCard
            label="This Week"
            value={weekOrders}
            subtitle={`${totalOrders} total all time`}
          />
          <StatsCard
            label="Active Products"
            value={activeProducts}
            subtitle={`${totalProducts} total`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent orders */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#e5e7eb]">
            <div className="flex items-center justify-between p-4 border-b border-[#e5e7eb]">
              <h2 className="font-semibold text-[#121212]">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm text-[#6767A7] hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-[#e5e7eb]">
              {recentOrders.length === 0 ? (
                <p className="p-4 text-sm text-[#707070]">No orders yet</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-[#707070]">
                        {order.customerName} · {order.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">€{Number(order.total).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        order.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                        order.status === "delivering" ? "bg-purple-100 text-purple-700" :
                        order.status === "delivered" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sync status */}
          <div className="bg-white rounded-lg border border-[#e5e7eb]">
            <div className="flex items-center justify-between p-4 border-b border-[#e5e7eb]">
              <h2 className="font-semibold text-[#121212]">Sync Status</h2>
              <Link href="/admin/sync" className="text-sm text-[#6767A7] hover:underline">
                Manage
              </Link>
            </div>
            <div className="divide-y divide-[#e5e7eb]">
              {syncLogs.length === 0 ? (
                <p className="p-4 text-sm text-[#707070]">No syncs yet</p>
              ) : (
                syncLogs.map((log) => (
                  <div key={log.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium capitalize">{log.sourceStore}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        log.status === "completed" ? "bg-green-100 text-green-700" :
                        log.status === "running" ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#707070] mt-1">
                      +{log.productsAdded} added · {log.productsUpdated} updated
                      {log.errors.length > 0 && ` · ${log.errors.length} errors`}
                    </p>
                    <p className="text-xs text-[#707070]">
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
