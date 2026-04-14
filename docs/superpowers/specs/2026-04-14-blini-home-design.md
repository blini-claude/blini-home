# BLINI-HOME — Design Specification

## Overview

BLINI-HOME is a custom e-commerce marketplace aggregator for the Kosovo/Albanian market. It pulls products from three source stores (shporta.shop, tregu.shop, bennygroup.store), stocks them as own inventory, and sells them through a Flying Tiger Copenhagen-inspired storefront with cash-on-delivery checkout.

**Domain:** home.blini.world (temporary) — permanent domain TBD
**Infrastructure:** Proxmox CT 110 (192.168.100.110)
**Repository:** https://github.com/blini-claude/blini-home

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| ORM | Prisma 7 (with pg adapter) |
| Database | PostgreSQL 16 |
| Cache / Queues | Redis + BullMQ |
| Search | Meilisearch |
| Process Manager | PM2 |
| Reverse Proxy | Nginx |
| Tunnel | Cloudflare |
| Styling | Tailwind CSS |
| UI Components | Custom (Flying Tiger design system) |

Fresh build on the same proven stack as BLINI Official. No forking — purpose-built for an aggregator marketplace with COD-only checkout.

---

## Architecture

### System Diagram

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│  SOURCE STORES   │     │     SYNC ENGINE       │     │     FRONTEND        │
│                 │     │     (BullMQ)           │     │                     │
│ shporta.shop    │────▶│ Product Scraper       │     │ Next.js 16          │
│ (WooCommerce)   │     │ Price Monitor         │     │ Flying Tiger UI     │
│                 │     │ Image Downloader      │     │ Carousels           │
│ tregu.shop      │────▶│ Category Mapper       │     │ Collections         │
│ (WooCommerce)   │     │                      │     │ COD Checkout        │
│                 │     └──────────┬───────────┘     └──────────┬──────────┘
│ bennygroup.store│────▶           │                            │
│ (Shopify)       │     ┌──────────▼───────────┐     ┌──────────▼──────────┐
└─────────────────┘     │     DATA LAYER        │     │   ADMIN DASHBOARD   │
                        │                      │     │                     │
                        │ PostgreSQL 16        │◀───▶│ Orders & Fulfillment│
                        │ Redis (cache+queues) │     │ Product Management  │
                        │ Meilisearch (search) │     │ Sync Controls       │
                        └──────────────────────┘     │ Analytics           │
                                                     └─────────────────────┘

All running on CT 110 (192.168.100.110) · Prisma 7 ORM · PM2 · Nginx · Cloudflare Tunnel
```

### Key Architecture Decisions

- **Monolithic Next.js app** — storefront, admin, and API in a single deployment (same proven pattern as BLINI Official)
- **Scraper-first design** — the sync engine is a first-class citizen, not bolted on
- **Local image storage** — product images downloaded and served from own storage, no hotlinking to source stores
- **Category mapper** — source store categories mapped to BLINI-HOME's thematic collections
- **COD-only checkout** — no payment gateway integration needed, dramatically simpler checkout flow

---

## Storefront Design

### Design System (Flying Tiger Copenhagen clone)

The storefront replicates Flying Tiger Copenhagen's design language, adapted for BLINI-HOME's brand and Albanian market.

#### Colors

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#FFFFFF` | Page background |
| Text Primary | `#121212` | Headings, body text |
| Text Secondary | `#707070` | Descriptions, secondary info |
| Card Background | `#F5F5F5` | Product card image area |
| Border | `#DADADA` | Header border, dividers |
| Button | `#000000` bg / `#FFFFFF` text | Primary buttons |
| Sale Price | `#E83800` | Active sale prices |
| Sale Badge | `#E31B23` | Red circle sale badges |
| Last Chance Badge | `#DC3545` | Last chance pill badges |
| New Badge | `#FFFFFF` bg / `#000000` text | "E re" pill badges |
| Accent | `#6767A7` | Secondary accent |
| Announcement Bar | `#000000` bg / `#FFFFFF` text | Top bar |
| Hero Button | `#F5F5F5` bg / `#303061` text | Hero CTA pill |
| Search Input | `#EBEBEB` | Search field background |
| Delivery Bar | `#F4F4F4` | Delivery info section |

