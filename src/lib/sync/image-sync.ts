import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { fetchWithRetry } from "../scrapers/utils";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "products");
const THUMB_WIDTH = 400;
const FULL_WIDTH = 800;

export async function ensureUploadsDir(): Promise<void> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

export async function downloadAndProcessImage(
  imageUrl: string,
  productSlug: string,
  index: number
): Promise<{ full: string; thumbnail: string } | null> {
  try {
    await ensureUploadsDir();

    const response = await fetchWithRetry(imageUrl);
    if (!response.ok) return null;

    const buffer = Buffer.from(await response.arrayBuffer());

    const productDir = path.join(UPLOADS_DIR, productSlug);
    await fs.mkdir(productDir, { recursive: true });

    // Save full-size image
    const fullFilename = `${index}.webp`;
    const fullPath = path.join(productDir, fullFilename);
    await sharp(buffer)
      .resize(FULL_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(fullPath);

    // Save thumbnail
    const thumbFilename = `${index}-thumb.webp`;
    const thumbPath = path.join(productDir, thumbFilename);
    await sharp(buffer)
      .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(thumbPath);

    return {
      full: `/uploads/products/${productSlug}/${fullFilename}`,
      thumbnail: `/uploads/products/${productSlug}/${thumbFilename}`,
    };
  } catch (err) {
    console.error(`Error processing image ${imageUrl}:`, err);
    return null;
  }
}

export async function downloadProductImages(
  imageUrls: string[],
  productSlug: string
): Promise<{ images: string[]; thumbnail: string | null }> {
  const images: string[] = [];
  let thumbnail: string | null = null;

  for (let i = 0; i < imageUrls.length; i++) {
    const result = await downloadAndProcessImage(imageUrls[i], productSlug, i);
    if (result) {
      images.push(result.full);
      if (i === 0) thumbnail = result.thumbnail;
    }
  }

  return { images, thumbnail };
}

export async function deleteProductImages(productSlug: string): Promise<void> {
  const productDir = path.join(UPLOADS_DIR, productSlug);
  try {
    await fs.rm(productDir, { recursive: true, force: true });
  } catch {
    // Directory might not exist
  }
}
