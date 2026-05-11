import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateOrderNumber(): string {
  const prefix = "BH";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-()]/g, "");
}

// Admin-only manual order creation. Used when a customer orders via phone or
// WhatsApp and the operator enters the order on their behalf. Skips the
// blacklist + per-day rate limit that apply to public orders.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    customerName,
    customerPhone,
    customerEmail,
    city,
    address,
    notes,
    items,
    discountAmount,
    deliveryFee,
    paymentMethod = "COD",
    status = "confirmed",
  } = body as {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    city: string;
    address: string;
    notes?: string;
    items: { productId: string; quantity: number; price: number }[];
    discountAmount?: number;
    deliveryFee?: number;
    paymentMethod?: string;
    status?: string;
  };

  if (!customerName?.trim() || !customerPhone?.trim() || !city?.trim() || !address?.trim()) {
    return NextResponse.json(
      { error: "Emri, telefoni, qyteti dhe adresa janë të detyrueshme" },
      { status: 400 }
    );
  }

  if (!items?.length) {
    return NextResponse.json({ error: "Asnjë artikull" }, { status: 400 });
  }

  const productIds = items.map((i) => i.productId);
  const products = await db.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== items.length) {
    return NextResponse.json({ error: "Disa produkte nuk u gjetën" }, { status: 400 });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const finalDiscount = Math.max(0, Math.min(subtotal, discountAmount ?? 0));
  const discountedSubtotal = Math.max(0, subtotal - finalDiscount);
  const fee = deliveryFee ?? (discountedSubtotal >= 30 ? 0 : 2.5);
  const total = discountedSubtotal + fee;

  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerName: customerName.trim(),
      customerPhone: normalizePhone(customerPhone),
      customerEmail: customerEmail?.trim() || null,
      city: city.trim(),
      address: address.trim(),
      notes: notes?.trim() || null,
      subtotal: discountedSubtotal,
      deliveryFee: fee,
      total,
      paymentMethod,
      status,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json(
    {
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      total: Number(order.total),
    },
    { status: 201 }
  );
}

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
