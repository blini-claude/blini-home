# Plan 1: Foundation — BLINI-HOME

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the complete project foundation — Next.js 16 app with Prisma 7, PostgreSQL, Redis, Meilisearch — deployed and running on CT 110 (192.168.100.110) accessible at https://home.blini.world.

**Architecture:** Monolithic Next.js 16 App Router application with Prisma 7 ORM (pg adapter), PostgreSQL 16, Redis for caching/queues, Meilisearch for product search. PM2 process manager. Nginx reverse proxy. Cloudflare tunnel already configured.

**Tech Stack:** Next.js 16, TypeScript, Prisma 7, PostgreSQL 16, Redis, Meilisearch, BullMQ, Tailwind CSS, PM2, Nginx

**Spec:** `docs/superpowers/specs/2026-04-14-blini-home-design.md`

**Target:** CT 110 at 192.168.100.110 (SSH via Proxmox: `ssh root@192.168.100.50` then `pct enter 110`)

---

## File Structure

```
blini-home/
├── docs/superpowers/          # Specs and plans
├── prisma/
│   └── schema.prisma          # Complete database schema
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with Inter font, metadata
│   │   ├── page.tsx           # Homepage (placeholder for Plan 3)
│   │   ├── (storefront)/
│   │   │   └── layout.tsx     # Storefront layout shell
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       └── layout.tsx # Admin layout shell
│   │   └── api/
│   │       └── health/
│   │           └── route.ts   # Health check endpoint
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── redis.ts           # Redis/ioredis client singleton
│   │   ├── meilisearch.ts     # Meilisearch client singleton
│   │   └── queue.ts           # BullMQ queue definitions
│   └── types/
│       └── index.ts           # Shared TypeScript types
├── scripts/
│   ├── seed.ts                # Database seed script
│   └── setup-meilisearch.ts   # Meilisearch index setup
├── __tests__/
│   ├── lib/
│   │   ├── db.test.ts         # Database connection test
│   │   ├── redis.test.ts      # Redis connection test
│   │   ├── meilisearch.test.ts# Meilisearch connection test
│   │   └── queue.test.ts      # BullMQ queue test
│   └── api/
│       └── health.test.ts     # Health endpoint test
├── .env                       # Environment variables (not committed)
├── .env.example               # Example env file (committed)
├── .gitignore
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── package.json
├── vitest.config.ts
├── pm2.config.cjs             # PM2 ecosystem config
├── nginx.conf                 # Nginx site config
└── README.md
```

---

## Task 1: Initialize Next.js 16 Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `.gitignore`, `.env.example`, `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Create Next.js 16 app**

Run from `/root/blini-home`:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Select defaults when prompted. If the directory is non-empty, it will ask to proceed — say yes.

Expected: Project scaffolded with `src/app/` structure, `package.json` with next 16.x.

- [ ] **Step 2: Install core dependencies**

```bash
npm install prisma@latest @prisma/client@latest @prisma/adapter-pg pg ioredis bullmq meilisearch
npm install -D vitest @vitejs/plugin-react @types/pg
```

- [ ] **Step 3: Create `.env.example`**

```env
# Database
DATABASE_URL="postgresql://blini_home:BliniHome2026!@localhost:5432/blini_home"

# Redis
REDIS_URL="redis://localhost:6379"

# Meilisearch
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="blini_home_meili_2026"

# App
NEXT_PUBLIC_SITE_URL="https://home.blini.world"
ADMIN_EMAIL="admin@blinihome.com"
ADMIN_PASSWORD="BliniHomeAdmin2026!"

# Sync (to be filled when API keys are obtained)
SHPORTA_WC_KEY=""
SHPORTA_WC_SECRET=""
TREGU_WC_KEY=""
TREGU_WC_SECRET=""
BENNY_SHOPIFY_TOKEN=""
```

- [ ] **Step 4: Create `.env` with real values**

Copy `.env.example` to `.env` and fill in the same values (they are the real values for CT 110).

