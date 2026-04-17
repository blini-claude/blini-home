const pg = require("pg");
const pool = new pg.Pool({ connectionString: "postgresql://blini_home:BliniHome2026!@127.0.0.1:5432/blini_home" });
(async () => {
  const { rows } = await pool.query(`SELECT COUNT(*) as total, COUNT(thumbnail) as with_thumb FROM "Product" WHERE "isActive" = true`);
  console.log("All active:", rows[0]);
  const { rows: r2 } = await pool.query(`SELECT p.title, p.thumbnail IS NOT NULL as has_thumb FROM "Product" p JOIN "ProductCollection" pc ON pc."productId" = p.id JOIN "Collection" c ON c.id = pc."collectionId" WHERE c.slug = 'shtepi-kuzhine' AND p."isActive" = true ORDER BY p."createdAt" DESC LIMIT 24 OFFSET 24`);
  console.log("Page 2 products:", r2.length, "with thumbs:", r2.filter(r => r.has_thumb).length);
  r2.filter(r => !r.has_thumb).forEach(r => console.log("  NO THUMB:", r.title));
  await pool.end();
})();
