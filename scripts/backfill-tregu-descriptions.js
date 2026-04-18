// Run with: node scripts/backfill-tregu-descriptions.js
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const pg = require("pg");

const connectionString = process.env.DATABASE_URL || "postgresql://blini_home:BliniHome2026!@192.168.100.110:5432/blini_home";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function extractText(html) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function backfill() {
  const products = await prisma.product.findMany({
    where: {
      sourceStore: "tregu",
      OR: [
        { description: null },
        { description: "" },
      ],
    },
    select: { id: true, sourceId: true, slug: true, sourceUrl: true, title: true },
  });

  console.log(`Found ${products.length} tregu products without descriptions`);

  let updated = 0;
  let failed = 0;
  let page = 1;
  const perPage = 25;
  const allApiProducts = new Map();

  console.log("Fetching all tregu products from Store API...");
  while (true) {
    try {
      const url = `https://tregu.shop/wp-json/wc/store/v1/products?per_page=${perPage}&page=${page}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; BliniHome/1.0)" },
      });

      if (!res.ok) {
        console.log(`API returned ${res.status} at page ${page}, stopping.`);
        break;
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;

      for (const p of data) {
        const permalink = p.permalink || "";
        const slug = permalink.replace(/\/$/, "").split("/").pop() || "";
        if (slug) {
          allApiProducts.set(slug, {
            description: p.description || "",
            short_description: p.short_description || "",
          });
        }
      }

      console.log(`  Page ${page}: ${data.length} products (total API: ${allApiProducts.size})`);
      if (data.length < perPage) break;
      page++;

      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`Error fetching page ${page}:`, err);
      break;
    }
  }

  console.log(`\nFetched ${allApiProducts.size} products from API. Matching...`);

  for (const product of products) {
    const urlSlug = product.sourceUrl.replace(/\/$/, "").split("/").pop() || "";
    const apiData = allApiProducts.get(urlSlug) || allApiProducts.get(product.sourceId);

    if (!apiData) {
      failed++;
      continue;
    }

    const desc = extractText(apiData.description) || extractText(apiData.short_description);
    if (!desc || desc.length < 5) {
      failed++;
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { description: desc },
    });

    updated++;
    if (updated % 100 === 0) {
      console.log(`  Updated ${updated} products...`);
    }
  }

  console.log(`\nDone! Updated: ${updated}, No description found: ${failed}`);
  console.log("Now re-indexing Meilisearch...");

  const { Meilisearch } = await import("meilisearch");
  const meili = new Meilisearch({
    host: process.env.MEILISEARCH_HOST || "http://192.168.100.110:7700",
    apiKey: process.env.MEILISEARCH_API_KEY || "blini_home_meili_2026",
  });

  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true, title: true, slug: true, description: true,
      price: true, compareAtPrice: true, thumbnail: true,
      category: true, sourceStore: true, isActive: true, isFeatured: true,
    },
  });

  const docs = allProducts.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description || "",
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    thumbnail: p.thumbnail,
    category: p.category,
    sourceStore: p.sourceStore,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
  }));

  await meili.index("products").addDocuments(docs);
  console.log(`Re-indexed ${docs.length} products in Meilisearch`);

  await prisma.$disconnect();
  await pool.end();
}

backfill().catch(console.error);