- [ ] **Step 5: Update `next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.shporta.shop" },
      { protocol: "https", hostname: "**.tregu.shop" },
      { protocol: "https", hostname: "**.bennygroup.store" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 6: Create vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 7: Add test script to package.json**

Add to `package.json` scripts:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 8: Update root layout with Inter font and metadata**

Replace `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BLINI HOME — Gjithçka për Shtëpinë",
  description:
    "Gjithçka që ju nevojitet për shtëpinë, familjen dhe veten — me çmimet më të mira në Kosovë.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sq" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 9: Create placeholder homepage**

Replace `src/app/page.tsx`:

```typescript
export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          BLINI HOME
        </h1>
        <p className="mt-2 text-sm tracking-widest text-gray-500 uppercase">
          Gjithçka për Shtëpinë
        </p>
        <p className="mt-6 text-gray-400">Së shpejti...</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Update `.gitignore`**

Ensure `.gitignore` includes:
```
node_modules/
.next/
.env
.env.local
*.tsbuildinfo
next-env.d.ts
/uploads/
.superpowers/
```

- [ ] **Step 11: Verify dev server starts**

```bash
npm run dev
```

Expected: Next.js dev server starts on port 3000, no errors. Visit http://localhost:3000 and see "BLINI HOME" placeholder.

Kill the dev server after verification (Ctrl+C).

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js 16 project with Tailwind, Vitest, Inter font"
```

---

## Task 2: Prisma Schema & Database Setup

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/db.ts`, `src/types/index.ts`
- Test: `__tests__/lib/db.test.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init
```

This creates `prisma/schema.prisma` and updates `.env` with `DATABASE_URL`.

- [ ] **Step 2: Write the complete Prisma schema**

Replace `prisma/schema.prisma`:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id             String   @id @default(cuid())
  sourceStore    String   // "shporta" | "tregu" | "benny"
  sourceId       String
  sourceUrl      String
  title          String
  slug           String   @unique
  description    String?
  price          Decimal  @db.Decimal(10, 2)
  compareAtPrice Decimal? @db.Decimal(10, 2)
  images         String[]
  thumbnail      String?
  category       String
  stock          Int      @default(0)
  isActive       Boolean  @default(true)
  isFeatured     Boolean  @default(false)
  syncedAt       DateTime @default(now())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  collections   ProductCollection[]
  orderItems    OrderItem[]
  wishlistItems WishlistItem[]

  @@unique([sourceStore, sourceId])
  @@index([category])
  @@index([isActive])
  @@index([slug])
}

model Collection {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String?
  image       String?
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  products ProductCollection[]

  @@index([slug])
  @@index([isActive, sortOrder])
}

model ProductCollection {
  productId    String
  collectionId String

  product    Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([productId, collectionId])
}

model Order {
  id            String   @id @default(cuid())
  orderNumber   String   @unique
  status        String   @default("pending")
  customerName  String
  customerPhone String
  customerEmail String?
  city          String
  address       String
  notes         String?
  subtotal      Decimal  @db.Decimal(10, 2)
  deliveryFee   Decimal  @db.Decimal(10, 2)
  total         Decimal  @db.Decimal(10, 2)
  paymentMethod String   @default("COD")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  items      OrderItem[]
  customer   Customer?   @relation(fields: [customerId], references: [id])
  customerId String?

  @@index([status])
  @@index([orderNumber])
  @@index([createdAt])
  @@index([customerPhone])
}

model OrderItem {
  id        String  @id @default(cuid())
  quantity  Int
  price     Decimal @db.Decimal(10, 2)

  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId   String
  product   Product @relation(fields: [productId], references: [id])
  productId String

  @@index([orderId])
}

model Customer {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  phone        String?
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  addresses Address[]
  orders    Order[]
  wishlist  WishlistItem[]

  @@index([email])
  @@index([phone])
}

model Address {
  id        String  @id @default(cuid())
  label     String?
  city      String
  address   String
  isDefault Boolean @default(false)

  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  customerId String

  @@index([customerId])
}

model WishlistItem {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  customerId String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId  String

  @@unique([customerId, productId])
}

model SyncLog {
  id               String    @id @default(cuid())
  sourceStore      String
  status           String    @default("running")
  productsAdded    Int       @default(0)
  productsUpdated  Int       @default(0)
  pricesChanged    Int       @default(0)
  imagesDownloaded Int       @default(0)
  errors           String[]
  startedAt        DateTime  @default(now())
  completedAt      DateTime?
}

model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `src/lib/db.ts`:

```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const connectionString = process.env.DATABASE_URL!;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 4: Create shared types**

