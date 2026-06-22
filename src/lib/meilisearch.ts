import { Meilisearch } from "meilisearch";
import { db } from "./db";

const globalForMeili = globalThis as unknown as {
  meili: Meilisearch | undefined;
};

export const meili =
  globalForMeili.meili ??
  new Meilisearch({
    host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
    apiKey: process.env.MEILISEARCH_API_KEY || "",
  });

if (process.env.NODE_ENV !== "production") globalForMeili.meili = meili;

export const PRODUCTS_INDEX = "products";

/**
 * Upsert a single product into the search index. Best-effort: a Meili outage
 * must never block saving a product, so failures are logged and swallowed.
 * Keeps manually-added products searchable without a full reindex.
 */
export async function syncProductToIndex(id: string): Promise<void> {
  try {
    const p = await db.product.findUnique({
      where: { id },
      include: { collections: { include: { collection: true } } },
    });
    if (!p) return;
    await meili.index(PRODUCTS_INDEX).addDocuments([
      {
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        thumbnail: p.thumbnail,
        category: p.category,
        sourceStore: p.sourceStore,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        tags: p.tags ?? [],
        collections: p.collections.map((c) => c.collection.slug),
      },
    ]);
  } catch (err) {
    console.error("meili syncProductToIndex failed:", err);
  }
}

export async function removeProductFromIndex(id: string): Promise<void> {
  try {
    await meili.index(PRODUCTS_INDEX).deleteDocument(id);
  } catch (err) {
    console.error("meili removeProductFromIndex failed:", err);
  }
}
