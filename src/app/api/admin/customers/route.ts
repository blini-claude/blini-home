import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") || "";

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
    lastOrder: Date;
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
        lastOrder: order.createdAt,
      });
    }
  }

  const customers = Array.from(byPhone.values())
    .sort((a, b) => b.orderCount - a.orderCount);

  return NextResponse.json(customers);
}
