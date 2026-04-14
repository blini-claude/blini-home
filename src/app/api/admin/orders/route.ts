import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const city = searchParams.get("city");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 25;
  const offset = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (city) where.city = city;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: { items: { include: { product: true } } },
    }),
    db.order.count({ where }),
  ]);

  return NextResponse.json({
    orders: orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      total: Number(o.total),
      items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
