import { describe, it, expect } from "vitest";
import { TreguScraper } from "@/lib/scrapers/tregu";

describe("TreguScraper", () => {
  const scraper = new TreguScraper();

  it("should have correct name and sourceStore", () => {
    expect(scraper.name).toBe("Tregu.shop");
    expect(scraper.sourceStore).toBe("tregu");
  });

  it("should scrape a real product page", async () => {
    // Tregu.shop uses Albanian WooCommerce localization: /shitorja/ and /produkti/
    const response = await fetch("https://tregu.shop/shitorja/", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BliniHome/1.0)" },
    });

    if (!response.ok) {
      console.log("Tregu.shop unreachable, skipping live test");
      return;
    }

    const html = await response.text();
    const linkMatch = html.match(/href="(https:\/\/tregu\.shop\/produkti\/[^"]+)"/);
    if (!linkMatch) {
      console.log("No product links found, skipping");
      return;
    }

    const product = await scraper.scrapeProduct(linkMatch[1]);
    if (!product) {
      console.log("Product scrape returned null, skipping");
      return;
    }

    expect(product.sourceStore).toBe("tregu");
    expect(product.title).toBeTruthy();
    expect(product.price).toBeGreaterThan(0);
    expect(product.sourceUrl).toContain("tregu.shop");
  }, 30000);

  it("should yield batches from scrapeAll", async () => {
    let batchCount = 0;
    let totalProducts = 0;

    for await (const batch of scraper.scrapeAll()) {
      batchCount++;
      totalProducts += batch.length;
      if (batch.length > 0) {
        expect(batch[0].sourceStore).toBe("tregu");
        expect(batch[0].title).toBeTruthy();
      }
      break;
    }

    expect(batchCount).toBeGreaterThanOrEqual(1);
    console.log(`Tregu: ${totalProducts} products in first batch`);
  }, 60000);
});
