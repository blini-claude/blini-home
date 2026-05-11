import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
  if (body.contacted === true) {
    data.contacted = true;
    data.contactedAt = new Date();
  } else if (body.contacted === false) {
    data.contacted = false;
    data.contactedAt = null;
  }
  if (body.recovered === true) {
    data.recovered = true;
    data.recoveredAt = new Date();
  } else if (body.recovered === false) {
    data.recovered = false;
    data.recoveredAt = null;
  }

  const cart = await db.abandonedCart.update({ where: { id }, data });
  return NextResponse.json({
    ...cart,
    subtotal: Number(cart.subtotal),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.abandonedCart.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