Create `src/types/index.ts`:

```typescript
export type SourceStore = "shporta" | "tregu" | "benny";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "delivering"
  | "delivered"
  | "cancelled";

export type SyncStatus = "running" | "completed" | "failed";

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  title: string;
  thumbnail: string | null;
  slug: string;
}

export interface CheckoutData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  city: string;
  address: string;
  notes?: string;
}
```

- [ ] **Step 5: Write database connection test**

Create `__tests__/lib/db.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("Database connection", () => {
  it("should have DATABASE_URL defined", () => {
    expect(process.env.DATABASE_URL).toBeDefined();
  });

  it("should connect and query", async () => {
    const { db } = await import("@/lib/db");
    // Simple query to verify connection
    const result = await db.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;
    expect(result).toHaveLength(1);
    expect(result[0].now).toBeInstanceOf(Date);
    await db.$disconnect();
  });
});
```

- [ ] **Step 6: Set up PostgreSQL on CT 110**

SSH into Proxmox, enter CT 110, install and configure PostgreSQL:

```bash
ssh root@192.168.100.50
pct enter 110

apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

sudo -u postgres psql -c "CREATE USER blini_home WITH PASSWORD 'BliniHome2026!';"
sudo -u postgres psql -c "CREATE DATABASE blini_home OWNER blini_home;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE blini_home TO blini_home;"

exit  # exit CT
exit  # exit Proxmox
```

- [ ] **Step 7: Generate Prisma client and push schema**

```bash
npx prisma generate
npx prisma db push
```

Expected: Schema pushed to PostgreSQL, Prisma client generated. No errors.

- [ ] **Step 8: Run database test**

```bash
npx vitest run __tests__/lib/db.test.ts
```

Expected: 2 tests pass — DATABASE_URL defined, connection + query works.

- [ ] **Step 9: Commit**

```bash
git add prisma/ src/lib/db.ts src/types/index.ts __tests__/lib/db.test.ts
git commit -m "feat: add Prisma schema with all models, database connection"
```

---

## Task 3: Redis & BullMQ Setup

**Files:**
- Create: `src/lib/redis.ts`, `src/lib/queue.ts`
- Test: `__tests__/lib/redis.test.ts`, `__tests__/lib/queue.test.ts`

- [ ] **Step 1: Install Redis on CT 110**

```bash
ssh root@192.168.100.50
pct enter 110

apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server

# Verify
redis-cli ping
# Expected: PONG

exit
exit
```

- [ ] **Step 2: Create Redis client singleton**

Create `src/lib/redis.ts`:

```typescript
import IORedis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: IORedis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null, // Required for BullMQ
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
```

- [ ] **Step 3: Create BullMQ queue definitions**

Create `src/lib/queue.ts`:

```typescript
import { Queue } from "bullmq";
import { redis } from "./redis";

export const productSyncQueue = new Queue("product-sync", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export const imageSyncQueue = new Queue("image-sync", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 100 },
  },
});

export const priceSyncQueue = new Queue("price-sync", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});
```

- [ ] **Step 4: Write Redis connection test**

Create `__tests__/lib/redis.test.ts`:

```typescript
import { describe, it, expect, afterAll } from "vitest";

describe("Redis connection", () => {
  it("should connect and ping", async () => {
    const { redis } = await import("@/lib/redis");
    const result = await redis.ping();
    expect(result).toBe("PONG");
  });

  it("should set and get a value", async () => {
    const { redis } = await import("@/lib/redis");
    await redis.set("test:blini-home", "working");
    const value = await redis.get("test:blini-home");
    expect(value).toBe("working");
    await redis.del("test:blini-home");
  });

  afterAll(async () => {
    const { redis } = await import("@/lib/redis");
    await redis.quit();
  });
});
```

- [ ] **Step 5: Write BullMQ queue test**

Create `__tests__/lib/queue.test.ts`:

