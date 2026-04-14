import { describe, it, expect, afterAll } from "vitest";

describe("BullMQ queues", () => {
  it("should add a job to product-sync queue", async () => {
    const { productSyncQueue } = await import("@/lib/queue");
    const job = await productSyncQueue.add("test-sync", {
      store: "shporta",
      type: "full",
    });
    expect(job.id).toBeDefined();
    expect(job.name).toBe("test-sync");
    await job.remove();
  });

  afterAll(async () => {
    const { productSyncQueue, imageSyncQueue, priceSyncQueue } = await import("@/lib/queue");
    await productSyncQueue.close();
    await imageSyncQueue.close();
    await priceSyncQueue.close();
    const { redis } = await import("@/lib/redis");
    await redis.quit();
  });
});
