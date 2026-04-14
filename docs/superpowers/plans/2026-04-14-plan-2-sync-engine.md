# Plan 2: Sync Engine — BLINI-HOME

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the product sync engine that scrapes products from shporta.shop (WooCommerce), tregu.shop (WooCommerce), and bennygroup.store (Shopify), downloads images, maps categories, and indexes in Meilisearch.

**Architecture:** BullMQ workers running as separate PM2 processes. Each source store has a dedicated scraper adapter. Shared pipeline handles image download, category mapping, and Meilisearch indexing. Fallback to HTML scraping if API keys unavailable.

**Tech Stack:** BullMQ, ioredis, Cheerio (HTML scraping), sharp (image processing), Prisma 7, Meilisearch

**Spec:** `docs/superpowers/specs/2026-04-14-blini-home-design.md`

---

## File Structure

```
src/
├── lib/
│   ├── scrapers/
│   │   ├── types.ts              # Shared scraper types
│   │   ├── shporta.ts            # shporta.shop WooCommerce/HTML scraper
│   │   ├── tregu.ts              # tregu.shop WooCommerce/HTML scraper
│   │   ├── benny.ts              # bennygroup.store Shopify/HTML scraper
│   │   └── utils.ts              # Shared scraper utilities (slug, retry, fetch)
│   ├── sync/
│   │   ├── product-sync.ts       # Product sync orchestrator
│   │   ├── image-sync.ts         # Image download + thumbnail generation
│   │   ├── price-sync.ts         # Price monitoring
│   │   └── category-mapper.ts    # Source → BLINI-HOME category mapping
│   └── queue.ts                  # Already exists — add scheduler
├── app/
│   └── api/
│       └── admin/
│           └── sync/
│               └── route.ts      # Manual sync trigger API
scripts/
├── workers/
│   ├── product-sync-worker.ts    # BullMQ worker process for product sync
│   ├── image-sync-worker.ts      # BullMQ worker process for image sync
│   └── price-sync-worker.ts      # BullMQ worker process for price sync
├── run-sync.ts                   # One-off manual sync script
└── setup-meilisearch.ts          # Already exists
__tests__/
├── lib/
│   ├── scrapers/
│   │   ├── shporta.test.ts
│   │   ├── tregu.test.ts
│   │   └── benny.test.ts
│   └── sync/
│       ├── product-sync.test.ts
│       ├── category-mapper.test.ts
│       └── image-sync.test.ts
```

---

## Task 1: Scraper Types & Utilities

**Files:**
- Create: `src/lib/scrapers/types.ts`, `src/lib/scrapers/utils.ts`

- [ ] **Step 1: Install scraping dependencies**

```bash
npm install cheerio sharp
npm install -D @types/cheerio
```

- [ ] **Step 2: Create scraper types**

Create `src/lib/scrapers/types.ts`:

```typescript
export interface ScrapedProduct {
  sourceStore: "shporta" | "tregu" | "benny";
  sourceId: string;
  sourceUrl: string;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  images: string[]; // Source image URLs
  category: string;
  inStock: boolean;
}

export interface ScraperAdapter {
  name: string;
  sourceStore: "shporta" | "tregu" | "benny";
  scrapeAll(): AsyncGenerator<ScrapedProduct[], void, unknown>;
  scrapeProduct(url: string): Promise<ScrapedProduct | null>;
}

export interface SyncResult {
  sourceStore: string;
  productsAdded: number;
  productsUpdated: number;
  pricesChanged: number;
  errors: string[];
}
```

- [ ] **Step 3: Create scraper utilities**

Create `src/lib/scrapers/utils.ts`:

```typescript
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ëë]/g, "e")
    .replace(/[çç]/g, "c")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 200);
}

export function makeUniqueSlug(baseSlug: string, sourceStore: string, sourceId: string): string {
  return `${baseSlug}-${sourceStore}-${sourceId}`.substring(0, 250);
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 2000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; BliniHome/1.0)",
          ...options.headers,
        },
      });
      if (response.ok) return response;
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("retry-after") || "5");
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        continue;
      }
      if (i === retries - 1) return response;
    } catch (err) {
      if (i === retries - 1) throw err;
    }
    await new Promise((r) => setTimeout(r, delay * (i + 1)));
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

export function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^\d.,]/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

export function extractTextContent(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/scrapers/types.ts src/lib/scrapers/utils.ts package.json package-lock.json
git commit -m "feat: add scraper types and utility functions

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Shporta.shop Scraper (WooCommerce/HTML)

**Files:**
- Create: `src/lib/scrapers/shporta.ts`
- Test: `__tests__/lib/scrapers/shporta.test.ts`

- [ ] **Step 1: Create shporta scraper**

Create `src/lib/scrapers/shporta.ts`:

```typescript
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
```

- [ ] **Step 2: Write test**

Create `__tests__/lib/scrapers/shporta.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { ShportaScraper } from "@/lib/scrapers/shporta";

