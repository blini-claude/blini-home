import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
