import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const discounts = await db.discount.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    discounts.map((d) => ({
      ...d,
      value: Number(d.value),
      minOrderTotal: d.minOrderTotal != null ? Number(d.minOrderTotal) : null,
    }))
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.code || !body?.discountType || body?.value == null) {
    return NextResponse.json({ error: "code, discountType, value required" }, { status: 400 });
  }

  if (!["percentage", "fixed"].includes(body.discountType)) {
    return NextResponse.json({ error: "discountType must be percentage or fixed" }, { status: 400 });
  }

  const code = String(body.code).trim().toUpperCase();
  if (!/^[A-Z0-9_-]+$/.test(code)) {
    return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
  }

  const exists = await db.discount.findUnique({ where: { code } });
  if (exists) {
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }

  const discount = await db.discount.create({
    data: {
      code,
      description: body.description?.trim() || null,
      discountType: body.discountType,
      value: body.value,
      minOrderTotal: body.minOrderTotal ?? null,
      startsAt: body.startsAt ? new Date(body.startsAt) : new Date(),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      usageLimit: body.usageLimit ?? null,
      perCustomerLimit: body.perCustomerLimit ?? null,
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json(
    {
      ...discount,
      value: Number(discount.value),
      minOrderTotal: discount.minOrderTotal != null ? Number(discount.minOrderTotal) : null,
    },
    { status: 201 }
  );
}
