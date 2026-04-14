import { db } from "../db";
import { meili, PRODUCTS_INDEX } from "../meilisearch";
import { ShportaScraper } from "../scrapers/shporta";
import { TreguScraper } from "../scrapers/tregu";
import { BennyScraper } from "../scrapers/benny";
import { ScraperAdapter, ScrapedProduct, SyncResult } from "../scrapers/types";
import { mapCategory, getCollectionSlugs } from "./category-mapper";
import { downloadProductImages } from "./image-sync";
import { makeUniqueSlug, slugify } from "../scrapers/utils";
import type { SourceStore } from "@/types";

const scraperMap: Record<SourceStore, () => ScraperAdapter> = {
  shporta: () => new ShportaScraper(),
  tregu: () => new TreguScraper(),
  benny: () => new BennyScraper(),
};

export async function syncStore(
  sourceStore: SourceStore,
  options: { downloadImages?: boolean; maxProducts?: number } = {}
): Promise<SyncResult> {
  const { downloadImages = true, maxProducts } = options;
  const scraper = scraperMap[sourceStore]();

  const result: SyncResult = {
    sourceStore,
    productsAdded: 0,
    productsUpdated: 0,
    pricesChanged: 0,
    errors: [],
  };

  // Create sync log
  const syncLog = await db.syncLog.create({
    data: { sourceStore, status: "running" },
  });

  let totalProcessed = 0;

  try {
    for await (const batch of scraper.scrapeAll()) {
      for (const scraped of batch) {
        if (maxProducts && totalProcessed >= maxProducts) break;

        try {
          await processProduct(scraped, downloadImages, result);
          totalProcessed++;
        } catch (err) {
          const msg = `Error processing ${scraped.title}: ${err}`;
          console.error(msg);
          result.errors.push(msg);
        }
      }

      if (maxProducts && totalProcessed >= maxProducts) break;
    }

    // Update sync log
    await db.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "completed",
        productsAdded: result.productsAdded,
        productsUpdated: result.productsUpdated,
        pricesChanged: result.pricesChanged,
        errors: result.errors,
        completedAt: new Date(),
      },
    });
  } catch (err) {
    const msg = `Sync failed for ${sourceStore}: ${err}`;
    console.error(msg);
    result.errors.push(msg);

    await db.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "failed",
        errors: result.errors,
        completedAt: new Date(),
      },
    });
  }

  return result;
}

async function processProduct(
  scraped: ScrapedProduct,
  downloadImages: boolean,
  result: SyncResult
): Promise<void> {
  const mappedCategory = mapCategory(scraped.category);
  const baseSlug = slugify(scraped.title);
  const slug = makeUniqueSlug(baseSlug, scraped.sourceStore, scraped.sourceId);

  // Check if product exists
  const existing = await db.product.findUnique({
    where: {
      sourceStore_sourceId: {
        sourceStore: scraped.sourceStore,
        sourceId: scraped.sourceId,
      },
    },
  });

  let images: string[] = [];
  let thumbnail: string | null = null;

  if (scraped.images.length > 0) {
    if (existing && existing.images.length > 0) {
      // Keep existing images (local or remote)
      images = existing.images;
      thumbnail = existing.thumbnail;
    } else if (downloadImages) {
      // Try local download first
      const imgResult = await downloadProductImages(scraped.images, slug);
      if (imgResult.images.length > 0) {
        images = imgResult.images;
        thumbnail = imgResult.thumbnail;
      } else {
        // Download failed — use source URLs directly as fallback
        images = scraped.images;
        thumbnail = scraped.images[0];
      }
    } else {
      // No download requested — use source URLs directly
      images = scraped.images;
      thumbnail = scraped.images[0];
    }
  }

  if (existing) {
    // Check price change
    const existingPrice = Number(existing.price);
    if (existingPrice !== scraped.price) {
      result.pricesChanged++;
    }

    await db.product.update({
      where: { id: existing.id },
      data: {
        title: scraped.title,
        description: scraped.description,
        price: scraped.price,
        compareAtPrice: scraped.compareAtPrice,
        category: mappedCategory,
        sourceUrl: scraped.sourceUrl,
        isActive: scraped.inStock,
        images: images.length > 0 ? images : undefined,
        thumbnail: thumbnail || undefined,
        syncedAt: new Date(),
      },
    });

    result.productsUpdated++;
  } else {
    const product = await db.product.create({
      data: {
        sourceStore: scraped.sourceStore,
        sourceId: scraped.sourceId,
        sourceUrl: scraped.sourceUrl,
        title: scraped.title,
        slug,
        description: scraped.description,
        price: scraped.price,
        compareAtPrice: scraped.compareAtPrice,
        images,
        thumbnail,
        category: mappedCategory,
        stock: 0,
        isActive: scraped.inStock,
        syncedAt: new Date(),
      },
    });

    // Assign to collections
    const collectionSlugs = getCollectionSlugs({
      price: scraped.price,
      category: mappedCategory,
    });

    // Always add to "te-rejat" (new arrivals)
    collectionSlugs.push("te-rejat");

    for (const collSlug of collectionSlugs) {
      const collection = await db.collection.findUnique({
        where: { slug: collSlug },
      });
      if (collection) {
        await db.productCollection.create({
          data: {
            productId: product.id,
            collectionId: collection.id,
          },
        }).catch(() => {
          // Ignore duplicate
        });
      }
    }

    result.productsAdded++;
  }

  // Index in Meilisearch
  await meili.index(PRODUCTS_INDEX).addDocuments([{
    id: existing?.id || slug,
    title: scraped.title,
    slug,
    description: scraped.description,
    price: scraped.price,
    compareAtPrice: scraped.compareAtPrice,
    thumbnail,
    category: mappedCategory,
    sourceStore: scraped.sourceStore,
    isActive: scraped.inStock,
    isFeatured: false,
    collections: getCollectionSlugs({ price: scraped.price, category: mappedCategory }),
  }]);
}

export async function syncAll(
  options: { downloadImages?: boolean; maxProducts?: number } = {}
): Promise<SyncResult[]> {
  const stores: SourceStore[] = ["shporta", "tregu", "benny"];
  const results: SyncResult[] = [];

  for (const store of stores) {
    console.log(`\nSyncing ${store}...`);
    const result = await syncStore(store, options);
    results.push(result);
    console.log(
      `${store}: +${result.productsAdded} added, ~${result.productsUpdated} updated, ${result.pricesChanged} price changes, ${result.errors.length} errors`
    );
  }

  return results;
}
