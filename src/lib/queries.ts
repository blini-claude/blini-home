import { db } from "./db";

export async function getActiveProducts(options: {
  limit?: number;
  offset?: number;
  category?: string;
  tag?: string;
  collectionSlug?: string;
  sortBy?: "price-asc" | "price-desc" | "newest" | "name";
  minPrice?: number;
  maxPrice?: number;
} = {}) {
  const { limit = 24, offset = 0, category, tag, collectionSlug, sortBy = "newest", minPrice, maxPrice } = options;

  const where: any = { isActive: true };
  if (category) where.category = category;
  if (tag) where.tags = { has: tag };
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  const orderBy: any = sortBy === "price-asc"
    ? { price: "asc" }
    : sortBy === "price-desc"
    ? { price: "desc" }
    : sortBy === "name"
    ? { title: "asc" }
    : { createdAt: "desc" };

  if (collectionSlug) {
    const collection = await db.collection.findUnique({
      where: { slug: collectionSlug },
    });
    if (!collection) return { products: [], total: 0 };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where: {
          ...where,
          collections: { some: { collectionId: collection.id } },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      db.product.count({
        where: {
          ...where,
          collections: { some: { collectionId: collection.id } },
        },
      }),
    ]);

    return { products, total };
  }

  const [products, total] = await Promise.all([
    db.product.findMany({ where, orderBy, skip: offset, take: limit }),
    db.product.count({ where }),
  ]);

  return { products, total };
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: { collections: { include: { collection: true } } },
  });
}

export async function getCollections() {
  return db.collection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCollectionBySlug(slug: string) {
  return db.collection.findUnique({ where: { slug } });
}

export async function getFeaturedProducts(limit = 12) {
  return db.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getNewArrivals(limit = 12) {
  return db.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getTagsForCollection(collectionSlug?: string): Promise<string[]> {
  let products;
  if (collectionSlug) {
    const collection = await db.collection.findUnique({ where: { slug: collectionSlug } });
    if (!collection) return [];
    products = await db.product.findMany({
      where: { isActive: true, collections: { some: { collectionId: collection.id } } },
      select: { tags: true },
    });
  } else {
    products = await db.product.findMany({
      where: { isActive: true },
      select: { tags: true },
    });
  }
  const tagCounts = new Map<string, number>();
  for (const p of products) {
    for (const t of p.tags) {
      tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
    }
  }
  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}

export async function getPriceRange(): Promise<{ min: number; max: number }> {
  const result = await db.product.aggregate({
    where: { isActive: true },
    _min: { price: true },
    _max: { price: true },
  });
  return {
    min: Math.floor(Number(result._min.price ?? 0)),
    max: Math.ceil(Number(result._max.price ?? 100)),
  };
}

export async function getRelatedProducts(productId: string, category: string, limit = 6) {
  return db.product.findMany({
    where: {
      isActive: true,
      category,
      id: { not: productId },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