```typescript
import { describe, it, expect, afterAll } from "vitest";

describe("BullMQ queues", () => {
  it("should add a job to product-sync queue", async () => {
    const { productSyncQueue } = await import("@/lib/queue");
    const job = await productSyncQueue.add("test-sync", {
      store: "shporta",
      type: "full",
    });
    expect(job.id).toBeDefined();
    expect(job.name).toBe("test-sync");
    // Clean up
    await job.remove();
  });

  afterAll(async () => {
    const { productSyncQueue, imageSyncQueue, priceSyncQueue } = await import(
      "@/lib/queue"
    );
    await productSyncQueue.close();
    await imageSyncQueue.close();
    await priceSyncQueue.close();
    const { redis } = await import("@/lib/redis");
    await redis.quit();
  });
});
```

- [ ] **Step 6: Run Redis and queue tests**

```bash
npx vitest run __tests__/lib/redis.test.ts __tests__/lib/queue.test.ts
```

Expected: All 3 tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/redis.ts src/lib/queue.ts __tests__/lib/redis.test.ts __tests__/lib/queue.test.ts
git commit -m "feat: add Redis client, BullMQ queue definitions with tests"
```

---

## Task 4: Meilisearch Setup

**Files:**
- Create: `src/lib/meilisearch.ts`, `scripts/setup-meilisearch.ts`
- Test: `__tests__/lib/meilisearch.test.ts`

- [ ] **Step 1: Install Meilisearch on CT 110**

```bash
ssh root@192.168.100.50
pct enter 110

curl -L https://install.meilisearch.com | sh
mv ./meilisearch /usr/local/bin/

# Create systemd service
cat > /etc/systemd/system/meilisearch.service << 'EOF'
[Unit]
Description=Meilisearch
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/meilisearch --http-addr 127.0.0.1:7700 --master-key blini_home_meili_2026 --env production --db-path /var/lib/meilisearch/data
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

mkdir -p /var/lib/meilisearch/data
systemctl daemon-reload
systemctl enable meilisearch
systemctl start meilisearch

# Verify
curl -s http://localhost:7700/health
# Expected: {"status":"available"}

exit
exit
```

- [ ] **Step 2: Create Meilisearch client singleton**

Create `src/lib/meilisearch.ts`:

```typescript
import { MeiliSearch } from "meilisearch";

const globalForMeili = globalThis as unknown as {
  meili: MeiliSearch | undefined;
};

export const meili =
  globalForMeili.meili ??
  new MeiliSearch({
    host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
    apiKey: process.env.MEILISEARCH_API_KEY || "",
  });

if (process.env.NODE_ENV !== "production") globalForMeili.meili = meili;

export const PRODUCTS_INDEX = "products";
```

- [ ] **Step 3: Create Meilisearch index setup script**

Create `scripts/setup-meilisearch.ts`:

```typescript
import { MeiliSearch } from "meilisearch";

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || "http://localhost:7700";
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || "blini_home_meili_2026";

async function setup() {
  const client = new MeiliSearch({
    host: MEILISEARCH_HOST,
    apiKey: MEILISEARCH_API_KEY,
  });

  console.log("Setting up Meilisearch indexes...");

  // Create products index
  const task = await client.createIndex("products", { primaryKey: "id" });
  await client.waitForTask(task.taskUid);
  console.log("Created products index");

  // Set searchable attributes
  const index = client.index("products");

  await index.updateSearchableAttributes([
    "title",
    "description",
    "category",
  ]);
  console.log("Set searchable attributes");

  // Set filterable attributes
  await index.updateFilterableAttributes([
    "category",
    "sourceStore",
    "isActive",
    "isFeatured",
    "price",
    "collections",
  ]);
  console.log("Set filterable attributes");

  // Set sortable attributes
  await index.updateSortableAttributes(["price", "createdAt", "title"]);
  console.log("Set sortable attributes");

  // Set displayed attributes
  await index.updateDisplayedAttributes([
    "id",
    "title",
    "slug",
    "description",
    "price",
    "compareAtPrice",
    "thumbnail",
    "category",
    "sourceStore",
    "isActive",
    "isFeatured",
    "collections",
  ]);
  console.log("Set displayed attributes");

  console.log("Meilisearch setup complete!");
}