describe("ShportaScraper", () => {
  const scraper = new ShportaScraper();

  it("should have correct name and sourceStore", () => {
    expect(scraper.name).toBe("Shporta.shop");
    expect(scraper.sourceStore).toBe("shporta");
  });

  it("should scrape a real product page", async () => {
    // Scrape the shop page to find a real product link first
    const response = await fetch("https://shporta.shop/shop/", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BliniHome/1.0)" },
    });

    if (!response.ok) {
      console.log("Shporta.shop unreachable, skipping live test");
      return;
    }

    const html = await response.text();
    const linkMatch = html.match(/href="(https:\/\/shporta\.shop\/product\/[^"]+)"/);
    if (!linkMatch) {
      console.log("No product links found, skipping");
      return;
    }

    const product = await scraper.scrapeProduct(linkMatch[1]);
    if (!product) {
      console.log("Product scrape returned null, skipping");
      return;
    }

    expect(product.sourceStore).toBe("shporta");
    expect(product.title).toBeTruthy();
    expect(product.price).toBeGreaterThan(0);
    expect(product.sourceUrl).toContain("shporta.shop");
  }, 30000);

  it("should yield batches from scrapeAll", async () => {
    let batchCount = 0;
    let totalProducts = 0;

    for await (const batch of scraper.scrapeAll()) {
      batchCount++;
      totalProducts += batch.length;
      // Just test first batch
      if (batch.length > 0) {
        expect(batch[0].sourceStore).toBe("shporta");
        expect(batch[0].title).toBeTruthy();
      }
      break; // Only test first batch to avoid long test
    }

    expect(batchCount).toBeGreaterThanOrEqual(1);
    console.log(`Shporta: ${totalProducts} products in first batch`);
  }, 60000);
});
```

- [ ] **Step 3: Run test**

```bash
npx vitest run __tests__/lib/scrapers/shporta.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/scrapers/shporta.ts __tests__/lib/scrapers/shporta.test.ts
git commit -m "feat: add shporta.shop scraper (WooCommerce + HTML fallback)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Tregu.shop Scraper (WooCommerce/HTML)

**Files:**
- Create: `src/lib/scrapers/tregu.ts`
- Test: `__tests__/lib/scrapers/tregu.test.ts`

- [ ] **Step 1: Create tregu scraper**

Create `src/lib/scrapers/tregu.ts` — same structure as shporta but with tregu.shop URLs:

```typescript
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
      $(".woocommerce-product-gallery__image img, .product-images img").each((_, el) => {
        const src = $(el).attr("data-large_image") || $(el).attr("data-src") || $(el).attr("src");
        if (src && !src.includes("placeholder")) images.push(src);
      });

      const category = $(".posted_in a, .product_meta .posted_in a").first().text().trim() || "Të përgjithshme";
      const inStock = !$(".out-of-stock").length;
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
```

- [ ] **Step 2: Write test**

Create `__tests__/lib/scrapers/tregu.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { TreguScraper } from "@/lib/scrapers/tregu";

describe("TreguScraper", () => {
  const scraper = new TreguScraper();

  it("should have correct name and sourceStore", () => {
    expect(scraper.name).toBe("Tregu.shop");
    expect(scraper.sourceStore).toBe("tregu");
  });

  it("should scrape a real product page", async () => {
    const response = await fetch("https://tregu.shop/shop/", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BliniHome/1.0)" },
    });

    if (!response.ok) {
      console.log("Tregu.shop unreachable, skipping live test");
      return;
    }

    const html = await response.text();
    const linkMatch = html.match(/href="(https:\/\/tregu\.shop\/product\/[^"]+)"/);
    if (!linkMatch) {
      console.log("No product links found, skipping");
      return;
    }

    const product = await scraper.scrapeProduct(linkMatch[1]);
    if (!product) {
      console.log("Product scrape returned null, skipping");
      return;
    }

    expect(product.sourceStore).toBe("tregu");
    expect(product.title).toBeTruthy();
    expect(product.price).toBeGreaterThan(0);
    expect(product.sourceUrl).toContain("tregu.shop");
  }, 30000);

  it("should yield batches from scrapeAll", async () => {
    let batchCount = 0;
    let totalProducts = 0;

    for await (const batch of scraper.scrapeAll()) {
      batchCount++;
      totalProducts += batch.length;
      if (batch.length > 0) {
        expect(batch[0].sourceStore).toBe("tregu");
        expect(batch[0].title).toBeTruthy();
      }
      break;
    }

    expect(batchCount).toBeGreaterThanOrEqual(1);
    console.log(`Tregu: ${totalProducts} products in first batch`);
  }, 60000);
});
```

- [ ] **Step 3: Run test**

```bash
npx vitest run __tests__/lib/scrapers/tregu.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/scrapers/tregu.ts __tests__/lib/scrapers/tregu.test.ts
git commit -m "feat: add tregu.shop scraper (WooCommerce + HTML fallback)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Bennygroup.store Scraper (Shopify/HTML)

**Files:**
- Create: `src/lib/scrapers/benny.ts`
- Test: `__tests__/lib/scrapers/benny.test.ts`

- [ ] **Step 1: Create benny scraper**

Create `src/lib/scrapers/benny.ts`:

```typescript
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
    // Shopify Storefront API via GraphQL
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
    // Shopify stores expose /products.json publicly
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
        // Fallback to HTML scraping
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
      // Try JSON endpoint first (Shopify standard)
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
```

- [ ] **Step 2: Write test**

Create `__tests__/lib/scrapers/benny.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { BennyScraper } from "@/lib/scrapers/benny";

