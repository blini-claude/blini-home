import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids");
  if (!ids) {
    return NextResponse.json({ products: [] });
  }

  const productIds = ids.split(",").filter(Boolean).slice(0, 20);
  if (productIds.length === 0) {
    return NextResponse.json({ products: [] });
  }

  // Get cart products to know their categories and price range
  const cartProducts = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, category: true, price: true },
  });

  if (cartProducts.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const categories = [...new Set(cartProducts.map((p) => p.category))];
  const prices = cartProducts.map((p) => Number(p.price));
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = avgPrice * 0.3;
  const maxPrice = avgPrice * 2.5;

  // Get products in same categories, similar price range, not already in cart
  const candidates = await db.product.findMany({
    where: {
      id: { notIn: productIds },
      isActive: true,
      category: { in: categories },
      price: { gte: minPrice, lte: maxPrice },
    },
    take: 40,
  });

  // If not enough, broaden search
  if (candidates.length < 12) {
    const more = await db.product.findMany({
      where: {
        id: { notIn: [...productIds, ...candidates.map((c) => c.id)] },
        isActive: true,
        price: { gte: minPrice, lte: maxPrice },
      },
      take: 40 - candidates.length,
    });
    candidates.push(...more);
  }

  // Deterministic shuffle
  const hourSeed = Math.floor(Date.now() / 3600000);
  const shuffled = candidates
    .map((p) => ({
      product: p,
      sort: simpleHash(p.id + String(hourSeed)),
    }))
    .sort((a, b) => a.sort - b.sort)
    .map((x) => x.product);

  return NextResponse.json({ products: shuffled.slice(0, 12) });
}
