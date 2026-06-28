# Three-Source Import + Per-Product SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import the full catalogs of sivegeta.com, kubikmall.com, and bennygroup.store into BLINI-HOME with a +5% markup and maximal per-product on-page SEO.

**Architecture:** Extend the existing scraper-adapter sync engine. Add a Shopify scraper (sivegeta) and a WooCommerce scraper (kubik); bennygroup already exists. Apply markup at import, store unique template-built Albanian descriptions (not verbatim source copy), then run the existing taxonomy + a new SEO backfill + Meili reindex. Render-time SEO (`src/lib/seo.ts`) already emits meta/JSON-LD per product.

**Tech Stack:** Next.js 16, Prisma 7 + PostgreSQL, Meilisearch, sharp, cheerio, vitest. Run target: CT 110 (192.168.88.110) prod, domain blinihome.com.

## Global Constraints

- Markup = **+5%** on source `price` and `compareAtPrice`, applied once at import and stored.
- Sources for this job: `benny`, `sivegeta`, `kubik`. Do NOT re-import shporta/tregu.
- **No verbatim source descriptions persisted** — duplicate content kills SEO. Persist `autoProductDescription()` output instead.
- Language: Albanian (Kosovo market). Currency display handled by storefront.
- Test runner: `npm test` (vitest run). Network-hitting scraper tests use a 60000ms timeout and skip gracefully if the source is unreachable.
- Deploy to CT 110: `git pull && npx prisma generate --schema=prisma/schema.prisma && npm run build && pm2 restart blini-home` (no schema change in this plan, so `db push` not required).
- Commit + push every change (BLINI repo rule).

---

### Task 1: Widen source-store types

**Files:**
- Modify: `src/types/index.ts:1`
- Modify: `src/lib/scrapers/types.ts` (`ScrapedProduct.sourceStore`, `ScraperAdapter.sourceStore`)

**Interfaces:**
- Produces: `SourceStore = "shporta" | "tregu" | "benny" | "sivegeta" | "kubik"`; `ScrapedProduct.sourceStore` and `ScraperAdapter.sourceStore` widened to the same union.

- [ ] **Step 1: Widen `SourceStore`**

In `src/types/index.ts`:
```ts
export type SourceStore = "shporta" | "tregu" | "benny" | "sivegeta" | "kubik";
```

- [ ] **Step 2: Widen scraper type unions**

In `src/lib/scrapers/types.ts`, change both `sourceStore` field unions:
```ts
export interface ScrapedProduct {
  sourceStore: "shporta" | "tregu" | "benny" | "sivegeta" | "kubik";
  // ...unchanged...
}

export interface ScraperAdapter {
  name: string;
  sourceStore: "shporta" | "tregu" | "benny" | "sivegeta" | "kubik";
  scrapeAll(): AsyncGenerator<ScrapedProduct[], void, unknown>;
  scrapeProduct(url: string): Promise<ScrapedProduct | null>;
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (no new errors from these files).

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/lib/scrapers/types.ts
git commit -m "feat: add sivegeta + kubik to SourceStore union"
```

---

### Task 2: Sivegeta Shopify scraper

**Files:**
- Create: `src/lib/scrapers/sivegeta.ts`
- Test: `__tests__/lib/scrapers/sivegeta.test.ts`

**Interfaces:**
- Produces: `class SivegetaScraper implements ScraperAdapter` with `name="Sivegeta"`, `sourceStore="sivegeta"`, `scrapeAll()`, `scrapeProduct(url)`.

- [ ] **Step 1: Write the failing test**

`__tests__/lib/scrapers/sivegeta.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { SivegetaScraper } from "@/lib/scrapers/sivegeta";

describe("SivegetaScraper", () => {
  const scraper = new SivegetaScraper();

  it("has correct name and sourceStore", () => {
    expect(scraper.name).toBe("Sivegeta");
    expect(scraper.sourceStore).toBe("sivegeta");
  });

  it("scrapes via products.json", async () => {
    let total = 0;
    for await (const batch of scraper.scrapeAll()) {
      total += batch.length;
      if (batch.length > 0) {
        expect(batch[0].sourceStore).toBe("sivegeta");
        expect(batch[0].title).toBeTruthy();
        expect(batch[0].price).toBeGreaterThan(0);
      }
      break;
    }
    expect(total).toBeGreaterThanOrEqual(1);
  }, 60000);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- sivegeta`
Expected: FAIL ("Cannot find module '@/lib/scrapers/sivegeta'").

- [ ] **Step 3: Implement the scraper**

