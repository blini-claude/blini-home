import { describe, it, expect } from "vitest";
import { BennyScraper } from "@/lib/scrapers/benny";

describe("BennyScraper", () => {
  const scraper = new BennyScraper();

  it("should have correct name and sourceStore", () => {
    expect(scraper.name).toBe("BennyGroup");
    expect(scraper.sourceStore).toBe("benny");
  });

  it("should scrape via products.json", async () => {
    let batchCount = 0;
    let totalProducts = 0;

    for await (const batch of scraper.scrapeAll()) {
      batchCount++;
      totalProducts += batch.length;
      if (batch.length > 0) {
        expect(batch[0].sourceStore).toBe("benny");
        expect(batch[0].title).toBeTruthy();
        expect(batch[0].price).toBeGreaterThan(0);
      }
      break;
    }

    expect(batchCount).toBeGreaterThanOrEqual(1);
    console.log(`Benny: ${totalProducts} products in first batch`);
  }, 60000);

  it("should scrape a single product", async () => {
    const response = await fetch("https://bennygroup.store/products.json?limit=1", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BliniHome/1.0)" },
    });

    if (!response.ok) {
      console.log("BennyGroup unreachable, skipping");
      return;
    }

    const data = await response.json();
    const firstProduct = data.products?.[0];
    if (!firstProduct) return;

    const product = await scraper.scrapeProduct(
      `https://bennygroup.store/products/${firstProduct.handle}`
    );

    expect(product).not.toBeNull();
    expect(product!.sourceStore).toBe("benny");
    expect(product!.title).toBeTruthy();
    expect(product!.price).toBeGreaterThan(0);
  }, 30000);
});
