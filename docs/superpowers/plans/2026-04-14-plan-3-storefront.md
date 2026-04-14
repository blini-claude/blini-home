# Plan 3: Storefront — BLINI-HOME

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete customer-facing storefront — a pixel-perfect Flying Tiger Copenhagen clone with all shopping pages, cart, checkout (COD only), search, and static pages.

**Architecture:** Next.js 16 App Router with Server Components for data fetching, Client Components for interactivity (cart, search, mobile menu). Cart state via React Context + localStorage. Search via Meilisearch API routes. All pages in Albanian.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Prisma 7, Meilisearch, Inter font

**Spec:** `docs/superpowers/specs/2026-04-14-blini-home-design.md`

---

## File Structure

```
src/
├── app/
│   ├── globals.css                          # Flying Tiger design tokens + Inter font
│   ├── layout.tsx                           # Root layout (update: Inter font)
│   ├── (storefront)/
│   │   ├── layout.tsx                       # Storefront shell: announcement + header + nav + footer
│   │   ├── page.tsx                         # Homepage (replaces root page.tsx)
│   │   ├── koleksion/
│   │   │   └── [slug]/
│   │   │       └── page.tsx                 # Collection page with filters
│   │   ├── produkt/
│   │   │   └── [slug]/
│   │   │       └── page.tsx                 # Product detail page
│   │   ├── porosia/
│   │   │   ├── page.tsx                     # Checkout form
│   │   │   └── konfirmim/
│   │   │       └── [id]/
│   │   │           └── page.tsx             # Order confirmation
│   │   ├── kerko/
│   │   │   └── page.tsx                     # Search results page
│   │   ├── rreth-nesh/
│   │   │   └── page.tsx                     # About us
│   │   ├── dergimi/
│   │   │   └── page.tsx                     # Delivery info
│   │   ├── kthimi/
│   │   │   └── page.tsx                     # Returns policy
│   │   ├── pyetje/
│   │   │   └── page.tsx                     # FAQ
│   │   ├── privatesia/
│   │   │   └── page.tsx                     # Privacy policy
│   │   └── kushtet/
│   │       └── page.tsx                     # Terms of service
│   └── api/
│       ├── products/
│       │   └── route.ts                     # Product listing API
│       ├── search/
│       │   └── route.ts                     # Meilisearch proxy
│       └── orders/
│           └── route.ts                     # Order creation API
├── components/
│   └── storefront/
│       ├── announcement-bar.tsx             # Black announcement strip
│       ├── header.tsx                       # Logo, search, icons
│       ├── navigation.tsx                   # Category nav bar
│       ├── mobile-menu.tsx                  # Slide-out mobile menu
│       ├── footer.tsx                       # 4-column footer
│       ├── cart-drawer.tsx                  # Slide-out cart
│       ├── product-card.tsx                 # Product card (Flying Tiger style)
│       ├── product-carousel.tsx             # Horizontal scrollable product row
│       ├── category-bubbles.tsx             # Circular category thumbnails
│       ├── hero-banner.tsx                  # Full-width hero
│       ├── promo-cards.tsx                  # 2-column promo grid
│       ├── delivery-info.tsx                # 3-icon delivery bar
│       ├── product-grid.tsx                 # Collection product grid with filters
│       └── image-gallery.tsx                # PDP image gallery
├── contexts/
│   └── cart-context.tsx                     # Cart state (React Context + localStorage)
└── lib/
    └── queries.ts                           # Shared Prisma queries for storefront
```

---

## Task 1: Design System & Global Styles

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update globals.css with Flying Tiger design tokens**

Replace `src/app/globals.css` with:

```css
@import "tailwindcss";

@theme inline {
  /* Flying Tiger Copenhagen Design Tokens */
  --color-bg: #FFFFFF;
  --color-text: #121212;
  --color-text-secondary: #707070;
  --color-card-bg: #F5F5F5;
  --color-border: #DADADA;
  --color-sale: #E83800;
  --color-sale-badge: #E31B23;
  --color-last-chance: #DC3545;
  --color-accent: #6767A7;
  --color-announcement: #000000;
  --color-hero-btn: #F5F5F5;
  --color-hero-btn-text: #303061;
  --color-search-bg: #EBEBEB;
  --color-delivery-bg: #F4F4F4;

  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar-free horizontal scroll containers */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

- [ ] **Step 2: Update root layout with Inter font**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
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
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: add Flying Tiger design system tokens and Inter font

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Cart Context & Provider

**Files:**
- Create: `src/contexts/cart-context.tsx`

- [ ] **Step 1: Create cart context with localStorage persistence**

Create `src/contexts/cart-context.tsx`:

```tsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { CartItem } from "@/types";

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "blini-home-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveCart(items);
  }, [items, mounted]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/contexts/cart-context.tsx
git commit -m "feat: add cart context with localStorage persistence

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Shared Data Queries

**Files:**
- Create: `src/lib/queries.ts`

- [ ] **Step 1: Create shared Prisma queries for storefront**

Create `src/lib/queries.ts`:

```typescript
import { db } from "./db";

export async function getActiveProducts(options: {
  limit?: number;
  offset?: number;
  category?: string;
  collectionSlug?: string;
  sortBy?: "price-asc" | "price-desc" | "newest" | "name";
  minPrice?: number;
  maxPrice?: number;
} = {}) {
  const { limit = 24, offset = 0, category, collectionSlug, sortBy = "newest", minPrice, maxPrice } = options;

  const where: any = { isActive: true };
  if (category) where.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  const orderBy: any = sortBy === "price-asc"
    ? { price: "asc" }
    : sortBy === "price-desc"
    ? { price: "desc" }
    : sortBy === "name"
    ? { title: "asc" }
    : { createdAt: "desc" };

  if (collectionSlug) {
    const collection = await db.collection.findUnique({
      where: { slug: collectionSlug },
    });
    if (!collection) return { products: [], total: 0 };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where: {
          ...where,
          collections: { some: { collectionId: collection.id } },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      db.product.count({
        where: {
          ...where,
          collections: { some: { collectionId: collection.id } },
        },
      }),
    ]);

    return { products, total };
  }

  const [products, total] = await Promise.all([
    db.product.findMany({ where, orderBy, skip: offset, take: limit }),
    db.product.count({ where }),
  ]);

  return { products, total };
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: { collections: { include: { collection: true } } },
  });
}

export async function getCollections() {
  return db.collection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCollectionBySlug(slug: string) {
  return db.collection.findUnique({ where: { slug } });
}

export async function getFeaturedProducts(limit = 12) {
  return db.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getNewArrivals(limit = 12) {
  return db.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getRelatedProducts(productId: string, category: string, limit = 6) {
  return db.product.findMany({
    where: {
      isActive: true,
      category,
      id: { not: productId },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat: add shared Prisma queries for storefront pages

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Layout Components (Header, Nav, Footer)

**Files:**
- Create: `src/components/storefront/announcement-bar.tsx`
- Create: `src/components/storefront/header.tsx`
- Create: `src/components/storefront/navigation.tsx`
- Create: `src/components/storefront/mobile-menu.tsx`
- Create: `src/components/storefront/footer.tsx`
- Create: `src/components/storefront/cart-drawer.tsx`
- Modify: `src/app/(storefront)/layout.tsx`

- [ ] **Step 1: Create announcement bar**

Create `src/components/storefront/announcement-bar.tsx`:

```tsx
export function AnnouncementBar() {
  return (
    <div className="bg-announcement text-white text-center py-2 px-4">
      <p className="text-xs font-medium tracking-tight">
        Dërgim falas për porosi mbi 30€ · Paguaj me para në dorë
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create header**

Create `src/components/storefront/header.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { MobileMenu } from "./mobile-menu";
import { CartDrawer } from "./cart-drawer";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { openCart, itemCount } = useCart();

  return (
    <>
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2"
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          {/* Center: logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
            <span className="text-xl font-semibold tracking-tight text-text">BLINI HOME</span>
          </Link>

          {/* Desktop search bar */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <form action="/kerko" className="w-full relative">
              <input
                type="text"
                name="q"
                placeholder="Kërko produkte..."
                className="w-full h-10 pl-10 pr-4 rounded-full bg-search-bg text-sm outline-none focus:ring-2 focus:ring-accent"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </form>
          </div>

          {/* Right: icons */}
          <div className="flex items-center gap-1">
            {/* Mobile search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="lg:hidden p-2"
              aria-label="Kërko"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Cart */}
            <button onClick={openCart} className="p-2 relative" aria-label="Shporta">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-sale-badge text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar (expandable) */}
        {searchOpen && (
          <div className="lg:hidden px-4 pb-3">
            <form action="/kerko" className="relative">
              <input
                type="text"
                name="q"
                placeholder="Kërko produkte..."
                autoFocus
                className="w-full h-10 pl-10 pr-4 rounded-full bg-search-bg text-sm outline-none"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </form>
          </div>
        )}
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <CartDrawer />
    </>
  );
}
```

- [ ] **Step 3: Create navigation bar**

Create `src/components/storefront/navigation.tsx`:

```tsx
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Të reja", href: "/koleksion/te-rejat" },
  { label: "Më të shitura", href: "/koleksion/me-te-shitura" },
  { label: "Shtëpi & Kuzhinë", href: "/koleksion/shtepi-kuzhine" },
  { label: "Teknologji", href: "/koleksion/teknologji" },
  { label: "Fëmijë & Lodra", href: "/koleksion/femije-lodra" },
  { label: "Bukuri & Kujdes", href: "/koleksion/bukuri-kujdes" },
  { label: "Sporte", href: "/koleksion/sporte-aktivitete" },
  { label: "Veshje & Aksesore", href: "/koleksion/veshje-aksesore" },
  { label: "Nën €10 — Oferta!", href: "/koleksion/nen-10", isPromo: true },
];

export function Navigation() {
  return (
    <nav className="border-b border-border bg-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex overflow-x-auto hide-scrollbar px-4 gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap px-3 py-2.5 text-[15px] font-medium transition-colors hover:text-accent ${
                item.isPromo ? "text-sale font-semibold" : "text-text"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Create mobile menu**

Create `src/components/storefront/mobile-menu.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";

const MENU_ITEMS = [
  { label: "Kryefaqja", href: "/" },
  { label: "Të reja", href: "/koleksion/te-rejat" },
  { label: "Më të shitura", href: "/koleksion/me-te-shitura" },
  { label: "Shtëpi & Kuzhinë", href: "/koleksion/shtepi-kuzhine" },
  { label: "Teknologji", href: "/koleksion/teknologji" },
  { label: "Fëmijë & Lodra", href: "/koleksion/femije-lodra" },
  { label: "Bukuri & Kujdes", href: "/koleksion/bukuri-kujdes" },
  { label: "Sporte", href: "/koleksion/sporte-aktivitete" },
  { label: "Veshje & Aksesore", href: "/koleksion/veshje-aksesore" },
  { label: "Nën €10 — Oferta!", href: "/koleksion/nen-10", isPromo: true },
  { divider: true },
  { label: "Rreth nesh", href: "/rreth-nesh" },
  { label: "Dërgimi", href: "/dergimi" },
  { label: "Kthimi i produkteve", href: "/kthimi" },
  { label: "Pyetje të shpeshta", href: "/pyetje" },
];

export function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-white overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-lg font-semibold">Menu</span>
          <button onClick={onClose} className="p-1" aria-label="Mbyll">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="py-2">
          {MENU_ITEMS.map((item, i) =>
            "divider" in item ? (
              <div key={i} className="my-2 border-t border-border" />
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                onClick={onClose}
                className={`block px-6 py-3 text-[15px] font-medium ${
                  item.isPromo ? "text-sale" : "text-text"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create cart drawer**

Create `src/components/storefront/cart-drawer.tsx`:

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useCart } from "@/contexts/cart-context";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCart();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Shporta ({items.length})</h2>
          <button onClick={closeCart} className="p-1" aria-label="Mbyll">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">Shporta juaj është bosh</p>
              <button
                onClick={closeCart}
                className="text-sm font-semibold underline"
              >
                Vazhdo blerjen
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="w-20 h-24 bg-card-bg flex-shrink-0">
                    {item.thumbnail && (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        width={80}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/produkt/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium line-clamp-2 hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm font-bold mt-1">€{item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 border border-border flex items-center justify-center text-sm"
                      >
                        −
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-7 h-7 border border-border flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto text-text-secondary hover:text-text"
                        aria-label="Hiq"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex justify-between text-base font-semibold">
              <span>Nëntotali</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-text-secondary">Dërgimi llogaritet në hapin tjetër</p>
            <Link
              href="/porosia"
              onClick={closeCart}
              className="block w-full bg-text text-white text-center py-3 rounded-[7px] text-[15px] font-semibold"
            >
              Vazhdo me porosinë
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create footer**

Create `src/components/storefront/footer.tsx`:

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-text text-white mt-16">
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-semibold mb-3">BLINI HOME</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Gjithçka që ju nevojitet për shtëpinë, familjen dhe veten — me çmimet më të mira në Kosovë.
            </p>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Rreth nesh</h4>
            <nav className="space-y-2">
              <Link href="/rreth-nesh" className="block text-sm text-gray-400 hover:text-white">Kush jemi</Link>
              <Link href="/dergimi" className="block text-sm text-gray-400 hover:text-white">Dërgimi</Link>
              <Link href="/kthimi" className="block text-sm text-gray-400 hover:text-white">Kthimi i produkteve</Link>
            </nav>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Ndihmë</h4>
            <nav className="space-y-2">
              <Link href="/pyetje" className="block text-sm text-gray-400 hover:text-white">Pyetje të shpeshta</Link>
              <Link href="/privatesia" className="block text-sm text-gray-400 hover:text-white">Privatësia</Link>
              <Link href="/kushtet" className="block text-sm text-gray-400 hover:text-white">Kushtet e përdorimit</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Kontakti</h4>
            <p className="text-sm text-gray-400">info@blini.world</p>
            <p className="text-sm text-gray-400 mt-1">+383 44 000 000</p>
            <div className="flex gap-3 mt-4">
              <span className="text-gray-400 text-sm">Instagram</span>
              <span className="text-gray-400 text-sm">Facebook</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-center">
          <p className="text-xs text-gray-500">© 2026 BLINI HOME. Të gjitha të drejtat e rezervuara.</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: Update storefront layout**

Replace `src/app/(storefront)/layout.tsx` with:

```tsx
import { CartProvider } from "@/contexts/cart-context";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { Header } from "@/components/storefront/header";
import { Navigation } from "@/components/storefront/navigation";
import { Footer } from "@/components/storefront/footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <AnnouncementBar />
      <Header />
      <Navigation />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </CartProvider>
  );
}
```

- [ ] **Step 8: Verify build**

```bash
npm run build
```

- [ ] **Step 9: Commit**

```bash
git add src/components/storefront/ src/app/\(storefront\)/layout.tsx
git commit -m "feat: add storefront layout — header, nav, cart drawer, footer

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Product Card & Carousel Components

**Files:**
- Create: `src/components/storefront/product-card.tsx`
- Create: `src/components/storefront/product-carousel.tsx`

- [ ] **Step 1: Create product card (Flying Tiger style)**

Create `src/components/storefront/product-card.tsx`:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@prisma/client";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const price = Number(product.price);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const isOnSale = compareAt && compareAt > price;

  return (
    <div className="group w-[180px] sm:w-[220px] flex-shrink-0">
      {/* Image area — no border-radius, 5:7 aspect ratio */}
      <Link href={`/produkt/${product.slug}`} className="block relative" style={{ aspectRatio: "5/7" }}>
        <div className="w-full h-full bg-card-bg">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="220px"
              className="object-cover"
            />
          ) : product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              sizes="220px"
              className="object-cover"
            />
          ) : null}
        </div>

        {/* Badges */}
        {isOnSale && (
          <div className="absolute top-2 left-2 bg-sale-badge text-white text-[11px] font-bold w-14 h-14 rounded-full flex items-center justify-center">
            OFERTË
          </div>
        )}

        {/* Quick add — appears on hover */}
        <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem({
                productId: product.id,
                quantity: 1,
                price,
                title: product.title,
                thumbnail: product.thumbnail,
                slug: product.slug,
              });
            }}
            className="w-full bg-text text-white text-sm font-bold py-2 rounded-[7px]"
          >
            Shto në shportë
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-2">
        <Link href={`/produkt/${product.slug}`}>
          <h3 className="text-[15px] font-medium text-text line-clamp-2 leading-tight">
            {product.title}
          </h3>
        </Link>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={`text-xl font-bold tracking-tight ${isOnSale ? "text-sale" : "text-text"}`}>
            €{price.toFixed(2)}
          </span>
          {isOnSale && (
            <span className="text-sm text-text-secondary line-through">
              €{compareAt!.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create product carousel**

Create `src/components/storefront/product-carousel.tsx`:

```tsx
import type { Product } from "@prisma/client";
import { ProductCard } from "./product-card";

export function ProductCarousel({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: Product[];
  viewAllHref?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {viewAllHref && (
            <a
              href={viewAllHref}
              className="text-sm font-medium text-text-secondary hover:text-text underline"
            >
              Shiko të gjitha
            </a>
          )}
        </div>

        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/storefront/product-card.tsx src/components/storefront/product-carousel.tsx
git commit -m "feat: add Flying Tiger product card and carousel components

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Homepage Sections

**Files:**
- Create: `src/components/storefront/hero-banner.tsx`
- Create: `src/components/storefront/category-bubbles.tsx`
- Create: `src/components/storefront/promo-cards.tsx`
- Create: `src/components/storefront/delivery-info.tsx`
- Modify: `src/app/(storefront)/page.tsx` (replaces the placeholder)
- Delete or move: `src/app/page.tsx` (the root-level placeholder)

- [ ] **Step 1: Create hero banner**

Create `src/components/storefront/hero-banner.tsx`:

```tsx
import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="relative bg-card-bg" style={{ height: "400px" }}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#303061] to-[#6767A7]" />
      <div className="relative h-full max-w-[1400px] mx-auto px-4 flex flex-col items-center justify-center text-center">
        <p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-3">
          Koleksioni i ri
        </p>
        <h1 className="text-white text-[42px] font-semibold leading-tight tracking-tight max-w-lg">
          Gjithçka për shtëpinë tuaj
        </h1>
        <p className="text-white/70 text-lg mt-3 max-w-md">
          Zbulo produkte nga markat më të mira — me çmime të përballueshme
        </p>
        <Link
          href="/koleksion/te-rejat"
          className="mt-6 bg-hero-btn text-hero-btn-text px-8 py-3 rounded-full text-[15px] font-semibold hover:opacity-90 transition-opacity"
        >
          Zbulo tani
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create category bubbles**

Create `src/components/storefront/category-bubbles.tsx`:

```tsx
import Link from "next/link";

const CATEGORIES = [
  { label: "Shtëpi & Kuzhinë", slug: "shtepi-kuzhine", emoji: "🏠" },
  { label: "Teknologji", slug: "teknologji", emoji: "📱" },
  { label: "Fëmijë & Lodra", slug: "femije-lodra", emoji: "🧸" },
  { label: "Bukuri & Kujdes", slug: "bukuri-kujdes", emoji: "✨" },
  { label: "Sporte", slug: "sporte-aktivitete", emoji: "⚽" },
  { label: "Veshje & Aksesore", slug: "veshje-aksesore", emoji: "👕" },
  { label: "Të reja", slug: "te-rejat", emoji: "🆕" },
  { label: "Nën €10", slug: "nen-10", emoji: "🏷️" },
];

export function CategoryBubbles() {
  return (
    <section className="py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <h2 className="text-2xl font-semibold tracking-tight mb-5">Blej sipas kategorisë</h2>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/koleksion/${cat.slug}`}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-full bg-card-bg flex items-center justify-center text-4xl hover:scale-105 transition-transform">
                {cat.emoji}
              </div>
              <span className="text-[13px] sm:text-[15px] font-semibold text-center whitespace-nowrap">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create promo cards**

Create `src/components/storefront/promo-cards.tsx`:

```tsx
import Link from "next/link";

interface PromoCard {
  title: string;
  subtitle: string;
  href: string;
  gradient: string;
}

export function PromoCards({ cards }: { cards: [PromoCard, PromoCard] }) {
  return (
    <section className="py-4">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="relative block overflow-hidden"
              style={{ aspectRatio: "4/3" }}
            >
              <div className={`absolute inset-0 ${card.gradient}`} />
              <div className="relative h-full flex flex-col justify-end p-6">
                <h3 className="text-white text-2xl font-semibold tracking-tight">{card.title}</h3>
                <p className="text-white/80 text-sm mt-1">{card.subtitle}</p>
                <span className="mt-3 inline-flex w-fit bg-white text-text px-5 py-2 rounded-full text-sm font-semibold">
                  Zbulo
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create delivery info section**

Create `src/components/storefront/delivery-info.tsx`:

```tsx
export function DeliveryInfo() {
  return (
    <section className="bg-delivery-bg py-8 mt-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <h3 className="text-[15px] font-semibold">Dërgim i shpejtë</h3>
            <p className="text-sm text-text-secondary">1-3 ditë pune në të gjithë Kosovën</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
            <h3 className="text-[15px] font-semibold">Paguaj me para në dorë</h3>
            <p className="text-sm text-text-secondary">Paguani kur ta merrni produktin</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <h3 className="text-[15px] font-semibold">Kthim falas</h3>
            <p className="text-sm text-text-secondary">14 ditë për kthimin e produkteve</p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create homepage**

Delete `src/app/page.tsx` (the root placeholder) and create `src/app/(storefront)/page.tsx`:

```tsx
import { getNewArrivals, getActiveProducts } from "@/lib/queries";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { CategoryBubbles } from "@/components/storefront/category-bubbles";
import { ProductCarousel } from "@/components/storefront/product-carousel";
import { PromoCards } from "@/components/storefront/promo-cards";
import { DeliveryInfo } from "@/components/storefront/delivery-info";

export default async function HomePage() {
  const [newArrivals, bestSellers] = await Promise.all([
    getNewArrivals(12),
    getActiveProducts({ limit: 12, sortBy: "newest" }).then((r) => r.products),
  ]);

  return (
    <>
      <HeroBanner />

      <CategoryBubbles />

      <ProductCarousel
        title="Të rejat e javës"
        products={newArrivals}
        viewAllHref="/koleksion/te-rejat"
      />

      <PromoCards
        cards={[
          {
            title: "Ide për Dhurata",
            subtitle: "Gjej dhuratën perfekte për të dashurit tuaj",
            href: "/koleksion/te-rejat",
            gradient: "bg-gradient-to-br from-[#6767A7] to-[#303061]",
          },
          {
            title: "Gjithçka nën €10",
            subtitle: "Produkte cilësore me çmime të ulëta",
            href: "/koleksion/nen-10",
            gradient: "bg-gradient-to-br from-[#E83800] to-[#DC3545]",
          },
        ]}
      />

      <ProductCarousel
        title="Më të shitura"
        products={bestSellers}
        viewAllHref="/koleksion/me-te-shitura"
      />

      <PromoCards
        cards={[
          {
            title: "Teknologji & Gadgets",
            subtitle: "Pajisje smart për çdo ditë",
            href: "/koleksion/teknologji",
            gradient: "bg-gradient-to-br from-[#1a1a2e] to-[#16213e]",
          },
          {
            title: "Fëmijë & Familje",
            subtitle: "Lodra, kujdes dhe gjithçka për të vegjlit",
            href: "/koleksion/femije-lodra",
            gradient: "bg-gradient-to-br from-[#2d6a4f] to-[#40916c]",
          },
        ]}
      />

      <DeliveryInfo />
    </>
  );
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/components/storefront/hero-banner.tsx src/components/storefront/category-bubbles.tsx src/components/storefront/promo-cards.tsx src/components/storefront/delivery-info.tsx src/app/\(storefront\)/page.tsx
git rm src/app/page.tsx 2>/dev/null; true
git commit -m "feat: add homepage with hero, categories, carousels, promos, delivery info

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Collection Page

**Files:**
- Create: `src/components/storefront/product-grid.tsx`
- Create: `src/app/(storefront)/koleksion/[slug]/page.tsx`

- [ ] **Step 1: Create product grid component**

Create `src/components/storefront/product-grid.tsx`:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@prisma/client";

export function ProductGrid({ products }: { products: Product[] }) {
  const { addItem } = useCart();

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary text-lg">Nuk u gjetën produkte</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => {
        const price = Number(product.price);
        const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
        const isOnSale = compareAt && compareAt > price;

        return (
          <div key={product.id} className="group">
            <Link href={`/produkt/${product.slug}`} className="block relative" style={{ aspectRatio: "5/7" }}>
              <div className="w-full h-full bg-card-bg">
                {(product.thumbnail || product.images[0]) && (
                  <Image
                    src={product.thumbnail || product.images[0]}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                )}
              </div>
              {isOnSale && (
                <div className="absolute top-2 left-2 bg-sale-badge text-white text-[11px] font-bold w-14 h-14 rounded-full flex items-center justify-center">
                  OFERTË
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addItem({
                      productId: product.id,
                      quantity: 1,
                      price,
                      title: product.title,
                      thumbnail: product.thumbnail,
                      slug: product.slug,
                    });
                  }}
                  className="w-full bg-text text-white text-sm font-bold py-2 rounded-[7px]"
                >
                  Shto në shportë
                </button>
              </div>
            </Link>
            <div className="mt-2">
              <Link href={`/produkt/${product.slug}`}>
                <h3 className="text-[15px] font-medium text-text line-clamp-2 leading-tight">{product.title}</h3>
              </Link>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-xl font-bold tracking-tight ${isOnSale ? "text-sale" : "text-text"}`}>
                  €{price.toFixed(2)}
                </span>
                {isOnSale && (
                  <span className="text-sm text-text-secondary line-through">€{compareAt!.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create collection page**

Create `src/app/(storefront)/koleksion/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCollectionBySlug, getActiveProducts } from "@/lib/queries";
import { ProductGrid } from "@/components/storefront/product-grid";

const SORT_OPTIONS = [
  { value: "newest", label: "Më të rejat" },
  { value: "price-asc", label: "Çmimi: Ulët → Lartë" },
  { value: "price-desc", label: "Çmimi: Lartë → Ulët" },
  { value: "name", label: "Emri: A → Z" },
];

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  const { slug } = await params;
  const { sort = "newest", page = "1" } = await searchParams;

  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const pageNum = Math.max(1, parseInt(page));
  const limit = 24;
  const offset = (pageNum - 1) * limit;

  const { products, total } = await getActiveProducts({
    collectionSlug: slug,
    sortBy: sort as any,
    limit,
    offset,
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-text">Kryefaqja</Link>
        <span className="mx-2">/</span>
        <span className="text-text">{collection.title}</span>
      </nav>

      {/* Title & sort */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{collection.title}</h1>
          <p className="text-text-secondary text-sm mt-1">{total} produkte</p>
        </div>

        <form className="hidden sm:block">
          <select
            name="sort"
            defaultValue={sort}
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set("sort", e.target.value);
              url.searchParams.delete("page");
              window.location.href = url.toString();
            }}
            className="text-sm border border-border rounded px-3 py-2 bg-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </form>
      </div>

      {/* Product grid */}
      <ProductGrid products={products} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/koleksion/${slug}?sort=${sort}&page=${p}`}
              className={`w-10 h-10 flex items-center justify-center text-sm font-medium border ${
                p === pageNum
                  ? "bg-text text-white border-text"
                  : "border-border hover:bg-card-bg"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/storefront/product-grid.tsx src/app/\(storefront\)/koleksion/
git commit -m "feat: add collection page with product grid, sort, pagination

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Product Detail Page

**Files:**
- Create: `src/components/storefront/image-gallery.tsx`
- Create: `src/app/(storefront)/produkt/[slug]/page.tsx`

- [ ] **Step 1: Create image gallery**

Create `src/components/storefront/image-gallery.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useState } from "react";

export function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return <div className="w-full bg-card-bg" style={{ aspectRatio: "5/7" }} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative w-full bg-card-bg" style={{ aspectRatio: "5/7" }}>
        <Image
          src={images[selected]}
          alt={`${title} - ${selected + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-16 h-20 flex-shrink-0 bg-card-bg relative ${
                i === selected ? "ring-2 ring-text" : ""
              }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create product detail page**

Create `src/app/(storefront)/produkt/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { ImageGallery } from "@/components/storefront/image-gallery";
import { ProductCarousel } from "@/components/storefront/product-carousel";
import { AddToCartButton } from "./add-to-cart-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.title} — BLINI HOME`,
    description: product.description?.substring(0, 160) || undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const price = Number(product.price);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const isOnSale = compareAt && compareAt > price;
  const allImages = product.images.length > 0 ? product.images : product.thumbnail ? [product.thumbnail] : [];

  const related = await getRelatedProducts(product.id, product.category, 6);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-text">Kryefaqja</Link>
        <span className="mx-2">/</span>
        <span className="text-text">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <ImageGallery images={allImages} title={product.title} />

        {/* Info */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{product.title}</h1>

          <div className="mt-3 flex items-baseline gap-3">
            <span className={`text-3xl font-bold tracking-tight ${isOnSale ? "text-sale" : "text-text"}`}>
              €{price.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-lg text-text-secondary line-through">
                €{compareAt!.toFixed(2)}
              </span>
            )}
          </div>

          {isOnSale && (
            <p className="text-sale text-sm font-semibold mt-1">
              Kurseni €{(compareAt! - price).toFixed(2)}
            </p>
          )}

          {/* Add to cart */}
          <div className="mt-6">
            <AddToCartButton
              product={{
                id: product.id,
                title: product.title,
                price,
                thumbnail: product.thumbnail,
                slug: product.slug,
              }}
            />
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-[15px] font-semibold mb-3">Përshkrimi</h3>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Delivery info */}
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="text-[15px] font-semibold mb-3">Dërgimi</h3>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>📦 Dërgim 1-3 ditë pune</li>
              <li>💰 Paguaj me para në dorë (COD)</li>
              <li>🔄 Kthim falas brenda 14 ditëve</li>
            </ul>
          </div>

          {/* Source store */}
          <p className="text-xs text-text-secondary mt-6">
            Burimi: {product.sourceStore === "shporta" ? "Shporta.shop" : product.sourceStore === "tregu" ? "Tregu.shop" : "BennyGroup"}
          </p>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-16">
          <ProductCarousel title="Produkte të ngjashme" products={related} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create add-to-cart button (client component)**

Create `src/app/(storefront)/produkt/[slug]/add-to-cart-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useCart } from "@/contexts/cart-context";

export function AddToCartButton({
  product,
}: {
  product: {
    id: string;
    title: string;
    price: number;
    thumbnail: string | null;
    slug: string;
  };
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-border">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center text-lg"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center text-lg"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={() => {
          addItem({
            productId: product.id,
            quantity,
            price: product.price,
            title: product.title,
            thumbnail: product.thumbnail,
            slug: product.slug,
          });
          setQuantity(1);
        }}
        className="w-full bg-text text-white py-3.5 rounded-[7px] text-[15px] font-semibold hover:bg-text/90 transition-colors"
      >
        Shto në shportë — €{(product.price * quantity).toFixed(2)}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/storefront/image-gallery.tsx src/app/\(storefront\)/produkt/
git commit -m "feat: add product detail page with image gallery, add-to-cart, related products

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Search API & Page

**Files:**
- Create: `src/app/api/search/route.ts`
- Create: `src/app/(storefront)/kerko/page.tsx`

- [ ] **Step 1: Create search API route**

Create `src/app/api/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { meili, PRODUCTS_INDEX } from "@/lib/meilisearch";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "24");
  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

  if (!q.trim()) {
    return NextResponse.json({ hits: [], estimatedTotalHits: 0, query: "" });
  }

  const results = await meili.index(PRODUCTS_INDEX).search(q, {
    limit,
    offset,
    filter: ["isActive = true"],
    attributesToRetrieve: [
      "id", "title", "slug", "price", "compareAtPrice",
      "thumbnail", "category", "sourceStore", "collections",
    ],
  });

  return NextResponse.json(results);
}
```

- [ ] **Step 2: Create search results page**

Create `src/app/(storefront)/kerko/page.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import { meili, PRODUCTS_INDEX } from "@/lib/meilisearch";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  let results: any = { hits: [], estimatedTotalHits: 0 };

  if (q.trim()) {
    results = await meili.index(PRODUCTS_INDEX).search(q, {
      limit: 48,
      filter: ["isActive = true"],
      attributesToRetrieve: [
        "id", "title", "slug", "price", "compareAtPrice",
        "thumbnail", "category", "sourceStore",
      ],
    });
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Kërko</h1>

      {/* Search form */}
      <form action="/kerko" className="mb-8">
        <div className="relative max-w-xl">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Kërko produkte..."
            autoFocus
            className="w-full h-12 pl-12 pr-4 rounded-full bg-search-bg text-base outline-none focus:ring-2 focus:ring-accent"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </form>

      {q.trim() && (
        <p className="text-text-secondary text-sm mb-6">
          {results.estimatedTotalHits} rezultate për &ldquo;{q}&rdquo;
        </p>
      )}

      {/* Results grid */}
      {results.hits.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.hits.map((hit: any) => {
            const price = Number(hit.price);
            const compareAt = hit.compareAtPrice ? Number(hit.compareAtPrice) : null;
            const isOnSale = compareAt && compareAt > price;

            return (
              <Link key={hit.slug} href={`/produkt/${hit.slug}`} className="group">
                <div className="relative bg-card-bg" style={{ aspectRatio: "5/7" }}>
                  {hit.thumbnail && (
                    <Image
                      src={hit.thumbnail}
                      alt={hit.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  )}
                  {isOnSale && (
                    <div className="absolute top-2 left-2 bg-sale-badge text-white text-[11px] font-bold w-14 h-14 rounded-full flex items-center justify-center">
                      OFERTË
                    </div>
                  )}
                </div>
                <h3 className="text-[15px] font-medium text-text line-clamp-2 mt-2">{hit.title}</h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className={`text-xl font-bold tracking-tight ${isOnSale ? "text-sale" : "text-text"}`}>
                    €{price.toFixed(2)}
                  </span>
                  {isOnSale && (
                    <span className="text-sm text-text-secondary line-through">€{compareAt!.toFixed(2)}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : q.trim() ? (
        <div className="text-center py-16">
          <p className="text-text-secondary text-lg">Nuk u gjetën produkte për &ldquo;{q}&rdquo;</p>
          <Link href="/" className="text-sm font-semibold underline mt-4 inline-block">
            Kthehu në kryefaqje
          </Link>
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/search/ src/app/\(storefront\)/kerko/
git commit -m "feat: add search API (Meilisearch) and search results page

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 10: Checkout & Order API

**Files:**
- Create: `src/app/api/orders/route.ts`
- Create: `src/app/(storefront)/porosia/page.tsx`
- Create: `src/app/(storefront)/porosia/checkout-form.tsx`
- Create: `src/app/(storefront)/porosia/konfirmim/[id]/page.tsx`

- [ ] **Step 1: Create orders API**

Create `src/app/api/orders/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateOrderNumber(): string {
  const prefix = "BH";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { customerName, customerPhone, customerEmail, city, address, notes, items } = body as {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    city: string;
    address: string;
    notes?: string;
    items: { productId: string; quantity: number; price: number }[];
  };

  // Validate required fields
  if (!customerName?.trim() || !customerPhone?.trim() || !city?.trim() || !address?.trim()) {
    return NextResponse.json(
      { error: "Emri, telefoni, qyteti dhe adresa janë të detyrueshme" },
      { status: 400 }
    );
  }

  if (!items?.length) {
    return NextResponse.json({ error: "Shporta është bosh" }, { status: 400 });
  }

  // Verify products exist and prices match
  const productIds = items.map((i) => i.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== items.length) {
    return NextResponse.json(
      { error: "Disa produkte nuk janë më të disponueshme" },
      { status: 400 }
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 30 ? 0 : 2.5;
  const total = subtotal + deliveryFee;

  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim() || null,
      city: city.trim(),
      address: address.trim(),
      notes: notes?.trim() || null,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: "COD",
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json({ order }, { status: 201 });
}
```

- [ ] **Step 2: Create checkout form (client component)**

Create `src/app/(storefront)/porosia/checkout-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const deliveryFee = subtotal >= 30 ? 0 : 2.5;
  const total = subtotal + deliveryFee;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("name"),
          customerPhone: form.get("phone"),
          customerEmail: form.get("email") || undefined,
          city: form.get("city"),
          address: form.get("address"),
          notes: form.get("notes") || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Diçka shkoi keq");
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/porosia/konfirmim/${data.order.id}`);
    } catch {
      setError("Diçka shkoi keq. Ju lutem provoni përsëri.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary text-lg mb-4">Shporta juaj është bosh</p>
        <a href="/" className="text-sm font-semibold underline">Kthehu në kryefaqje</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Form fields */}
      <div className="lg:col-span-3 space-y-4">
        <h2 className="text-xl font-semibold mb-2">Të dhënat e dërgesës</h2>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Emri i plotë *</label>
          <input
            id="name"
            name="name"
            required
            className="w-full h-11 px-3 border border-border rounded text-sm outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">Numri i telefonit *</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="+383 4X XXX XXX"
            className="w-full h-11 px-3 border border-border rounded text-sm outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email (opsional)</label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full h-11 px-3 border border-border rounded text-sm outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">Qyteti *</label>
          <select
            id="city"
            name="city"
            required
            className="w-full h-11 px-3 border border-border rounded text-sm outline-none focus:ring-2 focus:ring-accent bg-white"
          >
            <option value="">Zgjidhni qytetin</option>
            <option value="Prishtinë">Prishtinë</option>
            <option value="Prizren">Prizren</option>
            <option value="Pejë">Pejë</option>
            <option value="Mitrovicë">Mitrovicë</option>
            <option value="Gjilan">Gjilan</option>
            <option value="Ferizaj">Ferizaj</option>
            <option value="Gjakovë">Gjakovë</option>
          </select>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-1">Adresa *</label>
          <input
            id="address"
            name="address"
            required
            placeholder="Rruga, numri, kati..."
            className="w-full h-11 px-3 border border-border rounded text-sm outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">Shënime (opsional)</label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full px-3 py-2 border border-border rounded text-sm outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        </div>

        {error && (
          <p className="text-sale text-sm font-medium">{error}</p>
        )}
      </div>

      {/* Order summary */}
      <div className="lg:col-span-2">
        <div className="bg-card-bg p-6 sticky top-20">
          <h2 className="text-lg font-semibold mb-4">Përmbledhja e porosisë</h2>

          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="line-clamp-1 mr-2">{item.title} × {item.quantity}</span>
                <span className="font-medium flex-shrink-0">€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Nëntotali</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Dërgimi</span>
              <span>{deliveryFee === 0 ? "FALAS" : `€${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
              <span>Totali</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-xs text-text-secondary mt-3 mb-4">
            💰 Pagesa: Para në dorë (COD)
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-text text-white py-3.5 rounded-[7px] text-[15px] font-semibold hover:bg-text/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Duke dërguar..." : `Konfirmo Porosinë — €${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Create checkout page**

Create `src/app/(storefront)/porosia/page.tsx`:

```tsx
import Link from "next/link";
import { CheckoutForm } from "./checkout-form";

export const metadata = {
  title: "Porosia — BLINI HOME",
};

export default function CheckoutPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <nav className="text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-text">Kryefaqja</Link>
        <span className="mx-2">/</span>
        <span className="text-text">Porosia</span>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight mb-8">Porosia</h1>

      <CheckoutForm />
    </div>
  );
}
```

- [ ] **Step 4: Create order confirmation page**

Create `src/app/(storefront)/porosia/konfirmim/[id]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="mb-6">
        <svg className="mx-auto text-green-500" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight mb-2">Faleminderit!</h1>
      <p className="text-text-secondary text-lg mb-1">Porosia juaj u dërgua me sukses.</p>
      <p className="text-sm text-text-secondary mb-8">
        Numri i porosisë: <strong className="text-text">{order.orderNumber}</strong>
      </p>

      <div className="bg-card-bg p-6 text-left mb-8">
        <h2 className="text-lg font-semibold mb-4">Detajet e porosisë</h2>

        <div className="space-y-2 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.product.title} × {item.quantity}</span>
              <span className="font-medium">€{(Number(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-4 pt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Nëntotali</span>
            <span>€{Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Dërgimi</span>
            <span>{Number(order.deliveryFee) === 0 ? "FALAS" : `€${Number(order.deliveryFee).toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
            <span>Totali</span>
            <span>€{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-card-bg p-6 text-left mb-8">
        <h2 className="text-lg font-semibold mb-3">Çfarë ndodh tani?</h2>
        <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
          <li>Do të kontaktoheni me telefon për konfirmimin e porosisë</li>
          <li>Porosia dërgohet brenda 1-3 ditëve pune</li>
          <li>Paguani me para në dorë kur ta merrni produktin</li>
        </ol>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Dërgimi tek: {order.customerName}, {order.address}, {order.city}
        </p>
      </div>

      <Link
        href="/"
        className="inline-block mt-8 bg-text text-white px-8 py-3 rounded-[7px] text-[15px] font-semibold"
      >
        Vazhdo blerjen
      </Link>
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/orders/ src/app/\(storefront\)/porosia/
git commit -m "feat: add checkout flow — order API, checkout form, confirmation page

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 11: Static Pages

**Files:**
- Create: `src/app/(storefront)/rreth-nesh/page.tsx`
- Create: `src/app/(storefront)/dergimi/page.tsx`
- Create: `src/app/(storefront)/kthimi/page.tsx`
- Create: `src/app/(storefront)/pyetje/page.tsx`
- Create: `src/app/(storefront)/privatesia/page.tsx`
- Create: `src/app/(storefront)/kushtet/page.tsx`

- [ ] **Step 1: Create about page**

Create `src/app/(storefront)/rreth-nesh/page.tsx`:

```tsx
export const metadata = { title: "Rreth nesh — BLINI HOME" };

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Rreth nesh</h1>
      <div className="prose prose-lg text-text-secondary space-y-4 text-[16px] leading-[1.8]">
        <p>
          BLINI HOME është dyqani juaj online për gjithçka që ju nevojitet për shtëpinë, familjen
          dhe veten — me çmimet më të mira në Kosovë.
        </p>
        <p>
          Ne bashkojmë produktet nga dyqanet më të mira lokale dhe ndërkombëtare në një vend,
          duke ju ofruar cilësi, çmime të përballueshme dhe dërgim të shpejtë në të gjithë Kosovën.
        </p>
        <p>
          Misioni ynë është thjesht: të bëjmë blerjen online të lehtë, të sigurt dhe të
          përballueshme për çdo familje në Kosovë.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create delivery page**

Create `src/app/(storefront)/dergimi/page.tsx`:

```tsx
export const metadata = { title: "Dërgimi — BLINI HOME" };

export default function DeliveryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Dërgimi</h1>
      <div className="space-y-6 text-[16px] leading-[1.8] text-text-secondary">
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Koha e dërgimit</h2>
          <p>Dërgimi bëhet brenda 1-3 ditëve pune pas konfirmimit të porosisë.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Çmimi i dërgimit</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Porosi mbi €30:</strong> Dërgim FALAS</li>
            <li><strong>Porosi nën €30:</strong> €2.50</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Zonat e dërgimit</h2>
          <p>Dërgojmë në të gjitha qytetet e Kosovës: Prishtinë, Prizren, Pejë, Mitrovicë, Gjilan, Ferizaj, Gjakovë dhe qytetet tjera.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Pagesa</h2>
          <p>Pagesa bëhet me para në dorë (COD) kur ta merrni produktin nga korieri.</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create returns page**

Create `src/app/(storefront)/kthimi/page.tsx`:

```tsx
export const metadata = { title: "Kthimi i produkteve — BLINI HOME" };

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Kthimi i produkteve</h1>
      <div className="space-y-6 text-[16px] leading-[1.8] text-text-secondary">
        <p>Keni 14 ditë nga dita e marrjes së produktit për ta kthyer atë.</p>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Kushtet e kthimit</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Produkti duhet të jetë i papërdorur dhe në paketimin origjinal</li>
            <li>Duhet të ruani faturën ose konfirmimin e porosisë</li>
            <li>Kthimi është falas — ne e mbulojmë koston e dërgimit</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Si të ktheni një produkt</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Na kontaktoni në info@blini.world ose +383 44 000 000</li>
            <li>Përshkruani arsyen e kthimit</li>
            <li>Do t&apos;ju dërgojmë kodin për kthim</li>
            <li>Rimbursimi bëhet brenda 5-7 ditëve pune</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create FAQ page**

Create `src/app/(storefront)/pyetje/page.tsx`:

```tsx
export const metadata = { title: "Pyetje të shpeshta — BLINI HOME" };

const FAQS = [
  {
    q: "Si mund të porosisë?",
    a: "Zgjidhni produktin, shtojeni në shportë, plotësoni formularin e porosisë dhe konfirmoni. Do t'ju kontaktojmë me telefon.",
  },
  {
    q: "Si paguhet?",
    a: "Pagesa bëhet vetëm me para në dorë (Cash on Delivery). Paguani kur ta merrni produktin nga korieri.",
  },
  {
    q: "Sa zgjat dërgimi?",
    a: "Dërgimi bëhet brenda 1-3 ditëve pune në të gjithë Kosovën.",
  },
  {
    q: "A mund ta kthej produktin?",
    a: "Po, keni 14 ditë për kthimin e produkteve. Produkti duhet të jetë i papërdorur dhe në paketimin origjinal.",
  },
  {
    q: "A ka dërgim falas?",
    a: "Po! Dërgimi është falas për porosi mbi €30. Për porosi nën €30, dërgimi kushton €2.50.",
  },
  {
    q: "Si mund t'ju kontaktoj?",
    a: "Na shkruani në info@blini.world ose na thirrni në +383 44 000 000.",
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Pyetje të shpeshta</h1>
      <div className="space-y-6">
        {FAQS.map((faq, i) => (
          <div key={i} className="border-b border-border pb-6">
            <h2 className="text-[17px] font-semibold mb-2">{faq.q}</h2>
            <p className="text-text-secondary text-[16px] leading-[1.8]">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create privacy policy page**

Create `src/app/(storefront)/privatesia/page.tsx`:

```tsx
export const metadata = { title: "Privatësia — BLINI HOME" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Politika e privatësisë</h1>
      <div className="space-y-6 text-[16px] leading-[1.8] text-text-secondary">
        <p>BLINI HOME respekton privatësinë tuaj. Kjo politikë shpjegon se si i mbledhim, përdorim dhe mbrojmë të dhënat tuaja personale.</p>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Të dhënat që mbledhim</h2>
          <p>Kur bëni një porosi, mbledhim: emrin, numrin e telefonit, adresën e dërgimit, dhe email-in (opsional).</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Si i përdorim</h2>
          <p>Të dhënat përdoren vetëm për përpunimin e porosive dhe dërgimin e produkteve. Nuk i ndajmë të dhënat me palë të treta.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Kontakti</h2>
          <p>Për çdo pyetje rreth privatësisë, na kontaktoni në info@blini.world.</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create terms page**

Create `src/app/(storefront)/kushtet/page.tsx`:

```tsx
export const metadata = { title: "Kushtet e përdorimit — BLINI HOME" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Kushtet e përdorimit</h1>
      <div className="space-y-6 text-[16px] leading-[1.8] text-text-secondary">
        <p>Duke përdorur faqen BLINI HOME, ju pranoni këto kushte.</p>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Porositë</h2>
          <p>Të gjitha porositë janë të vlefshme pasi të konfirmohen nga ekipi ynë. Çmimet mund të ndryshojnë pa njoftim paraprak.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Pagesa</h2>
          <p>Pagesa bëhet vetëm me para në dorë (COD) kur ta merrni produktin. Nuk pranojmë pagesa online.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Produktet</h2>
          <p>Ne jemi agregator — produktet vijnë nga furnizues të ndryshëm. Bëjmë përpjekje për saktësinë e informacionit por nuk garantojmë disponueshmërinë.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Përgjegjësia</h2>
          <p>BLINI HOME nuk mban përgjegjësi për vonesa të shkaktuara nga furnizuesit ose shërbimet e dërgimit.</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/\(storefront\)/rreth-nesh/ src/app/\(storefront\)/dergimi/ src/app/\(storefront\)/kthimi/ src/app/\(storefront\)/pyetje/ src/app/\(storefront\)/privatesia/ src/app/\(storefront\)/kushtet/
git commit -m "feat: add static pages — about, delivery, returns, FAQ, privacy, terms

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 12: Build, Test & Deploy

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: All existing tests pass (scraper/sync tests from Plan 2).

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: Clean build with all new routes listed.

- [ ] **Step 3: Start dev server and verify pages load**

```bash
npm run dev &
sleep 5
# Test key pages
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/koleksion/te-rejat
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/kerko?q=test
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/porosia
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/rreth-nesh
kill %1
```

Expected: All return 200.

- [ ] **Step 4: Push and deploy to CT 110**

```bash
git push origin main
```

Then SSH to CT 110 and update:
```bash
ssh root@192.168.100.50
pct exec 110 -- bash -c 'cd /app && git pull origin main && npm install && npx prisma generate && npm run build && pm2 restart blini-home'
exit
```

- [ ] **Step 5: Verify live site**

```bash
curl -s -o /dev/null -w "%{http_code}" https://home.blini.world/
curl -s -o /dev/null -w "%{http_code}" https://home.blini.world/koleksion/te-rejat
curl -s -o /dev/null -w "%{http_code}" https://home.blini.world/api/health
```

Expected: All return 200.

- [ ] **Step 6: Final commit**

```bash
git push origin main
```

---

## Summary

After completing Plan 3, you will have:

- Complete Flying Tiger Copenhagen-inspired storefront design system
- Responsive layout: announcement bar, header with search & cart, category navigation, footer
- Cart slide-out drawer with localStorage persistence
- Homepage: hero banner, category bubbles, product carousels, promo cards, delivery info
- Collection page with product grid, sorting, pagination
- Product detail page with image gallery, add-to-cart, related products
- Search page powered by Meilisearch
- Full checkout flow: form → order API → confirmation page (COD only)
- 6 static pages: about, delivery, returns, FAQ, privacy, terms
- All deployed and live on CT 110
