import * as cheerio from "cheerio";
import { ScrapedProduct, ScraperAdapter } from "./types";
import { fetchWithRetry, parsePrice, slugify } from "./utils";

const BASE_URL = "https://bennygroup.store";

export class BennyScraper implements ScraperAdapter {
  name = "BennyGroup";
  sourceStore = "benny" as const;
  private shopifyToken: string | null;

  constructor() {
    this.shopifyToken = process.env.BENNY_SHOPIFY_TOKEN || null;
  }

  private get useApi(): boolean {
    return !!this.shopifyToken;
  }

  async *scrapeAll(): AsyncGenerator<ScrapedProduct[], void, unknown> {
    if (this.useApi) {
      yield* this.scrapeViaApi();
    } else {
      yield* this.scrapeViaJson();
    }
  }

  private async *scrapeViaApi(): AsyncGenerator<ScrapedProduct[], void, unknown> {
    let cursor: string | null = null;

    while (true) {
      const query = `{
        products(first: 50${cursor ? `, after: "${cursor}"` : ""}) {
          edges {
            cursor
            node {
              id
              title
              handle
              descriptionHtml
              productType
              images(first: 10) { edges { node { url } } }
              variants(first: 1) {
                edges {
                  node {
                    price { amount }
                    compareAtPrice { amount }
                    availableForSale
                  }
                }
              }
            }
          }
          pageInfo { hasNextPage }
        }
      }`;

      const response = await fetchWithRetry(`${BASE_URL}/api/2024-01/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": this.shopifyToken!,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) break;

      const data = await response.json();
      const edges = data?.data?.products?.edges;
      if (!edges?.length) break;

      const batch: ScrapedProduct[] = edges.map((edge: any) => {
        const node = edge.node;
        const variant = node.variants.edges[0]?.node;
        return {
          sourceStore: "benny" as const,
          sourceId: node.id.replace("gid://shopify/Product/", ""),
          sourceUrl: `${BASE_URL}/products/${node.handle}`,
          title: node.title,
          description: node.descriptionHtml?.replace(/<[^>]*>/g, "").trim() || null,
          price: parseFloat(variant?.price?.amount || "0"),
          compareAtPrice: variant?.compareAtPrice
            ? parseFloat(variant.compareAtPrice.amount)
            : null,
          images: node.images.edges.map((img: any) => img.node.url),
          category: node.productType || "Të përgjithshme",
          inStock: variant?.availableForSale ?? true,
        };
      });

      yield batch;
      cursor = edges[edges.length - 1].cursor;

      if (!data.data.products.pageInfo.hasNextPage) break;
    }
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
        if (page === 1) {
          yield* this.scrapeViaHtml();
        }
        break;
      }

      const data = await response.json();
      const products = data?.products;
      if (!Array.isArray(products) || products.length === 0) break;

      const batch: ScrapedProduct[] = products.map((p: any) => {
        const variant = p.variants?.[0];
        return {
          sourceStore: "benny" as const,
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
      const productLinks: string[] = [];

      $("a[href*='/products/']").each((_, el) => {
        const href = $(el).attr("href");
        if (href) {
          const fullUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
          if (!productLinks.includes(fullUrl)) productLinks.push(fullUrl);
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
      page++;
      if (productLinks.length < 20) break;
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
          sourceStore: "benny",
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

      // Fallback to HTML
      const response = await fetchWithRetry(url);
      if (!response.ok) return null;

      const html = await response.text();
      const $ = cheerio.load(html);

      const title = $("h1").first().text().trim();
      if (!title) return null;

      const priceText = $("[class*='price'] .money, .product-price .money").first().text();
      const price = parsePrice(priceText);
      const handle = url.split("/products/")[1]?.replace(/\/$/, "") || slugify(title);

      const images: string[] = [];
      $("img[src*='cdn.shopify'], img[data-src*='cdn.shopify']").each((_, el) => {
        const src = $(el).attr("data-src") || $(el).attr("src");
        if (src) images.push(src.startsWith("//") ? `https:${src}` : src);
      });

      return {
        sourceStore: "benny",
        sourceId: handle,
        sourceUrl: url,
        title,
        description: $(".product-description, [class*='description']").first().text().trim() || null,
        price,
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
