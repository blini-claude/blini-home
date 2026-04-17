/**
 * Re-check stock status for products currently marked isActive=false and
 * reactivate any that the live source actually lists as in-stock.
 *
 * Background: an earlier version of the scraper naively matched any
 * `.out-of-stock` element in the page, which incorrectly caught the
 * ribbons used by the "related products" carousel and flipped ~1000
 * products into the inactive bucket.
 */
import { db } from "../src/lib/db";
import { fetchWithRetry } from "../src/lib/scrapers/utils";
import * as cheerio from "cheerio";

async function checkInStock(url: string): Promise<boolean | null> {
  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    const summary = $(".mf-summary-meta, .summary.entry-summary, .product-summary-wrap").first();
    if (summary.length === 0) return null; // page shape changed, skip
    const hasIn = summary.find(".stock.in-stock, p.stock.in-stock").length > 0;
    const hasOut = summary.find(".stock.out-of-stock, p.stock.out-of-stock").length > 0;
    return hasIn || !hasOut;
  } catch {
    return null;
  }
}

async function main() {
  const targets = await db.product.findMany({
    where: {
      isActive: false,
      sourceStore: { in: ["tregu", "shporta"] },
    },
    select: { id: true, title: true, sourceUrl: true, sourceStore: true },
  });

  console.log(`Found ${targets.length} inactive products to recheck.`);

  let reactivated = 0;
  let stillOut = 0;
  let unknown = 0;
  let index = 0;

  for (const p of targets) {
    index++;
    const inStock = await checkInStock(p.sourceUrl);
    if (inStock === true) {
      await db.product.update({
        where: { id: p.id },
        data: { isActive: true, syncedAt: new Date() },
      });
      reactivated++;
      if (reactivated % 25 === 0) {
        console.log(`[${index}/${targets.length}] reactivated=${reactivated} stillOut=${stillOut} unknown=${unknown}`);
      }
    } else if (inStock === false) {
      stillOut++;
    } else {
      unknown++;
    }
    // be polite
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`\nDone. reactivated=${reactivated} stillOut=${stillOut} unknown=${unknown}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