#### Typography

- **Font family:** Inter (Google Fonts) as primary sans-serif — closest available match to Flying Tiger's Avenir Next World
- **Headings:** 32-42px, weight 600, letter-spacing -1px to -2px
- **Product card titles:** 15px, weight 500
- **Product card prices:** 20px, weight 700, letter-spacing -1px
- **Navigation:** 15px, weight 500
- **Body text:** 16px, weight 400, line-height 1.8
- **Announcement bar:** 12px, weight 500, letter-spacing -0.4px
- **Buttons:** 15px, weight 600

#### Component Specifications

**Product Cards:**
- Image area: 5:7 aspect ratio, `#F5F5F5` background, no border-radius (sharp edges)
- Badges: "E re" = white pill (3px radius), Sale = red circle (56px), "Rasti i fundit" = red pill (3px radius)
- Wishlist heart: absolute top-right, 36px circle with white background
- Quick view: appears on hover, bottom overlay, 14px weight 700
- "Shto në shportë" button: full-width, black, `border-radius: 7px`
- No box-shadow, no hover shadow

**Category Bubbles:**
- 160px diameter circles (`border-radius: 50%`)
- Image with `object-fit: cover`
- Label below: 15px, weight 600
- Horizontal scrollable row with 15px gap

**Hero Banners:**
- Full-width, 400px height
- Text overlay with heading (42px), subtext (20px), pill CTA button (`border-radius: 80px`)

**Promo Cards:**
- 2-column grid, 30px gap
- 4:3 aspect ratio
- Gradient backgrounds with text overlay at bottom
- Pill CTA button

### Homepage Layout (top to bottom)

1. **Announcement bar** — black, centered text: "Dërgim falas për porosi mbi 30€ · Paguaj me para në dorë"
2. **Header** — hamburger | centered "BLINI HOME" logo | search, account, wishlist (badge), cart (badge) icons
3. **Navigation bar** — horizontal scrollable: Të reja, Më të shitura, Shtëpi, Kuzhinë, Teknologji, Fëmijë & Lodra, Bukuri & Kujdes, Sporte, Veshje & Aksesore, Nën €10 — Oferta! (red), Të gjitha
4. **Hero banner** — seasonal promotion with pill CTA
5. **Category bubbles** — "Blej sipas kategorisë", 8 circular category thumbnails
6. **Product carousel** — "Të rejat e javës" with 6+ scrollable product cards
7. **Promo banners** — 2-column: "Ide për Dhurata" + "Gjithçka nën €10"
8. **Product carousel** — "Më të shitura" with 5+ scrollable product cards
9. **Promo banners** — 2-column: "Teknologji & Gadgets" + "Fëmijë & Familje"
10. **Delivery info bar** — 3 items with icons: delivery time, COD, free returns
11. **Footer** — 4-column: brand description, about links, help links, newsletter signup + social icons

### All Storefront Pages

| Page | Route | Description |
|------|-------|-------------|
| Homepage | `/` | Layout described above |
| Collection | `/koleksion/[slug]` | Product grid with filters (price, category, source) + sort. 3-col desktop, 2-col mobile. Filter sidebar on left. |
| Product | `/produkt/[slug]` | Image gallery (stacked vertical), title, price, description, "Shto në shportë", accordion (details, dimensions, delivery), related products carousel |
| Cart | Slide-out drawer | Triggered by cart icon. Product list, quantity controls, subtotal, "Vazhdo me porosinë" button |
| Checkout | `/porosia` | Single page: name, phone, city, address, optional notes, optional email. Order summary sidebar. COD only. |
| Order Confirmation | `/porosia/konfirmim/[id]` | Order number, summary, estimated delivery, "what happens next" |
| Account | `/llogaria` | Order history, saved addresses, wishlist. Login/register. |
| Wishlist | `/deshirat` | Grid of wishlisted products. Heart toggle. |
| Search | `/kerko` | Full-text via Meilisearch. Instant results dropdown from header + dedicated search page |
| About | `/rreth-nesh` | Brand story |
| Delivery | `/dergimi` | Delivery zones, times, fees |
| Returns | `/kthimi` | Return policy |
| FAQ | `/pyetje` | Frequently asked questions |
| Privacy | `/privatesia` | Privacy policy |
| Terms | `/kushtet` | Terms of service |

