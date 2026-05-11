import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.productIds)) {
    return NextResponse.json({ error: "productIds[] required" }, { status: 400 });
  }

  const productIds: string[] = body.productIds.filter(
    (x: unknown): x is string => typeof x === "string"
  );

  const exists = await db.collection.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.$transaction([
    db.productCollection.deleteMany({ where: { collectionId: id } }),
    ...(productIds.length > 0
      ? [
          db.productCollection.createMany({
            data: productIds.map((productId) => ({ collectionId: id, productId })),
            skipDuplicates: true,
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ success: true, count: productIds.length });
}
