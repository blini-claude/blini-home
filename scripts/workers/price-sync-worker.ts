import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { syncStore } from "../../src/lib/sync/product-sync";
import type { SourceStore } from "../../src/types";

const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "price-sync",
  async (job) => {
    const { store } = job.data as { store: SourceStore };
    console.log(`[price-sync] Checking prices for ${store}...`);
    const result = await syncStore(store, { downloadImages: false });
    console.log(`[price-sync] ${store}: ${result.pricesChanged} price changes`);
    return result;
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

worker.on("completed", (job) => {
  console.log(`[price-sync] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[price-sync] Job ${job?.id} failed:`, err);
});

console.log("[price-sync] Worker started, waiting for jobs...");