`src/lib/scrapers/sivegeta.ts` — clone of `benny.ts`, with `BASE_URL = "https://sivegeta.com"`, class `SivegetaScraper`, `name = "Sivegeta"`, `sourceStore = "sivegeta" as const`, and every literal `"benny"` replaced by `"sivegeta"`. Keep the same three strategies (`scrapeViaJson` primary via `/products.json?limit=250&page=N`, `scrapeViaHtml` fallback, `scrapeProduct`). Drop the Shopify Storefront API/token branch (sivegeta has no token) — `scrapeAll` calls `scrapeViaJson` directly:

```ts
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
      try { response = await fetchWithRetry(url); } catch { break; }
      if (!response.ok) { if (page === 1) yield* this.scrapeViaHtml(); break; }
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
          compareAtPrice: variant?.compare_at_price ? parseFloat(variant.compare_at_price) : null,
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
      try { response = await fetchWithRetry(url); } catch { break; }
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
          compareAtPrice: variant?.compare_at_price ? parseFloat(variant.compare_at_price) : null,
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
        sourceStore: "sivegeta", sourceId: handle, sourceUrl: url, title,
        description: $(".product-description, [class*='description']").first().text().trim() || null,
        price: parsePrice(priceText), compareAtPrice: null, images,
        category: "Të përgjithshme", inStock: true,
      };
    } catch (err) {
      console.error(`Error scraping ${url}:`, err);
      return null;
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- sivegeta`
Expected: PASS (both tests; scrape test logs ≥1 product).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scrapers/sivegeta.ts __tests__/lib/scrapers/sivegeta.test.ts
git commit -m "feat: add Sivegeta (Shopify) scraper"
```

---

### Task 3: Kubik WooCommerce scraper

**Files:**
- Create: `src/lib/scrapers/kubik.ts`
- Test: `__tests__/lib/scrapers/kubik.test.ts`

**Interfaces:**
- Produces: `class KubikScraper implements ScraperAdapter` with `name="Kubik"`, `sourceStore="kubik"`, `scrapeAll()`, `scrapeProduct(url)`. Uses WooCommerce Store API; prices come as integer minor units divided by `prices.currency_minor_unit`.

- [ ] **Step 1: Write the failing test**

`__tests__/lib/scrapers/kubik.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { KubikScraper } from "@/lib/scrapers/kubik";

