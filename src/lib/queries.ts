import { db } from "./db";

export async function getActiveProducts(options: {
  limit?: number;
  offset?: number;
  category?: string;
  collectionSlug?: string;
  sortBy?: "price-asc" | "price-desc" | "newest" | "name";
  minPrice?: number;
  maxPrice?: number;
} = {}) {
  const { limit = 24, offset = 0, category, collectionSlug, sortBy = "newest", minPrice, maxPrice } = options;

  const where: any = { isActive: true };
  if (category) where.category = category;
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
