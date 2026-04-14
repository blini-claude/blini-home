import * as cheerio from "cheerio";
import { ScrapedProduct, ScraperAdapter } from "./types";
import { fetchWithRetry, parsePrice, slugify, extractTextContent } from "./utils";

const BASE_URL = "https://shporta.shop";
const WC_API_BASE = `${BASE_URL}/wp-json/wc/v3`;

export class ShportaScraper implements ScraperAdapter {
  name = "Shporta.shop";
  sourceStore = "shporta" as const;
  private wcKey: string | null;
  private wcSecret: string | null;

  constructor() {
    this.wcKey = process.env.SHPORTA_WC_KEY || null;
    this.wcSecret = process.env.SHPORTA_WC_SECRET || null;
  }

  private get useApi(): boolean {
    return !!(this.wcKey && this.wcSecret);
  }

  async *scrapeAll(): AsyncGenerator<ScrapedProduct[], void, unknown> {
    if (this.useApi) {
      yield* this.scrapeViaApi();
    } else {
      yield* this.scrapeViaHtml();
    }
  }

  private async *scrapeViaApi(): AsyncGenerator<ScrapedProduct[], void, unknown> {
    let page = 1;
    const perPage = 100;

    while (true) {
      const url = `${WC_API_BASE}/products?per_page=${perPage}&page=${page}&consumer_key=${this.wcKey}&consumer_secret=${this.wcSecret}`;
      const response = await fetchWithRetry(url);

      if (!response.ok) {
        console.error(`Shporta API error: ${response.status}`);
        break;
      }

      const products = await response.json();
      if (!Array.isArray(products) || products.length === 0) break;

      const scraped: ScrapedProduct[] = products.map((p: any) => ({
        sourceStore: "shporta" as const,
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
      const url = page === 1
        ? `${BASE_URL}/shop/`
        : `${BASE_URL}/shop/page/${page}/`;

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

      $("a.woocommerce-LoopProduct-link, .product a[href*='/product/']").each((_, el) => {
        const href = $(el).attr("href");
        if (href && !productLinks.includes(href)) {
          productLinks.push(href);
        }
      });

      if (productLinks.length === 0) break;

      const batch: ScrapedProduct[] = [];
      for (const link of productLinks) {
        const product = await this.scrapeProduct(link);
        if (product) batch.push(product);
        // Rate limit
        await new Promise((r) => setTimeout(r, 500));
      }

      yield batch;

      // Check if there's a next page
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
      $(".woocommerce-product-gallery__image img, .product-images img").each((_, el) => {
        const src = $(el).attr("data-large_image") || $(el).attr("data-src") || $(el).attr("src");
        if (src && !src.includes("placeholder")) images.push(src);
      });

      const category = $(".posted_in a, .product_meta .posted_in a").first().text().trim() || "Të përgjithshme";

      const inStock = !$(".out-of-stock").length;

      // Extract source ID from URL
      const sourceId = url.replace(/\/$/, "").split("/").pop() || slugify(title);

      return {
        sourceStore: "shporta",
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
