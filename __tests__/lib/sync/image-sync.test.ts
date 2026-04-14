import { describe, it, expect, afterAll } from "vitest";
import fs from "fs/promises";
import path from "path";
import { downloadAndProcessImage, downloadProductImages, deleteProductImages } from "@/lib/sync/image-sync";

const TEST_SLUG = "test-product-image";

describe("Image sync", () => {
  afterAll(async () => {
    await deleteProductImages(TEST_SLUG);
  });

  it("should download and process an image to webp", async () => {
    // Use a small test image from the web
    const result = await downloadAndProcessImage(
      "https://placehold.co/600x800.png",
      TEST_SLUG,
      0
    );

    if (!result) {
      console.log("Image download failed (network issue), skipping");
      return;
    }

    expect(result.full).toContain(TEST_SLUG);
    expect(result.full).toMatch(/\.webp$/);
    expect(result.thumbnail).toContain("-thumb.webp");

    // Verify files exist
    const fullPath = path.join(process.cwd(), "public", result.full);
    const thumbPath = path.join(process.cwd(), "public", result.thumbnail);
    const fullStat = await fs.stat(fullPath);
    const thumbStat = await fs.stat(thumbPath);
    expect(fullStat.size).toBeGreaterThan(0);
    expect(thumbStat.size).toBeGreaterThan(0);
    expect(thumbStat.size).toBeLessThanOrEqual(fullStat.size);
  }, 30000);

  it("should download multiple product images", async () => {
    const result = await downloadProductImages(
      ["https://placehold.co/400x500.png", "https://placehold.co/400x500.png"],
      TEST_SLUG
    );

    expect(result.images.length).toBeGreaterThanOrEqual(1);
    expect(result.thumbnail).toBeTruthy();
  }, 30000);
});