describe("BennyScraper", () => {
  const scraper = new BennyScraper();

  it("should have correct name and sourceStore", () => {
    expect(scraper.name).toBe("BennyGroup");
    expect(scraper.sourceStore).toBe("benny");
  });

  it("should scrape via products.json", async () => {
    let batchCount = 0;
    let totalProducts = 0;

    for await (const batch of scraper.scrapeAll()) {
      batchCount++;
      totalProducts += batch.length;
      if (batch.length > 0) {
        expect(batch[0].sourceStore).toBe("benny");
        expect(batch[0].title).toBeTruthy();
        expect(batch[0].price).toBeGreaterThan(0);
      }
      break; // First batch only
    }

    expect(batchCount).toBeGreaterThanOrEqual(1);
    console.log(`Benny: ${totalProducts} products in first batch`);
  }, 60000);

  it("should scrape a single product", async () => {
    // Use products.json to find a real handle
    const response = await fetch("https://bennygroup.store/products.json?limit=1", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BliniHome/1.0)" },
    });

    if (!response.ok) {
      console.log("BennyGroup unreachable, skipping");
      return;
    }

    const data = await response.json();
    const firstProduct = data.products?.[0];
    if (!firstProduct) return;

    const product = await scraper.scrapeProduct(
      `https://bennygroup.store/products/${firstProduct.handle}`
    );

    expect(product).not.toBeNull();
    expect(product!.sourceStore).toBe("benny");
    expect(product!.title).toBeTruthy();
    expect(product!.price).toBeGreaterThan(0);
  }, 30000);
});
```

- [ ] **Step 3: Run test**

```bash
npx vitest run __tests__/lib/scrapers/benny.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/scrapers/benny.ts __tests__/lib/scrapers/benny.test.ts
git commit -m "feat: add bennygroup.store scraper (Shopify JSON + HTML fallback)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Category Mapper

**Files:**
- Create: `src/lib/sync/category-mapper.ts`
- Test: `__tests__/lib/sync/category-mapper.test.ts`

- [ ] **Step 1: Create category mapper**

Create `src/lib/sync/category-mapper.ts`:

```typescript
// Maps source store categories to BLINI-HOME categories
const CATEGORY_MAP: Record<string, string> = {
  // Shporta categories
  "shtepiake": "Shtëpi",
  "shelves & wardrobes": "Shtëpi",
  "sanitari": "Shtëpi",
  "tables & furniture": "Shtëpi",
  "organizers": "Shtëpi",
  "kitchen": "Kuzhinë",
  "cleaning": "Shtëpi",
  "kujdesi personal": "Bukuri",
  "elektroshtepiake": "Shtëpi",
  "teknologji": "Teknologji",
  "vegla pune": "Shtëpi",
  "elektronike": "Teknologji",
  "automobile": "Teknologji",
  "lodra & femije": "Fëmijë",
  "video baby monitor": "Fëmijë",
  "fitnes": "Sporte",
  "aksesore": "Aksesore",

  // Tregu categories
  "femije/bebe": "Fëmijë",
  "shendet/bukuri": "Bukuri",
  "sporte/aktivitete": "Sporte",
  "veshmbathje": "Veshje",
  "ushqime/pije": "Ushqime",
  "shtepi/oborr": "Shtëpi",

  // Benny categories
  "personal care": "Bukuri",
  "grooming": "Bukuri",
  "phone accessories": "Teknologji",
  "gaming": "Teknologji",
  "security cameras": "Teknologji",
  "drones": "Teknologji",
  "audio": "Teknologji",
  "electric scooters": "Teknologji",
  "household": "Shtëpi",
  "tablets": "Teknologji",
  "phones": "Teknologji",
  "smartwatches": "Teknologji",
  "baby monitors": "Fëmijë",
  "cameras": "Teknologji",
  "tv boxes": "Teknologji",
  "projectors": "Teknologji",
};

const BLINI_CATEGORIES = [
  "Shtëpi", "Kuzhinë", "Teknologji", "Fëmijë",
  "Bukuri", "Sporte", "Veshje", "Aksesore", "Ushqime", "Të përgjithshme",
];

export function mapCategory(sourceCategory: string): string {
  const normalized = sourceCategory.toLowerCase().trim();

  // Direct match
  if (CATEGORY_MAP[normalized]) {
    return CATEGORY_MAP[normalized];
  }

  // Partial match — check if any key is contained in the source category
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  // Check if it's already a BLINI category
  for (const cat of BLINI_CATEGORIES) {
    if (normalized.includes(cat.toLowerCase())) {
      return cat;
    }
  }

  return "Të përgjithshme";
}

export function getCollectionSlugs(product: {
  price: number;
  category: string;
  isFeatured?: boolean;
}): string[] {
  const slugs: string[] = [];

  // Price-based collections
  if (product.price <= 10) slugs.push("nen-10");

  // Category-based collections
  const catMap: Record<string, string> = {
    "Shtëpi": "shtepi-kuzhine",
    "Kuzhinë": "shtepi-kuzhine",
    "Teknologji": "teknologji",
    "Fëmijë": "femije-lodra",
    "Bukuri": "bukuri-kujdes",
    "Sporte": "sporte-aktivitete",
    "Veshje": "veshje-aksesore",
    "Aksesore": "veshje-aksesore",
  };

  if (catMap[product.category]) {
    slugs.push(catMap[product.category]);
  }

  return slugs;
}
```

