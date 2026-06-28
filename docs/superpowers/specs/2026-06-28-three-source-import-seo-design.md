# Design — Add sivegeta / kubikmall / bennygroup products to BLINI-HOME with maximal per-product SEO

**Date:** 2026-06-28
**Status:** Approved (brainstorming) → ready for implementation plan

## Goal

Import the full catalogs of three Albanian-market stores into BLINI-HOME (blinihome.com) and apply every legitimate on-page SEO lever per product, so each product is maximally rankable on its keywords (title, description, image).

Sources & platforms (confirmed live):

| Source | Platform | API endpoint | Approx products |
|---|---|---|---|
| bennygroup.store | Shopify | `/products.json` | ~1,300 (already wired as `benny`) |
| sivegeta.com | Shopify | `/products.json` | ~1,000 |
| kubikmall.com (Kubik Electronics) | WooCommerce | `/wp-json/wc/store/v1/products` | 1,336 |

All three are Albanian-language → natural fit for BLINI-HOME's Kosovo/Albanian market.

## Decisions (locked with Blin)

- **Scope:** full catalogs (~3,600 total). This intentionally re-fills the catalog wiped on 2026-06-22.
- **Pricing:** +5% markup over source price.
- **Descriptions:** template-based unique Albanian copy (no AI cost). Reuse existing `autoProductDescription()`.

## Honest SEO ceiling

This applies max on-page optimization (unique copy, meta, structured data, image alt/slug, internal linking, search indexing). It does **not** and cannot guarantee #1 rankings — those depend on domain authority/backlinks/competition, which on-page work alone does not control.

## Architecture (extends existing sync engine — not a rebuild)

Existing pieces reused as-is:
- Scraper-adapter pattern: `src/lib/scrapers/` (`BennyScraper` already covers bennygroup).
- `src/lib/sync/product-sync.ts` — `processProduct` (upsert, images, collections, Meili), `syncStore`, `syncAll`.
- `src/lib/sync/category-mapper.ts` — coarse category mapping + price-collection slugs.
- `scripts/retaxonomize.ts` — detailed keyword→category+subcategory tag engine + collection/nav placement.
- `src/lib/seo.ts` — render-time SEO: `autoProductDescription`, `productSeoTitle/Description`, `productKeywords`, `productMetadata`, JSON-LD (Product/Offer/Breadcrumb/Organization/Website/ItemList).
- `src/lib/sync/image-sync.ts` — download → sharp → webp (full + thumb) under slug folder.
- `scripts/reindex-meili.js` — full Meilisearch reindex.

### Change set

**1. New scrapers**
- `src/lib/scrapers/sivegeta.ts` — clone of `BennyScraper` with `BASE_URL=https://sivegeta.com`, `sourceStore="sivegeta"`.
- `src/lib/scrapers/kubik.ts` — WooCommerce Store API scraper. Paginates `/wp-json/wc/store/v1/products?per_page=100&page=N`. Maps fields: `id`→sourceId, `name`→title, `permalink`→sourceUrl, `description||short_description` (HTML stripped)→description, `prices.price` (minor units ÷ `prices.currency_minor_unit`)→price, `prices.regular_price`→compareAtPrice, `images[].src`→images, `categories[0].name`→category, `is_in_stock`→inStock.

**2. Type + registration changes**
- `src/types/index.ts`: `SourceStore = "shporta" | "tregu" | "benny" | "sivegeta" | "kubik"`.
- `src/lib/scrapers/types.ts`: widen `sourceStore` unions on `ScrapedProduct` + `ScraperAdapter` to include `"sivegeta" | "kubik"`.
- `product-sync.ts`: add both to `scraperMap`; `syncAll` stores list = `["benny", "sivegeta", "kubik"]` (drop shporta/tregu — those sources are not part of this job and their stores are gone).

**3. +5% markup**
- In `processProduct`: `const MARKUP: Record<string,number> = { benny:1.05, sivegeta:1.05, kubik:1.05 }`; factor defaults to `1.0`. Apply to `price` and `compareAtPrice`, round to 2 decimals (`.99` psychological rounding: `Math.round(x)-0.01` when ≥ 1). Markup is applied once, at import, and stored.

**4. SEO maximization**
- **No verbatim source descriptions** (duplicate-content kill). On create, store `autoProductDescription()` output instead of `scraped.description`. Keep `scraped.description` only as transient input, not persisted.
- **Sequence:** import → `retaxonomize.ts` (category + subcategory tags + collection/nav placement) → `scripts/seo-backfill.ts` (NEW: regenerate `description` from `autoProductDescription` now that tags exist; persist `metaTitle=productSeoTitle`, `metaDescription=productSeoDescription`) → `reindex-meili`.
- **Images / "picture too":** verify product + card components render `alt={product.title}`; image files already live under keyword-rich `public/uploads/<slug>/` paths. Add alt text where missing.
- Render-time `seo.ts` then auto-emits keyword-rich `<title>`, meta description, `keywords`, OG/Twitter, and JSON-LD for every product — no per-page work needed.

**5. Execution & verification (on CT 110 prod)**
- Deploy code, run `scripts/run-sync.ts all` (images on), then retaxonomize → seo-backfill → reindex-meili.
- Verify: DB counts per source; storefront `/koleksion/*` populated; spot-check 3 product pages' rendered `<head>` (unique title/description/JSON-LD) + image alt; Meili search returns new products.

## Cost / footprint flags

- ~3,600 products, image download ≈ multi-GB, ~1–2 hr run. Run on CT 110 directly.
- Re-fills the intentionally-wiped catalog (expected per "full catalogs").
- Pre-run `pg_dump` backup before mass insert (safety, even though catalog is near-empty).

## Out of scope

- AI-rewritten prose (chosen: template-based).
- shporta.shop / tregu.shop re-import.
- Backlink/off-page SEO (cannot be done from here).
- Ongoing scheduled re-sync (one-shot import; cron remains dormant).
