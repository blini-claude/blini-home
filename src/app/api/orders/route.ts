import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-settings";

function generateOrderNumber(): string {
  const prefix = "BH";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-()]/g, "");
}

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
    discountCode,
  } = body as {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    city: string;
    address: string;
    notes?: string;
    items: { productId: string; quantity: number; price: number }[];
    discountCode?: string;
  };

  if (!customerName?.trim() || !customerPhone?.trim() || !city?.trim() || !address?.trim()) {
    return NextResponse.json(
      { error: "Emri, telefoni, qyteti dhe adresa janë të detyrueshme" },
      { status: 400 }
    );
  }

  if (!items?.length) {
    return NextResponse.json({ error: "Shporta është bosh" }, { status: 400 });
  }

  const settings = await getSiteSettings();
  const normalizedPhone = normalizePhone(customerPhone);

  // Blacklist check
  const blacklisted = await db.blacklist.findUnique({
    where: { phone: normalizedPhone },
  });
  if (blacklisted) {
    return NextResponse.json(
      {
        error:
          "Për shkak të porosive të mëparshme të papranuara, nuk mund të pranojmë porosinë tuaj online. Ju lutem na kontaktoni në WhatsApp.",
      },
      { status: 403 }
    );
  }

  // Rate-limit: max N orders per phone per rolling 24h
  const maxPerDay = settings.maxOrdersPerPhonePerDay || 3;
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await db.order.count({
    where: {
      customerPhone: normalizedPhone,
      createdAt: { gte: dayAgo },
      status: { notIn: ["cancelled", "refunded"] },
    },
  });
  if (recentCount >= maxPerDay) {
    return NextResponse.json(
      {
        error: `Keni arritur kufirin e porosive për 24 orët e fundit (${maxPerDay}). Ju lutem na kontaktoni në WhatsApp për porosi shtesë.`,
      },
      { status: 429 }
    );
  }

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

  // Discount code
  let discountAmount = 0;
  let appliedDiscountCode: string | null = null;
  if (discountCode) {
    const code = discountCode.trim().toUpperCase();
    const discount = await db.newsletterDiscount.findUnique({ where: { code } });
    if (discount && !discount.used && discount.expiresAt > new Date()) {
      discountAmount = subtotal * (settings.newsletterDiscountPct / 100);
      appliedDiscountCode = code;
    }
  }

  const threshold = Number(settings.freeShippingThreshold) || 30;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const deliveryFee = discountedSubtotal >= threshold ? 0 : 2.5;
  const total = discountedSubtotal + deliveryFee;

  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerName: customerName.trim(),
      customerPhone: normalizedPhone,
      customerEmail: customerEmail?.trim() || null,
      city: city.trim(),
      address: address.trim(),
      notes: notes?.trim() || null,
      subtotal: discountedSubtotal,
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

  if (appliedDiscountCode) {
    await db.newsletterDiscount.update({
      where: { code: appliedDiscountCode },
      data: { used: true, usedAt: new Date() },
    });
  }

  return NextResponse.json({ order }, { status: 201 });
}