---

## Data Model

### Products

```
Product {
  id              String    @id @default(cuid())
  sourceStore     String    // "shporta" | "tregu" | "benny"
  sourceId        String    // ID in the source store
  sourceUrl       String    // Original product URL
  title           String
  slug            String    @unique
  description     String?
  price           Decimal   // Current selling price in EUR
  compareAtPrice  Decimal?  // Original/compare price for sales
  images          String[]  // Local file paths
  thumbnail       String?   // Primary image path
  category        String    // BLINI-HOME category
  stock           Int       @default(0) // Physical stock count
  isActive        Boolean   @default(true)
  isFeatured      Boolean   @default(false)
  syncedAt        DateTime  // Last sync from source
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  collections     Collection[] @relation("ProductCollections")
  orderItems      OrderItem[]
  wishlistItems   WishlistItem[]
}
```

### Collections (Thematic Groupings)

```
Collection {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  description String?
  image       String?
  isActive    Boolean   @default(true)
  sortOrder   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  products    Product[] @relation("ProductCollections")
}
```

### Orders

```
Order {
  id            String      @id @default(cuid())
  orderNumber   String      @unique // e.g., "BH-20260414-001"
  status        String      @default("pending") // pending → confirmed → delivering → delivered → cancelled
  customerName  String
  customerPhone String
  customerEmail String?
  city          String
  address       String
  notes         String?
  subtotal      Decimal
  deliveryFee   Decimal
  total         Decimal
  paymentMethod String      @default("COD")
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  items         OrderItem[]
  customer      Customer?   @relation(fields: [customerId], references: [id])
  customerId    String?
}

OrderItem {
  id         String   @id @default(cuid())
  quantity   Int
  price      Decimal  // Price at time of order

  order      Order    @relation(fields: [orderId], references: [id])
  orderId    String
  product    Product  @relation(fields: [productId], references: [id])
  productId  String
}
```

### Customers (Optional Accounts)

```
Customer {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  phone        String?
  passwordHash String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  addresses    Address[]
  orders       Order[]
  wishlist     WishlistItem[]
}

Address {
  id         String   @id @default(cuid())
  label      String?  // "Shtëpi", "Punë"
  city       String
  address    String
  isDefault  Boolean  @default(false)

  customer   Customer @relation(fields: [customerId], references: [id])
  customerId String
}

WishlistItem {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())

  customer   Customer @relation(fields: [customerId], references: [id])
  customerId String
  product    Product  @relation(fields: [productId], references: [id])
  productId  String

  @@unique([customerId, productId])
}
```

### Sync Logs

```
SyncLog {
  id              String   @id @default(cuid())
  sourceStore     String
  status          String   // "running" | "completed" | "failed"
  productsAdded   Int      @default(0)
  productsUpdated Int      @default(0)
  pricesChanged   Int      @default(0)
  imagesDownloaded Int     @default(0)
  errors          String[] // Error messages
  startedAt       DateTime @default(now())
  completedAt     DateTime?
}
```

---

## Sync Engine

### Workers (BullMQ on Redis)

| Worker | Schedule | Source | Description |
|--------|----------|--------|-------------|
| Product Scraper | Every 6 hours | WooCommerce REST API (shporta, tregu) + Shopify Storefront API (benny) | Creates/updates products in PostgreSQL, indexes in Meilisearch |
| Price Monitor | Every 2 hours | Same APIs | Checks source prices, flags changes, logs price history |
| Image Downloader | Triggered by scraper | Source image URLs | Downloads images to local storage, generates thumbnails |
| Category Mapper | Runs after scraper | Internal | Maps source categories → BLINI-HOME categories + thematic collections |

