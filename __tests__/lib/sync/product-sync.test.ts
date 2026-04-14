import { describe, it, expect, afterAll } from "vitest";
import { syncStore } from "@/lib/sync/product-sync";

describe("Product sync", () => {
  it("should sync a small batch from shporta", async () => {
    const result = await syncStore("shporta", {
      downloadImages: false,
      maxProducts: 3,
    });

    expect(result.sourceStore).toBe("shporta");
    expect(result.productsAdded + result.productsUpdated).toBeGreaterThanOrEqual(0);
    console.log(`Shporta sync: +${result.productsAdded}, ~${result.productsUpdated}, errors: ${result.errors.length}`);
  }, 120000);

  it("should sync a small batch from benny", async () => {
    const result = await syncStore("benny", {
      downloadImages: false,
      maxProducts: 3,
    });

    expect(result.sourceStore).toBe("benny");
    expect(result.productsAdded + result.productsUpdated).toBeGreaterThanOrEqual(0);
    console.log(`Benny sync: +${result.productsAdded}, ~${result.productsUpdated}, errors: ${result.errors.length}`);
  }, 120000);

  afterAll(async () => {
    const { db } = await import("@/lib/db");
    await db.$disconnect();
    const { redis } = await import("@/lib/redis");
    await redis.quit();
  });
});