setup().catch(console.error);
```

- [ ] **Step 4: Add setup script to package.json**

Add to scripts:
```json
{
  "scripts": {
    "setup:meili": "npx tsx scripts/setup-meilisearch.ts"
  }
}
```

Also install tsx:
```bash
npm install -D tsx
```

- [ ] **Step 5: Write Meilisearch connection test**

Create `__tests__/lib/meilisearch.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("Meilisearch connection", () => {
  it("should connect and check health", async () => {
    const { meili } = await import("@/lib/meilisearch");
    const health = await meili.health();
    expect(health.status).toBe("available");
  });

  it("should have products index after setup", async () => {
    const { meili, PRODUCTS_INDEX } = await import("@/lib/meilisearch");
    const index = meili.index(PRODUCTS_INDEX);
    const stats = await index.getStats();
    expect(stats).toBeDefined();
    expect(stats.numberOfDocuments).toBeGreaterThanOrEqual(0);
  });
});
```

- [ ] **Step 6: Run Meilisearch setup script**

```bash
npm run setup:meili
```

Expected: "Meilisearch setup complete!" with all attributes set.

- [ ] **Step 7: Run Meilisearch test**

```bash
npx vitest run __tests__/lib/meilisearch.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/lib/meilisearch.ts scripts/setup-meilisearch.ts __tests__/lib/meilisearch.test.ts package.json
git commit -m "feat: add Meilisearch client, index setup script with tests"
```

---

## Task 5: Health Check API & Layout Shells

**Files:**
- Create: `src/app/api/health/route.ts`, `src/app/(storefront)/layout.tsx`, `src/app/(admin)/admin/layout.tsx`
- Test: `__tests__/api/health.test.ts`

- [ ] **Step 1: Write health check test**

Create `__tests__/api/health.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("should return healthy status with all services", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("healthy");
    expect(body.services).toBeDefined();
    expect(body.services.database).toBeDefined();
    expect(body.services.redis).toBeDefined();
    expect(body.services.meilisearch).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/api/health.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create health check API route**

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { meili } from "@/lib/meilisearch";

export async function GET() {
  const services: Record<string, string> = {};

  try {
    await db.$queryRaw`SELECT 1`;
    services.database = "ok";
  } catch {
    services.database = "error";
  }

  try {
    const pong = await redis.ping();
    services.redis = pong === "PONG" ? "ok" : "error";
  } catch {
    services.redis = "error";
  }

  try {
    const health = await meili.health();
    services.meilisearch = health.status === "available" ? "ok" : "error";
  } catch {
    services.meilisearch = "error";
  }

  const allHealthy = Object.values(services).every((s) => s === "ok");

  return NextResponse.json(
    { status: allHealthy ? "healthy" : "degraded", services },
    { status: allHealthy ? 200 : 503 }
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/api/health.test.ts
```

Expected: PASS.

- [ ] **Step 5: Create storefront layout shell**

Create `src/app/(storefront)/layout.tsx`:

```typescript
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header and Nav will be added in Plan 3 */}
      <main>{children}</main>
      {/* Footer will be added in Plan 3 */}
    </>
  );
}
```

- [ ] **Step 6: Create admin layout shell**

Create `src/app/(admin)/admin/layout.tsx`:

```typescript
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin sidebar and header will be added in Plan 4 */}
      <main>{children}</main>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/api/health/route.ts src/app/\(storefront\)/layout.tsx src/app/\(admin\)/admin/layout.tsx __tests__/api/health.test.ts
