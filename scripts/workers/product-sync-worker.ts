import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { syncStore } from "../../src/lib/sync/product-sync";
import type { SourceStore } from "../../src/types";

const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "product-sync",
  async (job) => {
    const { store, downloadImages = true } = job.data as {
      store: SourceStore;
      downloadImages?: boolean;
    };

    console.log(`[product-sync] Starting sync for ${store}...`);
    const result = await syncStore(store, { downloadImages });
    console.log(
      `[product-sync] ${store}: +${result.productsAdded} added, ~${result.productsUpdated} updated, ${result.errors.length} errors`
    );
    return result;
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

worker.on("completed", (job) => {
  console.log(`[product-sync] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[product-sync] Job ${job?.id} failed:`, err);
});

console.log("[product-sync] Worker started, waiting for jobs...");
