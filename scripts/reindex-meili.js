const pg = require("pg");
const { Meilisearch } = require("meilisearch");

const meili = new Meilisearch({
  host: "http://127.0.0.1:7700",
  apiKey: "blini_home_meili_2026",
});
const pool = new pg.Pool({
  connectionString:
    "postgresql://blini_home:BliniHome2026!@127.0.0.1:5432/blini_home",
});

(async () => {
  const { rows: products } = await pool.query(
    `SELECT p.id, p.title, p.slug, p.description, p.price, p."compareAtPrice",
            p.thumbnail, p.category, p."sourceStore", p."isActive", p."isFeatured", p.tags
     FROM "Product" p WHERE p."isActive" = true`
  );
  console.log("Total active products:", products.length);
  console.log("With thumbnail:", products.filter((p) => p.thumbnail).length);
  console.log(
    "Without thumbnail:",
    products.filter((p) => !p.thumbnail).length
  );

  // Get collection mappings
  const { rows: collMappings } = await pool.query(
    `SELECT pc."productId", c.slug FROM "ProductCollection" pc JOIN "Collection" c ON c.id = pc."collectionId"`
  );
  const collMap = {};
  for (const m of collMappings) {
    if (!collMap[m.productId]) collMap[m.productId] = [];
    collMap[m.productId].push(m.slug);
  }

  const docs = products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    thumbnail: p.thumbnail,
    category: p.category,
    sourceStore: p.sourceStore,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    tags: p.tags || [],
    collections: collMap[p.id] || [],
  }));

  const result = await meili.index("products").addDocuments(docs);
  console.log("Meilisearch update task:", result.taskUid);

  // Wait for task to complete
  const task = await meili.waitForTask(result.taskUid);
  console.log("Task status:", task.status);

  // Verify
  const searchResult = await meili
    .index("products")
    .search("floke", { limit: 3, attributesToRetrieve: ["title", "thumbnail"] });
  console.log("Verification - search 'floke':");
  searchResult.hits.forEach((h) =>
    console.log(`  ${h.title}: thumbnail=${h.thumbnail ? "YES" : "NULL"}`)
  );

  await pool.end();
})();