### API Integration

**WooCommerce (shporta.shop, tregu.shop):**
- REST API v3: `GET /wp-json/wc/v3/products`
- Consumer key + consumer secret authentication
- Paginated requests (100 per page)
- Fields: name, slug, description, price, regular_price, sale_price, images, categories, stock_status

**Shopify (bennygroup.store):**
- Storefront API (GraphQL)
- Product listing with variants, images, prices
- Fields: title, handle, descriptionHtml, priceRange, images, productType, tags

### Sync Flow

1. Worker pulls products from source API (paginated)
2. For each product: match by `sourceStore + sourceId` — create or update
3. If new images found: queue image download job
4. After all products processed: run category mapper
5. Re-index all changed products in Meilisearch
6. Log sync results to SyncLog table

---

## Admin Dashboard

### Auth

Simple admin login (email + password). Single admin role. Session-based with NextAuth or simple JWT.

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin` | Overview cards (today's orders, revenue, total products, pending deliveries), recent orders, sync status per store, quick charts (orders/week, top categories) |
| Orders | `/admin/orders` | Filterable table (status, date, city), expandable detail view, status change buttons (pending → confirmed → delivering → delivered), print delivery slip |
| Products | `/admin/products` | Searchable table with source store filter, bulk enable/disable, edit price/description/collections, manual stock management, thumbnail preview |
| Collections | `/admin/collections` | Create/edit thematic collections, drag-to-reorder, assign/remove products, set featured image |
| Customers | `/admin/customers` | Registered customers + guest order lookup by phone, order count, total spent |
| Sync Controls | `/admin/sync` | Manual trigger per store, sync log history, schedule editor, error viewer, category mapping editor |
| Analytics | `/admin/analytics` | Orders over time, top products, revenue by category, orders by city, source store breakdown |
| Login | `/admin/login` | Email + password login form |

---

## Checkout Flow

1. Customer browses → adds items to cart (slide-out drawer)
2. Cart drawer shows items, quantities, subtotal
3. "Vazhdo me porosinë" → checkout page
4. Checkout form: name (required), phone (required), city (required), address (required), email (optional), notes (optional)
5. Order summary sidebar with items + delivery fee + total
6. "Konfirmo Porosinë" button
7. Order created with status "pending"
8. Redirect to confirmation page with order number + "what happens next"
9. Admin receives order notification (in dashboard)

No payment processing. No card forms. Cash collected on delivery.

---

## Deployment

- **Container:** Proxmox CT 110 (192.168.100.110), Ubuntu 22.04, 2 cores, 2GB RAM
- **Process manager:** PM2 (Next.js app + sync workers as separate processes)
- **Reverse proxy:** Nginx on port 80/443
- **Tunnel:** Cloudflare tunnel to home.blini.world
- **Database:** PostgreSQL 16 (local)
- **Cache:** Redis (local)
- **Search:** Meilisearch (local, port 7700)
- **Images:** Local filesystem (`/app/public/uploads/products/`)
- **Git:** https://github.com/blini-claude/blini-home

---

## Language

All customer-facing content in Albanian. Admin dashboard in English.

---

## Prerequisites (needed before sync engine works)

- **shporta.shop:** WooCommerce REST API consumer key + secret (request from store owner, or scrape public product pages as fallback)
- **tregu.shop:** WooCommerce REST API consumer key + secret (same approach)
- **bennygroup.store:** Shopify Storefront API access token (or scrape public pages as fallback)

If API keys are unavailable, the scraper falls back to HTML scraping of public product pages using Cheerio.

---

## Out of Scope (for initial launch)

- Online payment (Stripe, PayPal, Paysera) — COD only for now
- Multi-language support
- Mobile app
- Reviews/ratings
- Live chat
- Email notifications to customers (can be added later)
- SEO optimization beyond basics (meta tags, sitemap)