git commit -m "feat: add health check endpoint, storefront and admin layout shells"
```

---

## Task 6: Database Seed Script

**Files:**
- Create: `scripts/seed.ts`

- [ ] **Step 1: Create seed script with sample data**

Create `scripts/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import crypto from "crypto";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://blini_home:BliniHome2026!@localhost:5432/blini_home",
});
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  await db.adminUser.upsert({
    where: { email: "admin@blinihome.com" },
    update: {},
    create: {
      email: "admin@blinihome.com",
      passwordHash: hashPassword("BliniHomeAdmin2026!"),
    },
  });
  console.log("Created admin user");

  // Create collections
  const collections = [
    { title: "Të rejat", slug: "te-rejat", description: "Produkte të reja", sortOrder: 1 },
    { title: "Më të shitura", slug: "me-te-shitura", description: "Produktet më të shitura", sortOrder: 2 },
    { title: "Nën €10", slug: "nen-10", description: "Gjithçka nën 10 euro", sortOrder: 3 },
    { title: "Ide për Dhurata", slug: "ide-per-dhurata", description: "Dhurata për çdo rast", sortOrder: 4 },
    { title: "Shtëpi & Kuzhinë", slug: "shtepi-kuzhine", description: "Produkte për shtëpinë dhe kuzhinën", sortOrder: 5 },
    { title: "Teknologji", slug: "teknologji", description: "Pajisje teknologjike", sortOrder: 6 },
    { title: "Fëmijë & Lodra", slug: "femije-lodra", description: "Për fëmijët tuaj", sortOrder: 7 },
    { title: "Bukuri & Kujdes", slug: "bukuri-kujdes", description: "Kujdes personal", sortOrder: 8 },
    { title: "Sporte & Aktivitete", slug: "sporte-aktivitete", description: "Pajisje sportive", sortOrder: 9 },
    { title: "Veshje & Aksesore", slug: "veshje-aksesore", description: "Modë dhe aksesore", sortOrder: 10 },
  ];

  for (const col of collections) {
    await db.collection.upsert({
      where: { slug: col.slug },
      update: {},
      create: col,
    });
  }
  console.log(`Created ${collections.length} collections`);

  // Create sample products (these will be replaced by real scraped data)
  const sampleProducts = [
    {
      sourceStore: "shporta",
      sourceId: "sample-1",
      sourceUrl: "https://shporta.shop/sample-1",
      title: "Llampë LED Desktop",
      slug: "llampe-led-desktop",
      description: "Llampë LED me ngjyra të ndryshme për tavolinën tuaj",
      price: 14.99,
      category: "Shtëpi",
      stock: 25,
      isFeatured: true,
    },
    {
      sourceStore: "tregu",
      sourceId: "sample-2",
      sourceUrl: "https://tregu.shop/sample-2",
      title: "Organizator Kuzhinë Bambu",
      slug: "organizator-kuzhine-bambu",
      description: "Organizator elegant prej druri bambu për kuzhinën",
      price: 8.99,
      compareAtPrice: 12.99,
      category: "Kuzhinë",
      stock: 40,
      isFeatured: true,
    },
    {
      sourceStore: "benny",
      sourceId: "sample-3",
      sourceUrl: "https://bennygroup.store/sample-3",
      title: "Kufje Bluetooth TWS Pro",
      slug: "kufje-bluetooth-tws-pro",
      description: "Kufje wireless me cilësi të lartë të zërit",
      price: 24.99,
      category: "Teknologji",
      stock: 15,
      isFeatured: true,
    },
    {
      sourceStore: "shporta",
      sourceId: "sample-4",
      sourceUrl: "https://shporta.shop/sample-4",
      title: "Tharëse Flokësh Profesionale",
      slug: "tharese-flokesh-profesionale",
      description: "Tharëse flokësh 2200W me ajër të ftohtë dhe nxehtë",
      price: 29.99,
      category: "Bukuri",
      stock: 20,
    },
    {
      sourceStore: "tregu",
      sourceId: "sample-5",
      sourceUrl: "https://tregu.shop/sample-5",
      title: "Kamerë Sigurie WiFi HD",
      slug: "kamere-sigurie-wifi-hd",
      description: "Kamerë sigurie me WiFi dhe pamje natës",
      price: 39.99,
      category: "Teknologji",
      stock: 10,
    },
  ];

  for (const product of sampleProducts) {
    await db.product.upsert({
      where: {
        sourceStore_sourceId: {
          sourceStore: product.sourceStore,
          sourceId: product.sourceId,
        },
      },
      update: {},
      create: {
        ...product,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? null,
        images: [],
        thumbnail: null,
      },
    });
  }
  console.log(`Created ${sampleProducts.length} sample products`);

  console.log("Seed complete!");
  await db.$disconnect();
  await pool.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Add seed script to package.json**

