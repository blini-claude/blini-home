import { describe, it, expect } from "vitest";
import { KubikScraper } from "@/lib/scrapers/kubik";

describe("KubikScraper", () => {
  const scraper = new KubikScraper();

  it("has correct name and sourceStore", () => {
    expect(scraper.name).toBe("Kubik");
    expect(scraper.sourceStore).toBe("kubik");
  });

  it("scrapes via WooCommerce Store API", async () => {
    let total = 0;
    for await (const batch of scraper.scrapeAll()) {
      total += batch.length;
      if (batch.length > 0) {
        expect(batch[0].sourceStore).toBe("kubik");
        expect(batch[0].title).toBeTruthy();
        expect(batch[0].price).toBeGreaterThan(0);
        expect(batch[0].sourceUrl).toContain("kubikmall.com");
      }
      break;
    }
    expect(total).toBeGreaterThanOrEqual(1);
  }, 60000);
});
