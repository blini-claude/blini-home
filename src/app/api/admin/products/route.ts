import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || `produkt-${crypto.randomBytes(3).toString("hex")}`;
  let slug = root;
  let n = 1;
  // Short loop — collisions are rare and bounded.
  while (await db.product.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return slug;
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "Titulli është i detyrueshëm" }, { status: 400 });
  }
  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Çmim i pavlefshëm" }, { status: 400 });
  }

  const slug = await uniqueSlug(body.slug ? slugify(body.slug) : slugify(body.title));
  const collectionIds: string[] = Array.isArray(body.collectionIds)
    ? body.collectionIds.filter((x: unknown): x is string => typeof x === "string")
    : [];
  const images: string[] = Array.isArray(body.images)
    ? body.images.filter((x: unknown): x is string => typeof x === "string")
    : [];

  const product = await db.product.create({
    data: {
      sourceStore: "manual",
      sourceId: crypto.randomUUID(),
      sourceUrl: "",
      title: body.title.trim(),
      slug,
      description: body.description?.trim() || null,
      price,
      compareAtPrice:
        body.compareAtPrice != null && body.compareAtPrice !== ""
          ? Number(body.compareAtPrice)
          : null,
      category: (body.category || "").toString().trim(),
      tags: Array.isArray(body.tags)
        ? body.tags.filter((t: unknown): t is string => typeof t === "string")
        : [],
      stock: Number.isFinite(Number(body.stock)) ? parseInt(body.stock, 10) : 0,
      images,
      thumbnail: body.thumbnail || images[0] || null,
      isActive: body.isActive ?? true,
      isFeatured: body.isFeatured ?? false,
      ...(collectionIds.length > 0
        ? { collections: { create: collectionIds.map((collectionId) => ({ collectionId })) } }
        : {}),
    },
  });

  return NextResponse.json({ id: product.id, slug: product.slug }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") || "";
  const source = searchParams.get("source");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 25;
  const offset = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }
  if (source) where.sourceStore = source;

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
