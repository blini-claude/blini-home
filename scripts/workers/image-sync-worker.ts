import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { downloadProductImages } from "../../src/lib/sync/image-sync";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const worker = new Worker(
  "image-sync",
  async (job) => {
    const { productId, imageUrls, slug } = job.data as {
      productId: string;
      imageUrls: string[];
      slug: string;
    };

    console.log(`[image-sync] Downloading images for ${slug}...`);
    const result = await downloadProductImages(imageUrls, slug);

    await db.product.update({
      where: { id: productId },
      data: {
        images: result.images,
        thumbnail: result.thumbnail,
      },
    });

    console.log(`[image-sync] ${slug}: ${result.images.length} images downloaded`);
    return result;
  },
  {
    connection: redis,
    concurrency: 3,
  }
);

worker.on("completed", (job) => {
  console.log(`[image-sync] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[image-sync] Job ${job?.id} failed:`, err);
});

console.log("[image-sync] Worker started, waiting for jobs...");
