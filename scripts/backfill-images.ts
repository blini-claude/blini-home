/**
 * Backfill script: re-sync all stores with downloadImages=false
 * This stores the source image URLs directly in the images/thumbnail fields
 * for all products that currently have no images.
 *
 * Source URLs are served via Next.js Image optimization (remotePatterns configured).
 */
import { syncAll } from "../src/lib/sync/product-sync";

async function main() {
  console.log("Starting image backfill — re-syncing all stores with source URLs...\n");

  const results = await syncAll({ downloadImages: false });

  console.log("\n=== Backfill Complete ===");
  for (const r of results) {
    console.log(
      `${r.sourceStore}: +${r.productsAdded} added, ~${r.productsUpdated} updated, ${r.pricesChanged} price changes, ${r.errors.length} errors`
    );
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
