/**
 * Fix collection assignments: assigns all products to their proper collections
 * based on category and price.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const CATEGORY_TO_COLLECTION: Record<string, string[]> = {
  "Shtëpi": ["shtepi-kuzhine"],
  "Kuzhinë": ["shtepi-kuzhine"],
  "Teknologji": ["teknologji"],
  "Fëmijë": ["femije-lodra"],
  "Bukuri": ["bukuri-kujdes"],
  "Sporte": ["sporte-aktivitete"],
  "Veshje": ["veshje-aksesore"],
  "Aksesore": ["veshje-aksesore"],
};

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  // Get all collections
  const collections = await db.collection.findMany();
  const collectionMap = new Map(collections.map((c) => [c.slug, c.id]));
  console.log(`Found ${collections.length} collections:`, collections.map((c) => c.slug).join(", "));

  // Get all active products
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { id: true, category: true, price: true, createdAt: true },
  });
  console.log(`Processing ${products.length} products...`);

  let assigned = 0;

  for (const product of products) {
    const slugs: string[] = [];

    // Category-based
    const catSlugs = CATEGORY_TO_COLLECTION[product.category];
    if (catSlugs) slugs.push(...catSlugs);

    // Price-based
    if (Number(product.price) <= 10) slugs.push("nen-10");

    // New arrivals (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (product.createdAt >= thirtyDaysAgo) slugs.push("te-rejat");

    for (const slug of slugs) {
      const collectionId = collectionMap.get(slug);
      if (!collectionId) continue;

      try {
        await db.productCollection.create({
          data: { productId: product.id, collectionId },
        });
        assigned++;
      } catch {
        // Already assigned — skip
      }
    }
  }

  console.log(`Done! Created ${assigned} new collection assignments.`);

  // Print counts per collection
  for (const col of collections) {
    const count = await db.productCollection.count({ where: { collectionId: col.id } });
    console.log(`  ${col.slug}: ${count} products`);
  }

  await db.$disconnect();
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
