import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const discount = await db.discount.findUnique({ where: { id } });
  if (!discount) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    ...discount,
    value: Number(discount.value),
    minOrderTotal: discount.minOrderTotal != null ? Number(discount.minOrderTotal) : null,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.description !== undefined) data.description = body.description;
  if (body.discountType !== undefined) {
    if (!["percentage", "fixed"].includes(body.discountType)) {
      return NextResponse.json({ error: "discountType must be percentage or fixed" }, { status: 400 });
    }
    data.discountType = body.discountType;
  }
  if (body.value !== undefined) data.value = body.value;
  if (body.minOrderTotal !== undefined) data.minOrderTotal = body.minOrderTotal;
  if (body.startsAt !== undefined) data.startsAt = body.startsAt ? new Date(body.startsAt) : new Date();
  if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  if (body.usageLimit !== undefined) data.usageLimit = body.usageLimit;
  if (body.perCustomerLimit !== undefined) data.perCustomerLimit = body.perCustomerLimit;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const discount = await db.discount.update({ where: { id }, data });
  return NextResponse.json({
    ...discount,
    value: Number(discount.value),
    minOrderTotal: discount.minOrderTotal != null ? Number(discount.minOrderTotal) : null,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.discount.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