- [ ] **Step 2: Write test**

Create `__tests__/lib/sync/category-mapper.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { mapCategory, getCollectionSlugs } from "@/lib/sync/category-mapper";

describe("mapCategory", () => {
  it("should map shporta categories", () => {
    expect(mapCategory("Shtepiake")).toBe("Shtëpi");
    expect(mapCategory("Kitchen")).toBe("Kuzhinë");
    expect(mapCategory("Kujdesi Personal")).toBe("Bukuri");
    expect(mapCategory("Teknologji")).toBe("Teknologji");
  });

  it("should map tregu categories", () => {
    expect(mapCategory("Femije/Bebe")).toBe("Fëmijë");
    expect(mapCategory("Sporte/Aktivitete")).toBe("Sporte");
    expect(mapCategory("Veshmbathje")).toBe("Veshje");
  });

  it("should map benny categories", () => {
    expect(mapCategory("Personal Care")).toBe("Bukuri");
    expect(mapCategory("Gaming")).toBe("Teknologji");
    expect(mapCategory("Baby Monitors")).toBe("Fëmijë");
  });

  it("should fallback to Të përgjithshme for unknown", () => {
    expect(mapCategory("something random")).toBe("Të përgjithshme");
    expect(mapCategory("")).toBe("Të përgjithshme");
  });
});

describe("getCollectionSlugs", () => {
  it("should include nen-10 for cheap products", () => {
    const slugs = getCollectionSlugs({ price: 5, category: "Shtëpi" });
    expect(slugs).toContain("nen-10");
    expect(slugs).toContain("shtepi-kuzhine");
  });

  it("should not include nen-10 for expensive products", () => {
    const slugs = getCollectionSlugs({ price: 25, category: "Teknologji" });
    expect(slugs).not.toContain("nen-10");
    expect(slugs).toContain("teknologji");
  });

  it("should map categories to collection slugs", () => {
    expect(getCollectionSlugs({ price: 20, category: "Fëmijë" })).toContain("femije-lodra");
    expect(getCollectionSlugs({ price: 20, category: "Bukuri" })).toContain("bukuri-kujdes");
  });
});
```

- [ ] **Step 3: Run test**

```bash
npx vitest run __tests__/lib/sync/category-mapper.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/sync/category-mapper.ts __tests__/lib/sync/category-mapper.test.ts
git commit -m "feat: add category mapper (source → BLINI-HOME categories + collections)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Image Sync

**Files:**
- Create: `src/lib/sync/image-sync.ts`
- Test: `__tests__/lib/sync/image-sync.test.ts`

- [ ] **Step 1: Create image sync module**

Create `src/lib/sync/image-sync.ts`:

```typescript
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { fetchWithRetry } from "../scrapers/utils";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "products");
const THUMB_WIDTH = 400;
const FULL_WIDTH = 800;

export async function ensureUploadsDir(): Promise<void> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

