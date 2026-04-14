import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
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
    weekRevenue,
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
    db.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: weekStart } },
    }),
    db.order.count(),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: { include: { product: true } } },
    }),
    db.syncLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 3,
    }),
  ]);

  return NextResponse.json({
    totalProducts,
    activeProducts,
    todayOrders,
    todayRevenue: Number(todayRevenue._sum.total || 0),
    pendingOrders,
    weekOrders,
    weekRevenue: Number(weekRevenue._sum.total || 0),
    totalOrders,
    recentOrders: recentOrders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      total: Number(o.total),
      items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
    })),
    syncLogs,
  });
}
