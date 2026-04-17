/**
 * One-off: fix the mini-biciklete product whose images failed to scrape
 * because of the non-standard splide gallery. Reuses the fixed shporta
 * scraper to refetch images for that single URL.
 */
import { db } from "../src/lib/db";
import { ShportaScraper } from "../src/lib/scrapers/shporta";
import { downloadProductImages } from "../src/lib/sync/image-sync";

async function main() {
  const rows = await db.product.findMany({
    where: { thumbnail: null },
    select: { id: true, slug: true, sourceUrl: true, sourceStore: true, title: true },
  });
  console.log(`Found ${rows.length} product(s) with no thumbnail.`);

  for (const p of rows) {
    if (p.sourceStore !== "shporta") {
      console.log(`Skipping ${p.id} (${p.sourceStore})`);
      continue;
    }
    const scraper = new ShportaScraper();
    const scraped = await scraper.scrapeProduct(p.sourceUrl);
    if (!scraped || scraped.images.length === 0) {
      console.log(`No images for ${p.title} (${p.sourceUrl})`);
      continue;
    }
    const { images, thumbnail } = await downloadProductImages(scraped.images, p.slug);
    const finalImages = images.length > 0 ? images : scraped.images;
    const finalThumb = thumbnail || scraped.images[0];
    await db.product.update({
      where: { id: p.id },
      data: { images: finalImages, thumbnail: finalThumb, syncedAt: new Date() },
    });
    console.log(`Fixed ${p.title}: ${finalImages.length} images, thumb=${finalThumb}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
