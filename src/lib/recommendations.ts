import { db } from "./db";

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export async function getRecommendations(
  productId: string,
  category: string,
  price: number,
  limit: number = 8
) {
  const minPrice = price * 0.5;
  const maxPrice = price * 1.8;

  // Get same-category products in similar price range
  const candidates = await db.product.findMany({
    where: {
      id: { not: productId },
      isActive: true,
      category,
      price: { gte: minPrice, lte: maxPrice },
    },
    take: 30,
  });

  // If not enough, broaden to all categories in price range
  if (candidates.length < limit) {
    const moreCandidates = await db.product.findMany({
      where: {
        id: { not: productId },
        isActive: true,
        price: { gte: minPrice, lte: maxPrice },
        category: { not: category },
      },
      take: 30 - candidates.length,
    });
    candidates.push(...moreCandidates);
  }

  // Hour-seeded deterministic shuffle
  const hourSeed = Math.floor(Date.now() / 3600000);
  const shuffled = candidates
    .map((p) => ({
      product: p,
      sort: simpleHash(p.id + String(hourSeed)),
    }))
    .sort((a, b) => a.sort - b.sort)
    .map((x) => x.product);

  return shuffled.slice(0, limit);
}
