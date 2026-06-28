import { describe, it, expect } from "vitest";
import { SivegetaScraper } from "@/lib/scrapers/sivegeta";

describe("SivegetaScraper", () => {
  const scraper = new SivegetaScraper();

  it("has correct name and sourceStore", () => {
    expect(scraper.name).toBe("Sivegeta");
    expect(scraper.sourceStore).toBe("sivegeta");
  });

  it("scrapes via products.json", async () => {
    let total = 0;
    for await (const batch of scraper.scrapeAll()) {
      total += batch.length;
      if (batch.length > 0) {
        expect(batch[0].sourceStore).toBe("sivegeta");
        expect(batch[0].title).toBeTruthy();
        expect(batch[0].price).toBeGreaterThan(0);
      }
      break;
    }
    expect(total).toBeGreaterThanOrEqual(1);
  }, 60000);
});
