import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-()]/g, "");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Kërkesë e pavlefshme" }, { status: 400 });
  }

  const { orderNumber, phone } = body as { orderNumber?: string; phone?: string };

  if (!orderNumber?.trim() || !phone?.trim()) {
    return NextResponse.json(
      { error: "Numri i porosisë dhe telefoni janë të detyrueshëm" },
      { status: 400 }
    );
  }

  const normalizedPhone = normalizePhone(phone);
  const trimmedNumber = orderNumber.trim().toUpperCase();

  const order = await db.order.findFirst({
    where: {
      orderNumber: trimmedNumber,
      customerPhone: normalizedPhone,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Nuk u gjet asnjë porosi me këto të dhëna. Kontrolloni numrin dhe telefonin." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      city: order.city,
      address: order.address,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        price: Number(i.price),
        productTitle: i.product.title,
        productSlug: i.product.slug,
        productImage: i.product.images[0] || null,
      })),
    },
  });
}
