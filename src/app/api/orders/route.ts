import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateOrderNumber(): string {
  const prefix = "BH";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { customerName, customerPhone, customerEmail, city, address, notes, items } = body as {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    city: string;
    address: string;
    notes?: string;
    items: { productId: string; quantity: number; price: number }[];
  };

  // Validate required fields
  if (!customerName?.trim() || !customerPhone?.trim() || !city?.trim() || !address?.trim()) {
    return NextResponse.json(
      { error: "Emri, telefoni, qyteti dhe adresa janë të detyrueshme" },
      { status: 400 }
    );
  }

  if (!items?.length) {
    return NextResponse.json({ error: "Shporta është bosh" }, { status: 400 });
  }

  // Verify products exist and prices match
  const productIds = items.map((i) => i.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== items.length) {
    return NextResponse.json(
      { error: "Disa produkte nuk janë më të disponueshme" },
      { status: 400 }
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 30 ? 0 : 2.5;
  const total = subtotal + deliveryFee;

  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim() || null,
      city: city.trim(),
      address: address.trim(),
      notes: notes?.trim() || null,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: "COD",
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

  return NextResponse.json({ order }, { status: 201 });
}
