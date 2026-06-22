import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { NAV_TAXONOMY } from "../src/lib/nav-taxonomy";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const existing = await db.navCategory.count();
  if (existing > 0) {
    console.log(`Nav already has ${existing} categories — skipping seed. Use --force to replace.`);
    if (!process.argv.includes("--force")) return;
    await db.navChild.deleteMany();
    await db.navCategory.deleteMany();
    console.log("Cleared existing nav (--force).");
  }

  for (let i = 0; i < NAV_TAXONOMY.length; i++) {
    const cat = NAV_TAXONOMY[i];
    await db.navCategory.create({
      data: {
        label: cat.label,
        slug: cat.slug,
        color: cat.color,
        promoTitle: cat.promoTitle ?? null,
        promoSubtitle: cat.promoSubtitle ?? null,
        sortOrder: i,
        isActive: true,
        children: {
          create: cat.children.map((ch, j) => ({
            label: ch.label,
            tag: ch.tag ?? null,
            href: ch.href ?? null,
            sortOrder: j,
          })),
        },
      },
    });
    console.log(`  ✓ ${cat.label} (${cat.children.length} children)`);
  }

  const total = await db.navCategory.count();
  console.log(`Seeded ${total} nav categories.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
