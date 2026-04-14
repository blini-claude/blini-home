import { describe, it, expect } from "vitest";

describe("Meilisearch connection", () => {
  it("should connect and check health", async () => {
    const { meili } = await import("@/lib/meilisearch");
    const health = await meili.health();
    expect(health.status).toBe("available");
  });

  it("should have products index after setup", async () => {
    const { meili, PRODUCTS_INDEX } = await import("@/lib/meilisearch");
    const index = meili.index(PRODUCTS_INDEX);
    const stats = await index.getStats();
    expect(stats).toBeDefined();
    expect(stats.numberOfDocuments).toBeGreaterThanOrEqual(0);
  });
});
