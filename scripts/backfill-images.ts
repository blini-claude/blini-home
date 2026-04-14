/**
 * Fast image backfill: Fetches product images from source store public APIs
 * and updates DB records that have empty images/thumbnails.
 *
 * - Shopify (benny): /products.json — bulk, fast
 * - WooCommerce (shporta, tregu): /wp-json/wc/store/v1/products — public Store API
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const STORES = {
  shporta: "https://shporta.shop",
  tregu: "https://tregu.shop",
  benny: "https://bennygroup.store",
};

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  let totalUpdated = 0;

  // --- Shopify store (benny) ---
  console.log("\n=== Backfilling Benny (Shopify) ===");
  try {
    let page = 1;
    while (true) {
      const url = `${STORES.benny}/products.json?limit=250&page=${page}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`  Benny page ${page}: HTTP ${res.status}, stopping`);
        break;
      }
      const data = await res.json();
      const products = data?.products;
      if (!Array.isArray(products) || products.length === 0) break;

      for (const p of products) {
        const sourceId = String(p.id);
        const images = (p.images || []).map((img: any) => img.src).filter(Boolean);
        if (images.length === 0) continue;

        const existing = await db.product.findFirst({
          where: { sourceStore: "benny", sourceId },
          select: { id: true, images: true, thumbnail: true },
        });

        if (existing && existing.images.length === 0) {
          await db.product.update({
            where: { id: existing.id },
            data: {
              images,
              thumbnail: images[0],
            },
          });
          totalUpdated++;
        }
      }

      console.log(`  Page ${page}: processed ${products.length} products`);
      if (products.length < 250) break;
      page++;
    }
  } catch (err) {
    console.error("  Benny error:", err);
  }

  // --- WooCommerce stores (shporta, tregu) ---
  for (const store of ["shporta", "tregu"] as const) {
    console.log(`\n=== Backfilling ${store} (WooCommerce) ===`);
    const baseUrl = STORES[store];

    try {
      // Try public Store API first
      let page = 1;
      let useStoreApi = true;

      // Test if Store API is available
      const testRes = await fetch(`${baseUrl}/wp-json/wc/store/v1/products?per_page=1`);
      if (!testRes.ok) {
        console.log(`  Store API not available (${testRes.status}), trying product pages...`);
        useStoreApi = false;
      }

      if (useStoreApi) {
        while (true) {
          const url = `${baseUrl}/wp-json/wc/store/v1/products?per_page=100&page=${page}`;
          const res = await fetch(url);
          if (!res.ok) break;

          const products = await res.json();
          if (!Array.isArray(products) || products.length === 0) break;

          for (const p of products) {
            const images = (p.images || []).map((img: any) => img.src || img.thumbnail).filter(Boolean);
            if (images.length === 0) continue;

            // Match by permalink/sourceUrl since HTML scraper uses URL slug as sourceId
            const permalink = p.permalink || `${baseUrl}/product/${p.slug}`;
            let existing = await db.product.findFirst({
              where: { sourceStore: store, sourceUrl: permalink },
              select: { id: true, images: true, thumbnail: true },
            });

            // Also try matching by numeric ID (in case API scraper was used)
            if (!existing) {
              existing = await db.product.findFirst({
                where: { sourceStore: store, sourceId: String(p.id) },
                select: { id: true, images: true, thumbnail: true },
              });
            }

            // Also try matching by slug
            if (!existing && p.slug) {
              existing = await db.product.findFirst({
                where: { sourceStore: store, sourceId: p.slug },
                select: { id: true, images: true, thumbnail: true },
              });
            }

            if (existing && existing.images.length === 0) {
              await db.product.update({
                where: { id: existing.id },
                data: {
                  images,
                  thumbnail: images[0],
                },
              });
              totalUpdated++;
            }
          }

          console.log(`  Page ${page}: processed ${products.length} products`);
          if (products.length < 100) break;
          page++;
        }
      } else {
        // Fallback: Use the product sitemap or individual product pages
        // Try the WC REST API without auth (some stores allow public read)
        let wcPage = 1;
        while (true) {
          const url = `${baseUrl}/wp-json/wc/v3/products?per_page=100&page=${wcPage}`;
          const res = await fetch(url);
          if (!res.ok) {
            console.log(`  WC API not available either (${res.status}). Trying product JSON-LD...`);
            break;
          }

          const products = await res.json();
          if (!Array.isArray(products) || products.length === 0) break;

          for (const p of products) {
            const sourceId = String(p.id);
            const images = (p.images || []).map((img: any) => img.src).filter(Boolean);
            if (images.length === 0) continue;

            const existing = await db.product.findFirst({
              where: { sourceStore: store, sourceId },
              select: { id: true, images: true, thumbnail: true },
            });

            if (existing && existing.images.length === 0) {
              await db.product.update({
                where: { id: existing.id },
                data: {
                  images,
                  thumbnail: images[0],
                },
              });
              totalUpdated++;
            }
          }

          console.log(`  Page ${wcPage}: processed ${products.length} products`);
          if (products.length < 100) break;
          wcPage++;
        }

        // Final fallback: Fetch individual product pages for remaining products
        const remaining = await db.product.findMany({
          where: { sourceStore: store, images: { isEmpty: true } },
          select: { id: true, sourceUrl: true, sourceId: true },
        });

        if (remaining.length > 0) {
          console.log(`  Fetching ${remaining.length} individual product pages...`);
          let fetched = 0;
          for (const product of remaining) {
            try {
              const res = await fetch(product.sourceUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (compatible; BliniBot/1.0)" },
              });
              if (!res.ok) continue;

              const html = await res.text();
              // Extract images from og:image and JSON-LD
              const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/)?.[1];
              const images: string[] = [];

              // Try to find product gallery images
              const galleryMatches = html.matchAll(/data-large_image="([^"]+)"/g);
              for (const m of galleryMatches) {
                if (m[1] && !m[1].includes("placeholder")) images.push(m[1]);
              }

              // Also try src attributes from gallery
              if (images.length === 0) {
                const srcMatches = html.matchAll(/woocommerce-product-gallery__image[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"/g);
                for (const m of srcMatches) {
                  if (m[1] && !m[1].includes("placeholder")) images.push(m[1]);
                }
              }

              // Fall back to og:image
              if (images.length === 0 && ogImage && !ogImage.includes("placeholder")) {
                images.push(ogImage);
              }

              if (images.length > 0) {
                await db.product.update({
                  where: { id: product.id },
                  data: { images, thumbnail: images[0] },
                });
                totalUpdated++;
              }

              fetched++;
              if (fetched % 20 === 0) console.log(`  Processed ${fetched}/${remaining.length}`);

              // Rate limit
              await new Promise((r) => setTimeout(r, 300));
            } catch {
              // Skip failed products
            }
          }
        }
      }
    } catch (err) {
      console.error(`  ${store} error:`, err);
    }
  }

  console.log(`\n=== Done! Updated ${totalUpdated} products with images ===`);

  await db.$disconnect();
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
