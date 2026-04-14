import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_STATUSES = ["pending", "confirmed", "delivering", "delivered", "cancelled"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body?.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await db.order.update({
    where: { id },
    data: { status: body.status },
  });

  return NextResponse.json({
    ...order,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
  });
}
