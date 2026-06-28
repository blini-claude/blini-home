import "dotenv/config";
import { db } from "../src/lib/db";
import { autoProductDescription, productSeoTitle, productSeoDescription } from "../src/lib/seo";

async function main() {
  const products = await db.product.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      tags: true,
      price: true,
      compareAtPrice: true,
    },
  });
  console.log(`SEO backfill: ${products.length} products`);
  let done = 0;
  for (const p of products) {
    const seo = {
      title: p.title,
      slug: p.slug,
      category: p.category,
      tags: p.tags,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
    };
    const description = autoProductDescription(seo);
    await db.product.update({
      where: { id: p.id },
      data: {
        description,
        metaTitle: productSeoTitle(seo),
        metaDescription: productSeoDescription({ ...seo, description }),
      },
    });
    if (++done % 200 === 0) console.log(`  ${done}/${products.length}`);
  }
  console.log(`Done: ${done} products updated.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
