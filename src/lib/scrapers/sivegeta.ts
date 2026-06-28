import * as cheerio from "cheerio";
import { ScrapedProduct, ScraperAdapter } from "./types";
import { fetchWithRetry, parsePrice, slugify } from "./utils";

const BASE_URL = "https://sivegeta.com";

export class SivegetaScraper implements ScraperAdapter {
  name = "Sivegeta";
  sourceStore = "sivegeta" as const;

  async *scrapeAll(): AsyncGenerator<ScrapedProduct[], void, unknown> {
    yield* this.scrapeViaJson();
  }

  private async *scrapeViaJson(): AsyncGenerator<ScrapedProduct[], void, unknown> {
    let page = 1;
    while (true) {
      const url = `${BASE_URL}/products.json?limit=250&page=${page}`;
      let response: Response;
      try {
        response = await fetchWithRetry(url);
      } catch {
        break;
      }
      if (!response.ok) {
        if (page === 1) yield* this.scrapeViaHtml();
        break;
      }
      const data = await response.json();
      const products = data?.products;
      if (!Array.isArray(products) || products.length === 0) break;
      const batch: ScrapedProduct[] = products.map((p: any) => {
        const variant = p.variants?.[0];
        return {
          sourceStore: "sivegeta" as const,
          sourceId: String(p.id),
          sourceUrl: `${BASE_URL}/products/${p.handle}`,
          title: p.title,
          description: p.body_html?.replace(/<[^>]*>/g, "").trim() || null,
          price: parseFloat(variant?.price || "0"),
          compareAtPrice: variant?.compare_at_price
            ? parseFloat(variant.compare_at_price)
            : null,
          images: (p.images || []).map((img: any) => img.src),
          category: p.product_type || "Të përgjithshme",
          inStock: variant?.available ?? true,
        };
      });
      yield batch;
      if (products.length < 250) break;
      page++;
    }
  }

  private async *scrapeViaHtml(): AsyncGenerator<ScrapedProduct[], void, unknown> {
    let page = 1;
    while (true) {
      const url = `${BASE_URL}/collections/all?page=${page}`;
      let response: Response;
      try {
        response = await fetchWithRetry(url);
      } catch {
        break;
      }
      if (!response.ok) break;
      const html = await response.text();
      const $ = cheerio.load(html);
      const links: string[] = [];
      $("a[href*='/products/']").each((_, el) => {
        const href = $(el).attr("href");
        if (href) {
          const full = href.startsWith("http") ? href : `${BASE_URL}${href}`;
          if (!links.includes(full)) links.push(full);
        }
      });
      if (links.length === 0) break;
      const batch: ScrapedProduct[] = [];
      for (const link of links) {
        const product = await this.scrapeProduct(link);
        if (product) batch.push(product);
        await new Promise((r) => setTimeout(r, 500));
      }
      yield batch;
      page++;
      if (links.length < 20) break;
    }
  }

  async scrapeProduct(url: string): Promise<ScrapedProduct | null> {
    try {
      const jsonUrl = url.replace(/\/$/, "") + ".json";
      const jsonResponse = await fetchWithRetry(jsonUrl);
      if (jsonResponse.ok) {
        const data = await jsonResponse.json();
        const p = data.product;
        if (!p) return null;
        const variant = p.variants?.[0];
        return {
          sourceStore: "sivegeta",
          sourceId: String(p.id),
          sourceUrl: url,
          title: p.title,
          description: p.body_html?.replace(/<[^>]*>/g, "").trim() || null,
          price: parseFloat(variant?.price || "0"),
          compareAtPrice: variant?.compare_at_price
            ? parseFloat(variant.compare_at_price)
            : null,
          images: (p.images || []).map((img: any) => img.src),
          category: p.product_type || "Të përgjithshme",
          inStock: variant?.available ?? true,
        };
      }
      const response = await fetchWithRetry(url);
      if (!response.ok) return null;
      const html = await response.text();
      const $ = cheerio.load(html);
      const title = $("h1").first().text().trim();
      if (!title) return null;
      const priceText = $("[class*='price'] .money, .product-price .money").first().text();
      const handle = url.split("/products/")[1]?.replace(/\/$/, "") || slugify(title);
      const images: string[] = [];
      $("img[src*='cdn.shopify'], img[data-src*='cdn.shopify']").each((_, el) => {
        const src = $(el).attr("data-src") || $(el).attr("src");
        if (src) images.push(src.startsWith("//") ? `https:${src}` : src);
      });
      return {
        sourceStore: "sivegeta",
        sourceId: handle,
        sourceUrl: url,
        title,
        description:
          $(".product-description, [class*='description']").first().text().trim() || null,
        price: parsePrice(priceText),
        compareAtPrice: null,
        images,
        category: "Të përgjithshme",
        inStock: true,
      };
    } catch (err) {
      console.error(`Error scraping ${url}:`, err);
      return null;
    }
  }
}
