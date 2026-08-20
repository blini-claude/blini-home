import { db } from "@/lib/db";

/**
 * Product feed for the Meta (Facebook/Instagram) commerce catalog, in the
 * RSS 2.0 + g: dialect Meta shares with Google Shopping. Meta fetches this URL
 * on a schedule; nothing here is for humans.
 *
 * The `id` we emit is the Prisma product id, and it is the ONE value that has
 * to agree with the pixel: a Meta sales campaign can only show a product card
 * when the ViewContent/AddToCart/Purchase event carries a content_id that
 * exists in the catalog. Change the id here and every dynamic ad goes blank.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blinihome.com";
const BRAND = "BLINI HOME";
const CURRENCY = "EUR";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Meta rejects an item whose description is empty and truncates past 9,999
// characters; strip the HTML the source stores leave behind.
function plain(s: string | null | undefined, fallback: string): string {
  const text = (s ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (text.length >= 10 ? text : fallback).slice(0, 4000);
}

// Most source shops write titles in full caps ("APARAT PËR KAFE TURKE"), which
// Meta flags on every ingest and renders badly in an ad. Only shouted titles are
// touched — a normally-cased one is left exactly as the shop wrote it.
const LOWER_WORDS = new Set(["për", "me", "dhe", "nga", "në", "e", "i", "të", "së", "ose", "a", "sipas"]);

function calmTitle(raw: string): string {
  const letters = raw.replace(/[^\p{L}]/gu, "");
  if (letters.length < 6) return raw;
  const upper = (raw.match(/\p{Lu}/gu) ?? []).length;
  if (upper / letters.length < 0.7) return raw;

  return raw
    .toLocaleLowerCase("sq")
    .split(/(\s+)/)
    .map((word, i) => {
      if (!word.trim()) return word;
      // Codes and sizes stay as they are: "3D", "50ML", "A4".
      if (/\d/.test(word)) return word.toLocaleUpperCase("sq");
      if (i > 0 && LOWER_WORDS.has(word)) return word;
      return word.charAt(0).toLocaleUpperCase("sq") + word.slice(1);
    })
    .join("");
}

function absolute(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

// Dynamic on purpose: route handlers are only cached in Next 16 with
// force-static, and force-static would freeze the feed at build time. The
// Cache-Control header below is what keeps Meta's fetcher off the database.
export async function GET() {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      price: true,
      compareAtPrice: true,
      images: true,
      thumbnail: true,
      category: true,
      tags: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const items: string[] = [];
  for (const p of products) {
    // Full-size first, thumbnail only as a fallback: the thumbs are 600px and
    // Meta prefers 1024 for feed images, cropping quality down from what we
    // already host at 800.
    const image = p.images[0] || p.thumbnail;
    // No image, no card — Meta drops the item anyway, and a rejected row in the
    // feed report is noise we would have to read every week.
    if (!image) continue;

    const price = Number(p.price);
    if (!Number.isFinite(price) || price <= 0) continue;
    const compare = p.compareAtPrice ? Number(p.compareAtPrice) : null;
    const onSale = compare !== null && compare > price;

    const extra = p.images
      .filter((u) => u && u !== image)
      .slice(0, 10)
      .map((u) => `      <g:additional_image_link>${esc(absolute(u))}</g:additional_image_link>`)
      .join("\n");

    items.push(
      [
        "    <item>",
        `      <g:id>${esc(p.id)}</g:id>`,
        `      <g:title>${esc(calmTitle(p.title).slice(0, 150))}</g:title>`,
        `      <g:description>${esc(plain(p.description, p.title))}</g:description>`,
        `      <g:link>${esc(`${BASE_URL}/produkt/${p.slug}`)}</g:link>`,
        `      <g:image_link>${esc(absolute(image))}</g:image_link>`,
        extra,
        // Everything in this feed is already filtered on isActive, which is the
        // real sellability flag — the `stock` column is hardcoded to 0 by the
        // importer and means nothing.
        "      <g:availability>in stock</g:availability>",
        "      <g:condition>new</g:condition>",
        // On sale, Meta wants the crossed-out price in <price> and the real one
        // in <sale_price> — the other way round shows no discount at all.
        `      <g:price>${(onSale ? compare! : price).toFixed(2)} ${CURRENCY}</g:price>`,
        onSale ? `      <g:sale_price>${price.toFixed(2)} ${CURRENCY}</g:sale_price>` : "",
        `      <g:brand>${esc(BRAND)}</g:brand>`,
        `      <g:product_type>${esc(p.category)}</g:product_type>`,
        p.tags.length ? `      <g:custom_label_0>${esc(p.tags[0])}</g:custom_label_0>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n` +
    `  <channel>\n` +
    `    <title>${esc(BRAND)}</title>\n` +
    `    <link>${esc(BASE_URL)}</link>\n` +
    `    <description>Katalogu i produkteve BLINI HOME</description>\n` +
    items.join("\n") +
    `\n  </channel>\n</rss>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