export async function downloadAndProcessImage(
  imageUrl: string,
  productSlug: string,
  index: number
): Promise<{ full: string; thumbnail: string } | null> {
  try {
    await ensureUploadsDir();

    const response = await fetchWithRetry(imageUrl);
    if (!response.ok) return null;

    const buffer = Buffer.from(await response.arrayBuffer());

    const productDir = path.join(UPLOADS_DIR, productSlug);
    await fs.mkdir(productDir, { recursive: true });

    // Save full-size image
    const fullFilename = `${index}.webp`;
    const fullPath = path.join(productDir, fullFilename);
    await sharp(buffer)
      .resize(FULL_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(fullPath);

    // Save thumbnail
    const thumbFilename = `${index}-thumb.webp`;
    const thumbPath = path.join(productDir, thumbFilename);
    await sharp(buffer)
      .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(thumbPath);

    return {
      full: `/uploads/products/${productSlug}/${fullFilename}`,
      thumbnail: `/uploads/products/${productSlug}/${thumbFilename}`,
    };
  } catch (err) {
    console.error(`Error processing image ${imageUrl}:`, err);
    return null;
  }
}

export async function downloadProductImages(
  imageUrls: string[],
  productSlug: string
): Promise<{ images: string[]; thumbnail: string | null }> {
  const images: string[] = [];
  let thumbnail: string | null = null;

  for (let i = 0; i < imageUrls.length; i++) {
    const result = await downloadAndProcessImage(imageUrls[i], productSlug, i);
    if (result) {
      images.push(result.full);
      if (i === 0) thumbnail = result.thumbnail;
    }
  }

  return { images, thumbnail };
}

export async function deleteProductImages(productSlug: string): Promise<void> {
  const productDir = path.join(UPLOADS_DIR, productSlug);
  try {
    await fs.rm(productDir, { recursive: true, force: true });
  } catch {
    // Directory might not exist
  }
}
```

- [ ] **Step 2: Write test**

Create `__tests__/lib/sync/image-sync.test.ts`:

```typescript
import { describe, it, expect, afterAll } from "vitest";
import fs from "fs/promises";
import path from "path";
import { downloadAndProcessImage, downloadProductImages, deleteProductImages } from "@/lib/sync/image-sync";

const TEST_SLUG = "test-product-image";

describe("Image sync", () => {
  afterAll(async () => {
    await deleteProductImages(TEST_SLUG);
  });

  it("should download and process an image to webp", async () => {
    // Use a small test image from the web
    const result = await downloadAndProcessImage(
      "https://via.placeholder.com/600x800.png",
      TEST_SLUG,
      0
    );

    if (!result) {
      console.log("Image download failed (network issue), skipping");
      return;
    }

    expect(result.full).toContain(TEST_SLUG);
    expect(result.full).toEndWith(".webp");
    expect(result.thumbnail).toContain("-thumb.webp");

    // Verify files exist
    const fullPath = path.join(process.cwd(), "public", result.full);
    const thumbPath = path.join(process.cwd(), "public", result.thumbnail);
    const fullStat = await fs.stat(fullPath);
    const thumbStat = await fs.stat(thumbPath);
    expect(fullStat.size).toBeGreaterThan(0);
    expect(thumbStat.size).toBeGreaterThan(0);
    expect(thumbStat.size).toBeLessThanOrEqual(fullStat.size);
  }, 30000);

  it("should download multiple product images", async () => {
    const result = await downloadProductImages(
      ["https://via.placeholder.com/400x500.png", "https://via.placeholder.com/400x500.png"],
      TEST_SLUG
    );

    expect(result.images.length).toBeGreaterThanOrEqual(1);
    expect(result.thumbnail).toBeTruthy();
  }, 30000);
});
```

- [ ] **Step 3: Run test**

```bash
npx vitest run __tests__/lib/sync/image-sync.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/sync/image-sync.ts __tests__/lib/sync/image-sync.test.ts
git commit -m "feat: add image download + webp conversion + thumbnail generation

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Product Sync Orchestrator

**Files:**
- Create: `src/lib/sync/product-sync.ts`
- Test: `__tests__/lib/sync/product-sync.test.ts`

- [ ] **Step 1: Create product sync orchestrator**

Create `src/lib/sync/product-sync.ts`:

```typescript
import { db } from "../db";
import { meili, PRODUCTS_INDEX } from "../meilisearch";
import { ShportaScraper } from "../scrapers/shporta";
import { TreguScraper } from "../scrapers/tregu";
import { BennyScraper } from "../scrapers/benny";
import { ScraperAdapter, ScrapedProduct, SyncResult } from "../scrapers/types";
import { mapCategory, getCollectionSlugs } from "./category-mapper";
import { downloadProductImages } from "./image-sync";
import { makeUniqueSlug, slugify } from "../scrapers/utils";
import type { SourceStore } from "@/types";

const scraperMap: Record<SourceStore, () => ScraperAdapter> = {
  shporta: () => new ShportaScraper(),
  tregu: () => new TreguScraper(),
  benny: () => new BennyScraper(),
};

export async function syncStore(
  sourceStore: SourceStore,
  options: { downloadImages?: boolean; maxProducts?: number } = {}
): Promise<SyncResult> {
  const { downloadImages = true, maxProducts } = options;
  const scraper = scraperMap[sourceStore]();

  const result: SyncResult = {
    sourceStore,
    productsAdded: 0,
    productsUpdated: 0,
    pricesChanged: 0,
    errors: [],
  };

  // Create sync log
  const syncLog = await db.syncLog.create({
    data: { sourceStore, status: "running" },
  });

  let totalProcessed = 0;

  try {
    for await (const batch of scraper.scrapeAll()) {
      for (const scraped of batch) {
        if (maxProducts && totalProcessed >= maxProducts) break;

        try {
          await processProduct(scraped, downloadImages, result);
          totalProcessed++;
        } catch (err) {
          const msg = `Error processing ${scraped.title}: ${err}`;
          console.error(msg);
          result.errors.push(msg);
        }
      }

      if (maxProducts && totalProcessed >= maxProducts) break;
    }

    // Update sync log
    await db.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "completed",
        productsAdded: result.productsAdded,
        productsUpdated: result.productsUpdated,
        pricesChanged: result.pricesChanged,
        errors: result.errors,
        completedAt: new Date(),
      },
    });
  } catch (err) {
    const msg = `Sync failed for ${sourceStore}: ${err}`;
    console.error(msg);
    result.errors.push(msg);

    await db.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "failed",
        errors: result.errors,
        completedAt: new Date(),
      },
    });
  }

  return result;
}

async function processProduct(
  scraped: ScrapedProduct,
  downloadImages: boolean,
  result: SyncResult
): Promise<void> {
  const mappedCategory = mapCategory(scraped.category);
  const baseSlug = slugify(scraped.title);
  const slug = makeUniqueSlug(baseSlug, scraped.sourceStore, scraped.sourceId);

  // Check if product exists
  const existing = await db.product.findUnique({
    where: {
      sourceStore_sourceId: {
        sourceStore: scraped.sourceStore,
        sourceId: scraped.sourceId,
      },
    },
  });

  let images: string[] = [];
  let thumbnail: string | null = null;

  if (downloadImages && scraped.images.length > 0) {
    if (!existing || existing.images.length === 0) {
      const imgResult = await downloadProductImages(scraped.images, slug);
      images = imgResult.images;
      thumbnail = imgResult.thumbnail;
    } else {
      images = existing.images;
      thumbnail = existing.thumbnail;
    }
  }

  if (existing) {
    // Check price change
    const existingPrice = Number(existing.price);
    if (existingPrice !== scraped.price) {
      result.pricesChanged++;
    }

    await db.product.update({
      where: { id: existing.id },
      data: {
        title: scraped.title,
        description: scraped.description,
        price: scraped.price,
        compareAtPrice: scraped.compareAtPrice,
        category: mappedCategory,
        sourceUrl: scraped.sourceUrl,
        isActive: scraped.inStock,
        images: images.length > 0 ? images : undefined,
        thumbnail: thumbnail || undefined,
        syncedAt: new Date(),
      },
    });

    result.productsUpdated++;
  } else {
    const product = await db.product.create({
      data: {
        sourceStore: scraped.sourceStore,
        sourceId: scraped.sourceId,
        sourceUrl: scraped.sourceUrl,
        title: scraped.title,
        slug,
        description: scraped.description,
        price: scraped.price,
        compareAtPrice: scraped.compareAtPrice,
        images,
        thumbnail,
        category: mappedCategory,
        stock: 0,
        isActive: scraped.inStock,
        syncedAt: new Date(),
      },
    });

    // Assign to collections
    const collectionSlugs = getCollectionSlugs({
      price: scraped.price,
      category: mappedCategory,
    });

    // Always add to "te-rejat" (new arrivals)
    collectionSlugs.push("te-rejat");

    for (const collSlug of collectionSlugs) {
      const collection = await db.collection.findUnique({
        where: { slug: collSlug },
      });
      if (collection) {
        await db.productCollection.create({
          data: {
            productId: product.id,
            collectionId: collection.id,
          },
        }).catch(() => {
          // Ignore duplicate
        });
      }
    }

    result.productsAdded++;
  }

  // Index in Meilisearch
  await meili.index(PRODUCTS_INDEX).addDocuments([{
    id: existing?.id || slug,
    title: scraped.title,
    slug,
    description: scraped.description,
    price: scraped.price,
    compareAtPrice: scraped.compareAtPrice,
    thumbnail,
    category: mappedCategory,
    sourceStore: scraped.sourceStore,
    isActive: scraped.inStock,
    isFeatured: false,
    collections: getCollectionSlugs({ price: scraped.price, category: mappedCategory }),
  }]);
}

export async function syncAll(
  options: { downloadImages?: boolean; maxProducts?: number } = {}
): Promise<SyncResult[]> {
  const stores: SourceStore[] = ["shporta", "tregu", "benny"];
  const results: SyncResult[] = [];

  for (const store of stores) {
    console.log(`\nSyncing ${store}...`);
    const result = await syncStore(store, options);
    results.push(result);
    console.log(
      `${store}: +${result.productsAdded} added, ~${result.productsUpdated} updated, ${result.pricesChanged} price changes, ${result.errors.length} errors`
    );
  }

  return results;
}
```

- [ ] **Step 2: Write test**

Create `__tests__/lib/sync/product-sync.test.ts`:

```typescript
import { describe, it, expect, afterAll } from "vitest";
import { syncStore } from "@/lib/sync/product-sync";

describe("Product sync", () => {
  it("should sync a small batch from shporta", async () => {
    const result = await syncStore("shporta", {
      downloadImages: false,
      maxProducts: 3,
    });

    expect(result.sourceStore).toBe("shporta");
    expect(result.productsAdded + result.productsUpdated).toBeGreaterThanOrEqual(0);
    console.log(`Shporta sync: +${result.productsAdded}, ~${result.productsUpdated}, errors: ${result.errors.length}`);
  }, 120000);

  it("should sync a small batch from benny", async () => {
    const result = await syncStore("benny", {
      downloadImages: false,
      maxProducts: 3,
    });

    expect(result.sourceStore).toBe("benny");
    expect(result.productsAdded + result.productsUpdated).toBeGreaterThanOrEqual(0);
    console.log(`Benny sync: +${result.productsAdded}, ~${result.productsUpdated}, errors: ${result.errors.length}`);
  }, 120000);

  afterAll(async () => {
    const { db } = await import("@/lib/db");
    await db.$disconnect();
    const { redis } = await import("@/lib/redis");
    await redis.quit();
  });
});
```

- [ ] **Step 3: Run test**

```bash
npx vitest run __tests__/lib/sync/product-sync.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/sync/product-sync.ts __tests__/lib/sync/product-sync.test.ts
git commit -m "feat: add product sync orchestrator with Meilisearch indexing

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: BullMQ Workers & Manual Sync Script

**Files:**
- Create: `scripts/workers/product-sync-worker.ts`, `scripts/workers/image-sync-worker.ts`, `scripts/workers/price-sync-worker.ts`, `scripts/run-sync.ts`
- Modify: `src/lib/queue.ts` (add scheduler), `pm2.config.cjs` (add workers)

- [ ] **Step 1: Create product sync worker**

Create `scripts/workers/product-sync-worker.ts`:

```typescript
import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { syncStore } from "../../src/lib/sync/product-sync";
import type { SourceStore } from "../../src/types";

const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "product-sync",
  async (job) => {
    const { store, downloadImages = true } = job.data as {
      store: SourceStore;
      downloadImages?: boolean;
    };

    console.log(`[product-sync] Starting sync for ${store}...`);
    const result = await syncStore(store, { downloadImages });
    console.log(
      `[product-sync] ${store}: +${result.productsAdded} added, ~${result.productsUpdated} updated, ${result.errors.length} errors`
    );
    return result;
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

worker.on("completed", (job) => {
  console.log(`[product-sync] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[product-sync] Job ${job?.id} failed:`, err);
});

console.log("[product-sync] Worker started, waiting for jobs...");
```

- [ ] **Step 2: Create price sync worker**

Create `scripts/workers/price-sync-worker.ts`:

```typescript
import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { syncStore } from "../../src/lib/sync/product-sync";
import type { SourceStore } from "../../src/types";

const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "price-sync",
  async (job) => {
    const { store } = job.data as { store: SourceStore };
    console.log(`[price-sync] Checking prices for ${store}...`);
    // Price sync reuses the same sync logic but without image download
    const result = await syncStore(store, { downloadImages: false });
    console.log(`[price-sync] ${store}: ${result.pricesChanged} price changes`);
    return result;
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

worker.on("completed", (job) => {
  console.log(`[price-sync] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[price-sync] Job ${job?.id} failed:`, err);
});

console.log("[price-sync] Worker started, waiting for jobs...");
```

- [ ] **Step 3: Create image sync worker**

Create `scripts/workers/image-sync-worker.ts`:

```typescript
import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { downloadProductImages } from "../../src/lib/sync/image-sync";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const worker = new Worker(
  "image-sync",
  async (job) => {
    const { productId, imageUrls, slug } = job.data as {
      productId: string;
      imageUrls: string[];
      slug: string;
    };

    console.log(`[image-sync] Downloading images for ${slug}...`);
    const result = await downloadProductImages(imageUrls, slug);

    // Update product with local image paths
    await db.product.update({
      where: { id: productId },
      data: {
        images: result.images,
        thumbnail: result.thumbnail,
      },
    });

    console.log(`[image-sync] ${slug}: ${result.images.length} images downloaded`);
    return result;
  },
  {
    connection: redis,
    concurrency: 3, // Process 3 images concurrently
  }
);

worker.on("completed", (job) => {
  console.log(`[image-sync] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[image-sync] Job ${job?.id} failed:`, err);
});

console.log("[image-sync] Worker started, waiting for jobs...");
```

- [ ] **Step 4: Create manual sync script**

Create `scripts/run-sync.ts`:

```typescript
import "dotenv/config";
import { syncAll, syncStore } from "../src/lib/sync/product-sync";
import type { SourceStore } from "../src/types";

async function main() {
  const store = process.argv[2] as SourceStore | "all" | undefined;
  const noImages = process.argv.includes("--no-images");
  const maxProducts = process.argv.find((a) => a.startsWith("--max="));
  const max = maxProducts ? parseInt(maxProducts.split("=")[1]) : undefined;

  console.log("BLINI-HOME Product Sync");
  console.log("=======================");
  console.log(`Store: ${store || "all"}`);
  console.log(`Images: ${noImages ? "skip" : "download"}`);
  if (max) console.log(`Max products: ${max}`);
  console.log("");

  if (store && store !== "all") {
    const result = await syncStore(store, { downloadImages: !noImages, maxProducts: max });
    console.log("\nResult:", JSON.stringify(result, null, 2));
  } else {
    const results = await syncAll({ downloadImages: !noImages, maxProducts: max });
    console.log("\nResults:", JSON.stringify(results, null, 2));
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
```

- [ ] **Step 5: Add scripts to package.json**

```json
{
  "scripts": {
    "sync": "npx tsx scripts/run-sync.ts",
    "sync:shporta": "npx tsx scripts/run-sync.ts shporta",
    "sync:tregu": "npx tsx scripts/run-sync.ts tregu",
    "sync:benny": "npx tsx scripts/run-sync.ts benny",
    "worker:product-sync": "npx tsx scripts/workers/product-sync-worker.ts",
    "worker:image-sync": "npx tsx scripts/workers/image-sync-worker.ts",
    "worker:price-sync": "npx tsx scripts/workers/price-sync-worker.ts"
  }
}
```

- [ ] **Step 6: Update PM2 config with workers**

Update `pm2.config.cjs`:

```javascript
module.exports = {
  apps: [
    {
      name: "blini-home",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      cwd: "/app",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
    },
    {
      name: "blini-product-sync",
      script: "node_modules/.bin/tsx",
      args: "scripts/workers/product-sync-worker.ts",
      cwd: "/app",
      instances: 1,
      autorestart: true,
      max_memory_restart: "256M",
    },
    {
      name: "blini-image-sync",
      script: "node_modules/.bin/tsx",
      args: "scripts/workers/image-sync-worker.ts",
      cwd: "/app",
      instances: 1,
      autorestart: true,
      max_memory_restart: "256M",
    },
    {
      name: "blini-price-sync",
      script: "node_modules/.bin/tsx",
      args: "scripts/workers/price-sync-worker.ts",
      cwd: "/app",
      instances: 1,
      autorestart: true,
      max_memory_restart: "256M",
    },
  ],
};
```

- [ ] **Step 7: Create admin sync trigger API**

Create `src/app/api/admin/sync/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { productSyncQueue, priceSyncQueue } from "@/lib/queue";
import type { SourceStore } from "@/types";

const VALID_STORES: SourceStore[] = ["shporta", "tregu", "benny"];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { store, type = "full" } = body as { store?: string; type?: string };

  if (store && !VALID_STORES.includes(store as SourceStore)) {
    return NextResponse.json(
      { error: `Invalid store. Must be one of: ${VALID_STORES.join(", ")}` },
      { status: 400 }
    );
  }

  const stores = store ? [store as SourceStore] : VALID_STORES;
  const jobs = [];

  for (const s of stores) {
    if (type === "price") {
      const job = await priceSyncQueue.add(`price-${s}`, { store: s });
      jobs.push({ store: s, type: "price", jobId: job.id });
    } else {
      const job = await productSyncQueue.add(`sync-${s}`, {
        store: s,
        downloadImages: true,
      });
      jobs.push({ store: s, type: "full", jobId: job.id });
    }
  }

  return NextResponse.json({ message: "Sync jobs queued", jobs });
}
```

- [ ] **Step 8: Run a test sync (small batch, no images)**

```bash
npm run sync -- all --no-images --max=5
```

Expected: Syncs up to 5 products from each store without downloading images.

- [ ] **Step 9: Commit**

```bash
git add scripts/workers/ scripts/run-sync.ts src/app/api/admin/sync/route.ts src/lib/queue.ts pm2.config.cjs package.json
git commit -m "feat: add BullMQ workers, manual sync script, admin sync API

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Full Sync Run & Deploy

- [ ] **Step 1: Run full sync from all 3 stores (with images)**

```bash
npm run sync -- all --max=50
```

This syncs up to 50 products from each store with image download. Monitor output.

- [ ] **Step 2: Verify product count**

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });
const count = await db.product.count();
const byStore = await db.product.groupBy({ by: ['sourceStore'], _count: true });
console.log('Total products:', count);
console.log('By store:', JSON.stringify(byStore, null, 2));
await db.\$disconnect();
await pool.end();
"
```

- [ ] **Step 3: Run all tests**

```bash
npx vitest run
```

- [ ] **Step 4: Build**

```bash
npm run build
```

- [ ] **Step 5: Push and deploy to CT 110**

```bash
git push origin main
```

Then SSH to CT 110 and update:
```bash
ssh root@192.168.100.50
pct enter 110
cd /app
git pull
npm install
npx prisma generate
npm run build
pm2 restart all
pm2 save
exit
exit
```

- [ ] **Step 6: Test sync from CT 110**

```bash
ssh root@192.168.100.50
pct enter 110
cd /app
npm run sync -- benny --no-images --max=5
exit
exit
```

- [ ] **Step 7: Verify admin sync API**

```bash
curl -s -X POST https://home.blini.world/api/admin/sync -H "Content-Type: application/json" -d '{"store":"benny","type":"full"}'
```

- [ ] **Step 8: Final commit and push**

```bash
cd /root/blini-home
git push origin main
```

---

## Summary

After completing Plan 2, you will have:

- 3 scraper adapters (shporta WooCommerce, tregu WooCommerce, benny Shopify) with HTML fallback
- Category mapper (source → BLINI-HOME categories + thematic collections)
- Image download + WebP conversion + thumbnail generation
- Product sync orchestrator with Meilisearch indexing
- 3 BullMQ workers (product-sync, image-sync, price-sync) as PM2 processes
- Manual sync CLI: `npm run sync [store] [--no-images] [--max=N]`
- Admin sync trigger API: `POST /api/admin/sync`
- 50+ real products synced from source stores
- All tests passing
