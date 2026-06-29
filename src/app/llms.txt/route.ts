import { db } from "@/lib/db";
import { SITE_URL, BRAND } from "@/lib/seo";

// llms.txt — machine-readable store summary for AI search engines
// (ChatGPT, Perplexity, Google AI Overviews). A growing new-visitor channel.
export const revalidate = 3600;

export async function GET() {
  let categories: { title: string; slug: string }[] = [];
  let productCount = 0;
  try {
    const [cols, count] = await Promise.all([
      db.collection.findMany({
        where: { isActive: true },
        select: { title: true, slug: true },
        orderBy: { sortOrder: "asc" },
      }),
      db.product.count({ where: { isActive: true } }),
    ]);
    categories = cols;
    productCount = count;
  } catch {
    // DB unavailable — emit the static summary only.
  }

  const lines = [
    `# ${BRAND}`,
    "",
    `> ${BRAND} është dyqan online në Kosovë me ${productCount ? `${productCount}+ ` : ""}produkte: ` +
      `teknologji, shtëpi, kuzhinë, mobilje, bukuri, fëmijë e lodra. Pagesë në dorë (COD), ` +
      `dërgesë 1–3 ditë në të gjithë Kosovën, kthim falas brenda 14 ditësh.`,
    "",
    "## Detaje",
    `- Vendndodhja: Kosovë (shërben të gjithë vendin)`,
    `- Pagesa: pagesë në dorë / cash on delivery (COD)`,
    `- Dërgesa: 1–3 ditë pune`,
    `- Kthimi: falas brenda 14 ditësh`,
    `- Gjuha: shqip`,
    `- Faqja: ${SITE_URL}`,
    "",
    "## Kategoritë",
    ...categories.map((c) => `- ${c.title}: ${SITE_URL}/koleksion/${c.slug}`),
    "",
    "## Lidhje",
    `- Të gjitha produktet: ${SITE_URL}/koleksion/te-gjitha`,
    `- Kërko: ${SITE_URL}/kerko`,
    `- Pyetje të shpeshta: ${SITE_URL}/pyetje`,
    `- Dërgesa: ${SITE_URL}/dergimi`,
    `- Kontakt: ${SITE_URL}/kontakt`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
