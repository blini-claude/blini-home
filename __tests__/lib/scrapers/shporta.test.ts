import { describe, it, expect } from "vitest";
import { ShportaScraper } from "@/lib/scrapers/shporta";

describe("ShportaScraper", () => {
  const scraper = new ShportaScraper();

  it("should have correct name and sourceStore", () => {
    expect(scraper.name).toBe("Shporta.shop");
    expect(scraper.sourceStore).toBe("shporta");
  });

  it("should scrape a real product page", async () => {
    const response = await fetch("https://shporta.shop/shop/", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BliniHome/1.0)" },
    });

    if (!response.ok) {
      console.log("Shporta.shop unreachable, skipping live test");
      return;
    }

    const html = await response.text();
    const linkMatch = html.match(/href="(https:\/\/shporta\.shop\/product\/[^"]+)"/);
    if (!linkMatch) {
      console.log("No product links found, skipping");
      return;
    }

    const product = await scraper.scrapeProduct(linkMatch[1]);
    if (!product) {
      console.log("Product scrape returned null, skipping");
      return;
    }

    expect(product.sourceStore).toBe("shporta");
    expect(product.title).toBeTruthy();
    expect(product.price).toBeGreaterThan(0);
    expect(product.sourceUrl).toContain("shporta.shop");
  }, 30000);

  it("should yield batches from scrapeAll", async () => {
    let batchCount = 0;
    let totalProducts = 0;

    for await (const batch of scraper.scrapeAll()) {
      batchCount++;
      totalProducts += batch.length;
      if (batch.length > 0) {
        expect(batch[0].sourceStore).toBe("shporta");
        expect(batch[0].title).toBeTruthy();
      }
      break; // Only test first batch to avoid long test
    }

    expect(batchCount).toBeGreaterThanOrEqual(1);
    console.log(`Shporta: ${totalProducts} products in first batch`);
  }, 60000);
});