Add to scripts:
```json
{
  "scripts": {
    "seed": "npx tsx scripts/seed.ts"
  }
}
```

- [ ] **Step 3: Run seed**

```bash
npm run seed
```

Expected: "Created admin user", "Created 10 collections", "Created 5 sample products", "Seed complete!"

- [ ] **Step 4: Verify seed data via Prisma Studio**

```bash
npx prisma studio
```

Open in browser, verify products, collections, and admin user exist. Close after verification.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed.ts package.json
git commit -m "feat: add database seed script with collections, sample products, admin user"
```

---

## Task 7: PM2, Nginx & Deployment to CT 110

**Files:**
- Create: `pm2.config.cjs`, `nginx.conf`

- [ ] **Step 1: Create PM2 config**

Create `pm2.config.cjs`:

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
  ],
};
```

- [ ] **Step 2: Create Nginx config**

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name home.blini.world localhost;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }

    location /uploads/ {
        alias /app/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

- [ ] **Step 3: Deploy to CT 110**

SSH into Proxmox, then CT 110:

```bash
ssh root@192.168.100.50
pct enter 110
```

Clone the repo and set up:

```bash
cd /
git clone https://github.com/blini-claude/blini-home.git app
cd /app

# Copy env
cp .env.example .env
# Edit .env if needed (values are already correct for CT 110)

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Run seed
npm run seed

# Setup Meilisearch indexes
npm run setup:meili

# Build
npm run build

# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start pm2.config.cjs
pm2 save
pm2 startup

# Setup Nginx
cp nginx.conf /etc/nginx/sites-available/blini-home
ln -sf /etc/nginx/sites-available/blini-home /etc/nginx/sites-enabled/blini-home
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Create uploads directory
mkdir -p /app/public/uploads/products
```

- [ ] **Step 4: Verify deployment**

From CT 110:
```bash
# Check PM2
pm2 list
# Expected: blini-home | online

# Check health endpoint
curl -s http://localhost:3000/api/health | python3 -m json.tool
# Expected: {"status": "healthy", "services": {"database": "ok", "redis": "ok", "meilisearch": "ok"}}

# Check via Nginx
curl -s http://localhost/api/health | python3 -m json.tool
# Expected: same result
```

- [ ] **Step 5: Verify Cloudflare tunnel**

From outside CT 110 (back on the main machine):
```bash
curl -s https://home.blini.world/api/health | python3 -m json.tool
```

Expected: `{"status": "healthy", "services": {"database": "ok", "redis": "ok", "meilisearch": "ok"}}`

- [ ] **Step 6: Verify homepage loads**

Open https://home.blini.world in a browser. Expected: "BLINI HOME — Gjithçka për Shtëpinë" placeholder page.

- [ ] **Step 7: Commit deployment configs**

```bash
git add pm2.config.cjs nginx.conf
git commit -m "feat: add PM2 and Nginx deployment configs"
git push origin main
```

---

## Task 8: Run All Tests & Final Verification

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass (db: 2, redis: 2, queue: 1, meilisearch: 2, health: 1 = 8 total).

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Verify all services on CT 110**

```bash
ssh root@192.168.100.50
pct enter 110
pm2 list
systemctl status postgresql
systemctl status redis-server
systemctl status meilisearch
systemctl status nginx
curl -s http://localhost:3000/api/health
exit
exit
```

Expected: All services running, health check returns all "ok".

- [ ] **Step 4: Final push**

```bash
git push origin main
```

- [ ] **Step 5: Update startup.md**

Add CT 110 to the containers table and BLINI-HOME to the projects table in `/root/startup.md`.

---

## Summary

After completing Plan 1, you will have:

- Next.js 16 app with TypeScript, Tailwind, Inter font
- Complete Prisma schema (Products, Collections, Orders, Customers, SyncLogs, AdminUser)
- PostgreSQL 16 with seeded data (10 collections, 5 sample products, admin user)
- Redis with BullMQ queue definitions (product-sync, image-sync, price-sync)
- Meilisearch with configured products index
- Health check API endpoint
- Storefront and admin layout shells
- PM2 process management
- Nginx reverse proxy
- Live at https://home.blini.world
- 8 passing tests
- All committed and pushed to GitHub
