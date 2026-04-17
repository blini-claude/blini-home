import * as cheerio from "cheerio";
import { ScrapedProduct, ScraperAdapter } from "./types";
import { fetchWithRetry, parsePrice, slugify, extractTextContent } from "./utils";

const BASE_URL = "https://tregu.shop";
const WC_API_BASE = `${BASE_URL}/wp-json/wc/v3`;

export class TreguScraper implements ScraperAdapter {
  name = "Tregu.shop";
  sourceStore = "tregu" as const;
  private wcKey: string | null;
  private wcSecret: string | null;

  constructor() {
    this.wcKey = process.env.TREGU_WC_KEY || null;
    this.wcSecret = process.env.TREGU_WC_SECRET || null;
  }

  private get useApi(): boolean {
    return !!(this.wcKey && this.wcSecret);
  }

  async *scrapeAll(): AsyncGenerator<ScrapedProduct[], void, unknown> {
    if (this.useApi) {
      // Probe the API — if the key is rejected, fall back to HTML so the
      // whole sync doesn't silently yield zero products.
      const probe = await fetchWithRetry(
        `${WC_API_BASE}/products?per_page=1&consumer_key=${this.wcKey}&consumer_secret=${this.wcSecret}`
      ).catch(() => null);
      if (probe && probe.ok) {
        yield* this.scrapeViaApi();
        return;
      }
      console.warn(`Tregu API unavailable (${probe?.status ?? "network"}), falling back to HTML scrape`);
    }
    yield* this.scrapeViaHtml();
  }

  private async *scrapeViaApi(): AsyncGenerator<ScrapedProduct[], void, unknown> {
    let page = 1;
    const perPage = 100;

    while (true) {
      const url = `${WC_API_BASE}/products?per_page=${perPage}&page=${page}&consumer_key=${this.wcKey}&consumer_secret=${this.wcSecret}`;
      const response = await fetchWithRetry(url);

      if (!response.ok) {
        console.error(`Tregu API error: ${response.status}`);
        break;
      }

      const products = await response.json();
      if (!Array.isArray(products) || products.length === 0) break;

      const scraped: ScrapedProduct[] = products.map((p: any) => ({
        sourceStore: "tregu" as const,
        sourceId: String(p.id),
        sourceUrl: p.permalink || `${BASE_URL}/product/${p.slug}`,
        title: p.name,
        description: extractTextContent(p.description || ""),
        price: parsePrice(p.price || p.regular_price || "0"),
        compareAtPrice: p.sale_price && p.regular_price
          ? parsePrice(p.regular_price)
          : null,
        images: (p.images || []).map((img: any) => img.src).filter(Boolean),
        category: (p.categories || []).map((c: any) => c.name).join(", ") || "Të përgjithshme",
        inStock: p.stock_status !== "outofstock",
      }));

      yield scraped;
      if (products.length < perPage) break;
      page++;
    }
  }

  private async *scrapeViaHtml(): AsyncGenerator<ScrapedProduct[], void, unknown> {
    let page = 1;

    while (true) {
      // Tregu.shop uses Albanian localization: /shitorja/ instead of /shop/
      const url = page === 1
        ? `${BASE_URL}/shitorja/`
        : `${BASE_URL}/shitorja/page/${page}/`;

      let response: Response;
      try {
        response = await fetchWithRetry(url);
      } catch {
        break;
      }

      if (!response.ok) break;

      const html = await response.text();
      const $ = cheerio.load(html);
      const productLinks: string[] = [];

      // Tregu.shop uses /produkti/ instead of /product/ (Albanian WooCommerce localization)
      $("a.woocommerce-LoopProduct-link, .woo-loop-product__title a, .product a[href*='/produkti/']").each((_, el) => {
        const href = $(el).attr("href");
        if (href && href.includes("/produkti/") && !productLinks.includes(href)) {
          productLinks.push(href);
        }
      });

      if (productLinks.length === 0) break;

      const batch: ScrapedProduct[] = [];
      for (const link of productLinks) {
        const product = await this.scrapeProduct(link);
        if (product) batch.push(product);
        await new Promise((r) => setTimeout(r, 500));
      }

      yield batch;

      const hasNext = $("a.next.page-numbers").length > 0;
      if (!hasNext) break;
      page++;
    }
  }

  async scrapeProduct(url: string): Promise<ScrapedProduct | null> {
    try {
      const response = await fetchWithRetry(url);
      if (!response.ok) return null;

      const html = await response.text();
      const $ = cheerio.load(html);

      const title = $("h1.product_title, .product_title").first().text().trim();
      if (!title) return null;

      const description = $(".woocommerce-product-details__short-description, .product-description")
        .first().text().trim() || null;

      const priceEl = $(".price ins .woocommerce-Price-amount, .price .woocommerce-Price-amount").first();
      const price = parsePrice(priceEl.text());

      const regularPriceEl = $(".price del .woocommerce-Price-amount").first();
      const compareAtPrice = regularPriceEl.length ? parsePrice(regularPriceEl.text()) : null;

      const images: string[] = [];
      $(
        ".woocommerce-product-gallery__image img, .woocommerce-product-gallery .splide__slide img, .product-images img, .woocommerce-main-image img"
      ).each((_, el) => {
        const src =
          $(el).attr("data-zoom-image") ||
          $(el).attr("data-large_image") ||
          $(el).attr("data-splide-lazy") ||
          $(el).attr("data-src") ||
          $(el).attr("src");
        if (src && !src.includes("placeholder") && !images.includes(src)) images.push(src);
      });

      const category = $(".posted_in a, .product_meta .posted_in a").first().text().trim() || "Të përgjithshme";
      // Only inspect the main product summary — the related-products carousel
      // at the bottom renders .out-of-stock ribbons for unrelated SKUs.
      const summary = $(".mf-summary-meta, .summary.entry-summary, .product-summary-wrap").first();
      const hasInStock = summary.find(".stock.in-stock, p.stock.in-stock").length > 0;
      const hasOutOfStock = summary.find(".stock.out-of-stock, p.stock.out-of-stock").length > 0;
      // Woo marks in-stock products as .stock.in-stock in the summary. When
      // neither flag is present (e.g. variable products), default to in-stock
      // rather than hiding the product.
      const inStock = hasInStock || !hasOutOfStock;
      const sourceId = url.replace(/\/$/, "").split("/").pop() || slugify(title);

      return {
        sourceStore: "tregu",
        sourceId,
        sourceUrl: url,
        title,
        description,
        price,
        compareAtPrice,
        images,
        category,
        inStock,
      };
    } catch (err) {
      console.error(`Error scraping ${url}:`, err);
      return null;
    }
  }
}
