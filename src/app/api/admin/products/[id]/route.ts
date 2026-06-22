import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncProductToIndex, removeProductFromIndex } from "@/lib/meilisearch";
import { isAdmin } from "@/lib/admin-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: {
      collections: {
        select: { collectionId: true },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    collectionIds: product.collections.map((c) => c.collectionId),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    syncedAt: product.syncedAt.toISOString(),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.price !== undefined) data.price = body.price;
  if (body.compareAtPrice !== undefined) data.compareAtPrice = body.compareAtPrice;
  if (body.description !== undefined) data.description = body.description;
  if (body.metaTitle !== undefined) data.metaTitle = body.metaTitle || null;
  if (body.metaDescription !== undefined) data.metaDescription = body.metaDescription || null;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured;
  if (body.category !== undefined) data.category = body.category;
  if (body.tags !== undefined) data.tags = body.tags;
  if (body.stock !== undefined) data.stock = body.stock;
  if (body.images !== undefined) data.images = body.images;
  if (body.thumbnail !== undefined) data.thumbnail = body.thumbnail;

  // Optionally rewire collections: clients send `collectionIds: string[]`
  // and we replace the ProductCollection rows in a transaction.
  if (Array.isArray(body.collectionIds)) {
    const next: string[] = body.collectionIds.filter((x: unknown): x is string => typeof x === "string");
    await db.$transaction([
      db.productCollection.deleteMany({ where: { productId: id } }),
      ...(next.length > 0
        ? [
            db.productCollection.createMany({
              data: next.map((collectionId) => ({ productId: id, collectionId })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);
  }

  const product = await db.product.update({
    where: { id },
    data,
    include: {
      collections: { select: { collectionId: true } },
    },
  });

  await syncProductToIndex(product.id);

  return NextResponse.json({
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    collectionIds: product.collections.map((c) => c.collectionId),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.product.delete({ where: { id } });
  await removeProductFromIndex(id);
  return NextResponse.json({ success: true });
}