describe("KubikScraper", () => {
  const scraper = new KubikScraper();

  it("has correct name and sourceStore", () => {
    expect(scraper.name).toBe("Kubik");
    expect(scraper.sourceStore).toBe("kubik");
  });

  it("scrapes via WooCommerce Store API", async () => {
    let total = 0;
    for await (const batch of scraper.scrapeAll()) {
      total += batch.length;
      if (batch.length > 0) {
        expect(batch[0].sourceStore).toBe("kubik");
        expect(batch[0].title).toBeTruthy();
        expect(batch[0].price).toBeGreaterThan(0);
        expect(batch[0].sourceUrl).toContain("kubikmall.com");
      }
      break;
    }
    expect(total).toBeGreaterThanOrEqual(1);
  }, 60000);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- kubik`
Expected: FAIL ("Cannot find module '@/lib/scrapers/kubik'").

- [ ] **Step 3: Implement the scraper**

`src/lib/scrapers/kubik.ts`:
```ts
import { ScrapedProduct, ScraperAdapter } from "./types";
import { fetchWithRetry } from "./utils";

const BASE_URL = "https://www.kubikmall.com";
const API = `${BASE_URL}/wp-json/wc/store/v1/products`;

function toAmount(minor: string | number | undefined, minorUnit: number): number {
  if (minor === undefined || minor === null || minor === "") return 0;
  const n = typeof minor === "string" ? parseInt(minor, 10) : minor;
  if (Number.isNaN(n)) return 0;
  return n / Math.pow(10, minorUnit || 2);
}

export class KubikScraper implements ScraperAdapter {
  name = "Kubik";
  sourceStore = "kubik" as const;

  private map(p: any): ScrapedProduct {
    const minorUnit = p?.prices?.currency_minor_unit ?? 2;
    const price = toAmount(p?.prices?.price, minorUnit);
    const regular = toAmount(p?.prices?.regular_price, minorUnit);
    const html = p?.description || p?.short_description || "";
    return {
      sourceStore: "kubik",
      sourceId: String(p.id),
      sourceUrl: p.permalink || `${BASE_URL}/produkt/${p.slug}`,
      title: p.name,
      description: html.replace(/<[^>]*>/g, "").trim() || null,
      price,
      compareAtPrice: regular > price ? regular : null,
      images: Array.isArray(p.images) ? p.images.map((img: any) => img.src).filter(Boolean) : [],
      category: p?.categories?.[0]?.name || "Të përgjithshme",
      inStock: p?.is_in_stock ?? true,
    };
  }

  async *scrapeAll(): AsyncGenerator<ScrapedProduct[], void, unknown> {
    let page = 1;
    const perPage = 100;
    while (true) {
      const url = `${API}?per_page=${perPage}&page=${page}`;
      let response: Response;
      try { response = await fetchWithRetry(url); } catch { break; }
      if (!response.ok) break;
      const products = await response.json();
      if (!Array.isArray(products) || products.length === 0) break;
      const batch = products
        .map((p: any) => this.map(p))
        .filter((p) => p.title && p.price > 0);
      yield batch;
      if (products.length < perPage) break;
      page++;
    }
  }

  async scrapeProduct(url: string): Promise<ScrapedProduct | null> {
    try {
      const slug = url.split("/produkt/")[1]?.replace(/\/$/, "");
      if (!slug) return null;
      const response = await fetchWithRetry(`${API}?slug=${encodeURIComponent(slug)}`);
      if (!response.ok) return null;
      const products = await response.json();
      const p = Array.isArray(products) ? products[0] : null;
      if (!p) return null;
      return this.map(p);
    } catch (err) {
      console.error(`Error scraping ${url}:`, err);
      return null;
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- kubik`
Expected: PASS (scrape test logs ≥1 product, price > 0, url contains kubikmall.com).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scrapers/kubik.ts __tests__/lib/scrapers/kubik.test.ts
git commit -m "feat: add Kubik (WooCommerce) scraper"
```

---

### Task 4: Markup helper + register scrapers + SEO-safe description on import

**Files:**
- Create: `src/lib/sync/markup.ts`
- Test: `__tests__/lib/sync/markup.test.ts`
- Modify: `src/lib/sync/product-sync.ts` (imports, `scraperMap`, `processProduct` price + description, `syncAll` store list)

**Interfaces:**
- Consumes: `SivegetaScraper`, `KubikScraper` (Tasks 2–3); `autoProductDescription` from `src/lib/seo.ts`.
- Produces: `applyMarkup(price: number, sourceStore: string): number` in `src/lib/sync/markup.ts`. Returns price × store factor, rounded to 2 decimals with `.99` ending when ≥ 1 (e.g. `10 → 10.49 → 10.49`; rounds up then subtracts 0.01). Stores benny/sivegeta/kubik at factor 1.05, all others 1.0.

- [ ] **Step 1: Write the failing test**

`__tests__/lib/sync/markup.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { applyMarkup } from "@/lib/sync/markup";

describe("applyMarkup", () => {
  it("adds 5% for kubik/benny/sivegeta", () => {
    expect(applyMarkup(100, "kubik")).toBeCloseTo(104.99, 2);
    expect(applyMarkup(100, "benny")).toBeCloseTo(104.99, 2);
    expect(applyMarkup(100, "sivegeta")).toBeCloseTo(104.99, 2);
  });
  it("leaves unknown/legacy stores unchanged", () => {
    expect(applyMarkup(100, "shporta")).toBe(100);
  });
  it("does not .99-round sub-1 prices", () => {
    expect(applyMarkup(0.5, "kubik")).toBeCloseTo(0.525, 3);
  });
  it("returns 0 for 0", () => {
    expect(applyMarkup(0, "kubik")).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- markup`
Expected: FAIL ("Cannot find module '@/lib/sync/markup'").

- [ ] **Step 3: Implement `applyMarkup`**

`src/lib/sync/markup.ts`:
```ts
const MARKUP: Record<string, number> = {
  benny: 1.05,
  sivegeta: 1.05,
  kubik: 1.05,
};

/** Apply the per-store markup. Prices >= 1 are rounded up to the nearest .99. */
export function applyMarkup(price: number, sourceStore: string): number {
  if (!price || price <= 0) return 0;
  const factor = MARKUP[sourceStore] ?? 1.0;
  const marked = price * factor;
  if (factor === 1.0) return Math.round(marked * 100) / 100;
  if (marked >= 1) return Math.ceil(marked) - 0.01;
  return Math.round(marked * 1000) / 1000;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- markup`
Expected: PASS (4 tests).

- [ ] **Step 5: Register scrapers and wire markup + SEO description into `product-sync.ts`**

In `src/lib/sync/product-sync.ts`:

(a) Add imports near the existing scraper imports:
```ts
import { SivegetaScraper } from "../scrapers/sivegeta";
import { KubikScraper } from "../scrapers/kubik";
import { applyMarkup } from "./markup";
import { autoProductDescription } from "../seo";
```

(b) Extend `scraperMap`:
```ts
const scraperMap: Record<SourceStore, () => ScraperAdapter> = {
  shporta: () => new ShportaScraper(),
  tregu: () => new TreguScraper(),
  benny: () => new BennyScraper(),
  sivegeta: () => new SivegetaScraper(),
  kubik: () => new KubikScraper(),
};
```

(c) At the very top of `processProduct`, after `const mappedCategory = mapCategory(scraped.category);`, compute marked prices and the SEO-safe description, and use them everywhere below instead of the raw scraped values:
```ts
  const price = applyMarkup(scraped.price, scraped.sourceStore);
  const compareAtPrice =
    scraped.compareAtPrice != null ? applyMarkup(scraped.compareAtPrice, scraped.sourceStore) : null;
  // SEO: never persist the source store's verbatim copy (duplicate content).
  // Build a unique Albanian description from structured fields instead.
  const seoDescription = autoProductDescription({
    title: scraped.title,
    slug,
    category: mappedCategory,
    tags: [],
    price,
    compareAtPrice,
  });
```
Then in BOTH the `db.product.update(...)` and `db.product.create(...)` data objects, replace `description: scraped.description` with `description: seoDescription`, replace `price: scraped.price` with `price`, and replace `compareAtPrice: scraped.compareAtPrice` with `compareAtPrice`. In the price-change check replace `scraped.price` with `price`. In the `db.priceHistory.create` calls use `price`. In `getCollectionSlugs({ price: scraped.price, ... })` (both call sites) use `price`. In the Meilisearch `addDocuments` payload use `description: seoDescription`, `price`, `compareAtPrice`.

(d) Update `syncAll` store list:
```ts
  const stores: SourceStore[] = ["benny", "sivegeta", "kubik"];
```

- [ ] **Step 6: Typecheck + full test run**

Run: `npx tsc --noEmit && npm test -- markup product-sync`
Expected: PASS, no type errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/sync/markup.ts __tests__/lib/sync/markup.test.ts src/lib/sync/product-sync.ts
git commit -m "feat: +5% markup, register sivegeta/kubik, SEO-safe import descriptions"
```

---

### Task 5: SEO backfill script (descriptions + meta, tag-aware)

**Files:**
- Create: `scripts/seo-backfill.ts`

**Interfaces:**
- Consumes: `autoProductDescription`, `productSeoTitle`, `productSeoDescription` from `src/lib/seo.ts`; `db` from `src/lib/db`.
- Produces: a runnable script that, for every active product, regenerates `description` from `autoProductDescription` (now that taxonomy tags are set), and persists `metaTitle = productSeoTitle(...)` and `metaDescription = productSeoDescription(...)`.

- [ ] **Step 1: Implement the script**

`scripts/seo-backfill.ts`:
```ts
import "dotenv/config";
import { db } from "../src/lib/db";
import { autoProductDescription, productSeoTitle, productSeoDescription } from "../src/lib/seo";

async function main() {
  const products = await db.product.findMany({
    select: { id: true, title: true, slug: true, category: true, tags: true, price: true, compareAtPrice: true },
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

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Dry sanity check (local, reads only a couple)**

Run: `npx tsx -e "import('./src/lib/seo').then(m=>console.log(m.productSeoTitle({title:'Syze Inteligjente GY500',slug:'x',category:'Teknologji',tags:['Smartwatch'],price:49.99})))"`
Expected: prints a ≤65-char Albanian title ending in `| BLINI HOME`.

- [ ] **Step 4: Commit**

```bash
git add scripts/seo-backfill.ts
git commit -m "feat: SEO backfill script (tag-aware descriptions + meta)"
```

---

### Task 6: Image alt-text audit

**Files:**
- Modify (only if missing alt): product detail + product card components under `src/components/` / `src/app/produkt/`

**Interfaces:**
- Produces: every `<Image>`/`<img>` rendering a product photo uses `alt={product.title}` (image SEO / "picture too").

- [ ] **Step 1: Find product image renders**

Run: `grep -rn "<Image\|<img" src/app/produkt src/components | grep -i "thumbnail\|images\|product"`
Expected: list of image renders.

- [ ] **Step 2: Ensure descriptive alt**

For each product image without a meaningful `alt`, set `alt={product.title}` (or `alt={\`${product.title} — ${product.category}\`}` on the main detail image). Do not touch decorative/icon images.

- [ ] **Step 3: Typecheck + build**

Run: `npx tsc --noEmit`
Expected: PASS. (Skip if no files needed changes.)

- [ ] **Step 4: Commit (only if changes made)**

```bash
git add -A && git commit -m "feat: descriptive alt text on product images (image SEO)"
```

---

### Task 7: Deploy + run the full import pipeline on CT 110

**Files:** none (operational task on prod)

**Interfaces:**
- Consumes: all prior tasks merged to the branch deployed on CT 110.

Reach CT 110: `ssh root@192.168.88.50` then `pct exec 110 -- bash -lc '<cmd>'` (app dir `/app`).

- [ ] **Step 1: Backup prod DB (safety before mass insert)**

Run on CT 110:
```bash
pct exec 110 -- bash -lc 'cd /app && pg_dump "$DATABASE_URL" -Fc -f /root/blini-home-pre-import-$(date +%Y%m%d-%H%M%S).dump && ls -lh /root/blini-home-pre-import-*.dump | tail -1'
```
Expected: a `.dump` file written.

- [ ] **Step 2: Deploy code**

Run on CT 110:
```bash
pct exec 110 -- bash -lc 'cd /app && git pull && npx prisma generate --schema=prisma/schema.prisma && npm run build && pm2 restart blini-home'
```
Expected: build succeeds, pm2 shows `online`.

- [ ] **Step 3: Run the import (all three sources, images on)**

Run on CT 110 (long — ~1–2 hr; run detached):
```bash
pct exec 110 -- bash -lc 'cd /app && nohup npx tsx scripts/run-sync.ts all > /root/blini-import.log 2>&1 & echo started'
```
Then poll: `pct exec 110 -- bash -lc 'tail -5 /root/blini-import.log'`
Expected: log shows `+N added` per store; final `Results:` JSON. No fatal errors.

- [ ] **Step 4: Run taxonomy → SEO backfill → reindex**

Run on CT 110 after import completes:
```bash
pct exec 110 -- bash -lc 'cd /app && npx tsx scripts/retaxonomize.ts && npx tsx scripts/seo-backfill.ts && node scripts/reindex-meili.js'
```
Expected: retaxonomize reports per-category counts; seo-backfill reports N updated; reindex reports docs indexed.

- [ ] **Step 5: Verify DB counts**

Run on CT 110:
```bash
pct exec 110 -- bash -lc 'cd /app && npx tsx -e "import {db} from \"./src/lib/db\"; db.product.groupBy({by:[\"sourceStore\"],_count:true}).then(r=>{console.log(r);process.exit(0)})"'
```
Expected: rows for `benny`, `sivegeta`, `kubik` with non-zero counts (~3,600 total).

- [ ] **Step 6: Verify storefront + per-product SEO**

- `curl -s https://blinihome.com/koleksion/teknologji | grep -c produkt` → > 0 product links.
- Pick a product slug from Step 5, then:
  `curl -s https://blinihome.com/produkt/<slug> | grep -E "og:title|application/ld\+json|<title>" | head` → unique title, Product JSON-LD present.
- `curl -s "https://blinihome.com/api/search?q=syze" ` (or the Meili-backed search route) → returns kubik/sivegeta products.
- Spot-check the product page renders price = source × 1.05 and a unique (non-source) Albanian description.

- [ ] **Step 7: Commit any branch state + finish**

Ensure branch is pushed. Report final counts and 3 sample product URLs.

---

## Self-Review

**Spec coverage:**
- Two new scrapers (sivegeta Shopify, kubik Woo) → Tasks 2, 3. ✓
- Type/registration changes → Tasks 1, 4. ✓
- +5% markup → Task 4 (`applyMarkup`). ✓
- Kill duplicate content / unique descriptions → Task 4 (import) + Task 5 (tag-aware regen). ✓
- Sequence import→retaxonomize→seo-backfill→reindex → Task 7 Step 4. ✓
- metaTitle/metaDescription persisted → Task 5. ✓
- Image alt/"picture too" → Task 6. ✓
- Render-time SEO (titles/keywords/JSON-LD) → already in `src/lib/seo.ts`, emitted automatically; verified Task 7 Step 6. ✓
- Run + verify on CT 110 + DB backup → Task 7. ✓

**Placeholder scan:** No TBD/TODO; all code shown. ✓

**Type consistency:** `SourceStore` union identical across Tasks 1/4; `applyMarkup(price, sourceStore)` signature consistent between Task 4 def and call sites; `autoProductDescription`/`productSeoTitle`/`productSeoDescription` signatures match `src/lib/seo.ts`. ✓
