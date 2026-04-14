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

  const data: any = {};
  if (body.price !== undefined) data.price = body.price;
  if (body.compareAtPrice !== undefined) data.compareAtPrice = body.compareAtPrice;
  if (body.description !== undefined) data.description = body.description;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured;

  const product = await db.product.update({ where: { id }, data });

  return NextResponse.json({
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
  });
}
