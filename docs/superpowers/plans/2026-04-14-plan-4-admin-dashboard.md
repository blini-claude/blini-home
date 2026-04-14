# Plan 4: Admin Dashboard — BLINI-HOME

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the admin dashboard for managing orders, products, collections, customers, and sync operations — all in English UI.

**Architecture:** Next.js 16 App Router with route group `(admin)` for admin pages. JWT auth via `jose` (edge-compatible) stored in httpOnly cookies. Middleware protects all `/admin` routes except `/admin/login`. Server Components for data pages, Client Components for forms and interactive tables. All admin API routes under `/api/admin/`.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Prisma 7, jose (JWT), bcryptjs (password hashing)

**Spec:** `docs/superpowers/specs/2026-04-14-blini-home-design.md` — "Admin Dashboard" section

---

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx              # Login form (NO admin layout)
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Admin shell: sidebar + header
│   │   │   ├── page.tsx              # Dashboard overview
│   │   │   ├── orders/
│   │   │   │   └── page.tsx          # Orders management
│   │   │   ├── products/
│   │   │   │   └── page.tsx          # Products management
│   │   │   ├── collections/
│   │   │   │   └── page.tsx          # Collections management
│   │   │   ├── customers/
│   │   │   │   └── page.tsx          # Customer lookup
│   │   │   └── sync/
│   │   │       └── page.tsx          # Sync controls
│   └── api/
│       └── admin/
│           ├── auth/
│           │   ├── login/route.ts    # POST login
│           │   └── logout/route.ts   # POST logout
│           ├── stats/route.ts        # GET dashboard stats
│           ├── orders/
│           │   ├── route.ts          # GET orders list
│           │   └── [id]/
│           │       └── route.ts      # PATCH order status
│           ├── products/
│           │   ├── route.ts          # GET products list
│           │   └── [id]/
│           │       └── route.ts      # PATCH product fields
│           ├── collections/
│           │   ├── route.ts          # GET list, POST create
│           │   └── [id]/
│           │       └── route.ts      # PATCH update, DELETE
│           ├── customers/
│           │   └── route.ts          # GET customers list
│           └── sync/route.ts         # Already exists (no changes)
├── components/
│   └── admin/
│       ├── sidebar.tsx               # Left sidebar navigation
│       ├── admin-header.tsx          # Top bar with title + logout
│       ├── stats-card.tsx            # Dashboard stat card
│       ├── orders-table.tsx          # Interactive orders table
│       ├── order-status-badge.tsx    # Status badge with colors
│       ├── products-table.tsx        # Interactive products table
│       ├── product-edit-modal.tsx    # Edit price/description modal
│       ├── collections-manager.tsx   # Collections CRUD
│       ├── collection-form.tsx       # Create/edit collection form
│       ├── customers-table.tsx       # Customers lookup table
│       └── sync-panel.tsx            # Sync trigger + log viewer
├── lib/
│   └── admin-auth.ts                # JWT sign/verify + cookie helpers
└── middleware.ts                      # Protect /admin routes (except /admin/login)
scripts/
└── seed-admin.ts                      # Create initial admin user
```

---

## Task 1: Auth Library, Seed Script & Login API

**Files:**
- Create: `src/lib/admin-auth.ts`
- Create: `scripts/seed-admin.ts`
- Create: `src/app/api/admin/auth/login/route.ts`
- Create: `src/app/api/admin/auth/logout/route.ts`

- [ ] **Step 1: Install dependencies**

```bash
npm install jose bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 2: Create auth library**

Create `src/lib/admin-auth.ts`:

```typescript
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "blini-home-admin-secret-change-me"
);
const COOKIE_NAME = "admin-token";

export async function signToken(payload: { id: string; email: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: string; email: string };
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export { COOKIE_NAME, JWT_SECRET };
```

- [ ] **Step 3: Create seed admin script**

Create `scripts/seed-admin.ts`:

```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import bcrypt from "bcryptjs";

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  const email = process.env.ADMIN_EMAIL || "admin@blini.world";
  const password = process.env.ADMIN_PASSWORD || "blinihome2026";

  const hash = await bcrypt.hash(password, 12);

  const user = await db.adminUser.upsert({
    where: { email },
    update: { passwordHash: hash },
    create: { email, passwordHash: hash },
  });

  console.log(`Admin user ready: ${user.email} (id: ${user.id})`);

  await db.$disconnect();
  await pool.end();
}

main().catch(console.error);
```

- [ ] **Step 4: Create login API route**

Create `src/app/api/admin/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = await db.adminUser.findUnique({
    where: { email: body.email },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signToken({ id: user.id, email: user.email });
  await setAuthCookie(token);

  return NextResponse.json({ success: true, email: user.email });
}
```

- [ ] **Step 5: Create logout API route**

Create `src/app/api/admin/auth/logout/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/admin-auth";

export async function POST() {
  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/admin-auth.ts scripts/seed-admin.ts src/app/api/admin/auth/
git commit -m "feat: add admin auth library, seed script, login/logout API

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Middleware & Login Page

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/admin/login/page.tsx`

- [ ] **Step 1: Create middleware for admin route protection**

Create `src/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "blini-home-admin-secret-change-me"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except /admin/login)
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Also allow admin API routes to handle their own auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 2: Create login page**

Create `src/app/admin/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#121212]">BLINI HOME</h1>
          <p className="text-sm text-[#707070] mt-1">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-[#e5e7eb] p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              className="w-full h-10 px-3 border border-[#d1d5db] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6767A7] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#374151] mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full h-10 px-3 border border-[#d1d5db] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6767A7] focus:border-transparent"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#121212] text-white rounded-md text-sm font-medium hover:bg-[#121212]/90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
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
git add src/middleware.ts src/app/admin/login/
git commit -m "feat: add admin middleware and login page

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Admin Layout (Sidebar + Header)

**Files:**
- Create: `src/components/admin/sidebar.tsx`
- Create: `src/components/admin/admin-header.tsx`
- Create: `src/app/admin/(dashboard)/layout.tsx`

- [ ] **Step 1: Create sidebar**

Create `src/components/admin/sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "grid" },
  { label: "Orders", href: "/admin/orders", icon: "package" },
  { label: "Products", href: "/admin/products", icon: "box" },
  { label: "Collections", href: "/admin/collections", icon: "layers" },
  { label: "Customers", href: "/admin/customers", icon: "users" },
  { label: "Sync", href: "/admin/sync", icon: "refresh" },
];

const ICONS: Record<string, JSX.Element> = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  ),
  package: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  box: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    </svg>
  ),
  layers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m2 12 8.58 3.91a2 2 0 0 0 1.66 0L21 12" />
      <path d="m2 17 8.58 3.91a2 2 0 0 0 1.66 0L21 17" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  refresh: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  ),
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] bg-[#121212] text-white flex flex-col min-h-screen fixed left-0 top-0">
      <div className="p-4 border-b border-white/10">
        <Link href="/admin" className="text-lg font-bold tracking-tight">
          BLINI HOME
        </Link>
        <p className="text-[11px] text-gray-400 mt-0.5">Admin Dashboard</p>
      </div>

      <nav className="flex-1 py-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {ICONS[item.icon]}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link href="/" className="text-[12px] text-gray-400 hover:text-white">
          ← View Storefront
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create admin header**

Create `src/components/admin/admin-header.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";

export function AdminHeader({ title }: { title: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="h-14 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-[#121212]">{title}</h1>
      <button
        onClick={handleLogout}
        className="text-sm text-[#707070] hover:text-[#121212]"
      >
        Sign out
      </button>
    </header>
  );
}
```

- [ ] **Step 3: Create admin dashboard layout**

Create `src/app/admin/(dashboard)/layout.tsx`:

```tsx
import { Sidebar } from "@/components/admin/sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <Sidebar />
      <div className="flex-1 ml-[220px]">{children}</div>
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
git add src/components/admin/ src/app/admin/\(dashboard\)/layout.tsx
git commit -m "feat: add admin layout with sidebar and header

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Dashboard Page + Stats API

**Files:**
- Create: `src/components/admin/stats-card.tsx`
- Create: `src/app/api/admin/stats/route.ts`
- Create: `src/app/admin/(dashboard)/page.tsx`

- [ ] **Step 1: Create stats card component**

Create `src/components/admin/stats-card.tsx`:

```tsx
export function StatsCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] p-5">
      <p className="text-sm text-[#707070] font-medium">{label}</p>
      <p className="text-2xl font-bold text-[#121212] mt-1">{value}</p>
      {subtitle && <p className="text-xs text-[#707070] mt-1">{subtitle}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Create stats API route**

Create `src/app/api/admin/stats/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const [
    totalProducts,
    activeProducts,
    todayOrders,
    todayRevenue,
    pendingOrders,
    weekOrders,
    weekRevenue,
    totalOrders,
    recentOrders,
    syncLogs,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { isActive: true } }),
    db.order.count({ where: { createdAt: { gte: todayStart } } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: todayStart } },
    }),
    db.order.count({ where: { status: "pending" } }),
    db.order.count({ where: { createdAt: { gte: weekStart } } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: weekStart } },
    }),
    db.order.count(),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: { include: { product: true } } },
    }),
    db.syncLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 3,
    }),
  ]);

  return NextResponse.json({
    totalProducts,
    activeProducts,
    todayOrders,
    todayRevenue: Number(todayRevenue._sum.total || 0),
    pendingOrders,
    weekOrders,
    weekRevenue: Number(weekRevenue._sum.total || 0),
    totalOrders,
    recentOrders: recentOrders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      total: Number(o.total),
      items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
    })),
    syncLogs,
  });
}
```

- [ ] **Step 3: Create dashboard page**

Create `src/app/admin/(dashboard)/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatsCard } from "@/components/admin/stats-card";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const [
    totalProducts,
    activeProducts,
    todayOrders,
    todayRevenue,
    pendingOrders,
    weekOrders,
    totalOrders,
    recentOrders,
    syncLogs,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { isActive: true } }),
    db.order.count({ where: { createdAt: { gte: todayStart } } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: todayStart } },
    }),
    db.order.count({ where: { status: "pending" } }),
    db.order.count({ where: { createdAt: { gte: weekStart } } }),
    db.order.count(),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: true },
    }),
    db.syncLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <>
      <AdminHeader title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Today's Orders"
            value={todayOrders}
            subtitle={`€${Number(todayRevenue._sum.total || 0).toFixed(2)} revenue`}
          />
          <StatsCard
            label="Pending Orders"
            value={pendingOrders}
            subtitle="Awaiting confirmation"
          />
          <StatsCard
            label="This Week"
            value={weekOrders}
            subtitle={`${totalOrders} total all time`}
          />
          <StatsCard
            label="Active Products"
            value={activeProducts}
            subtitle={`${totalProducts} total`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent orders */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#e5e7eb]">
            <div className="flex items-center justify-between p-4 border-b border-[#e5e7eb]">
              <h2 className="font-semibold text-[#121212]">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm text-[#6767A7] hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-[#e5e7eb]">
              {recentOrders.length === 0 ? (
                <p className="p-4 text-sm text-[#707070]">No orders yet</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-[#707070]">
                        {order.customerName} · {order.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">€{Number(order.total).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        order.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                        order.status === "delivering" ? "bg-purple-100 text-purple-700" :
                        order.status === "delivered" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sync status */}
          <div className="bg-white rounded-lg border border-[#e5e7eb]">
            <div className="flex items-center justify-between p-4 border-b border-[#e5e7eb]">
              <h2 className="font-semibold text-[#121212]">Sync Status</h2>
              <Link href="/admin/sync" className="text-sm text-[#6767A7] hover:underline">
                Manage
              </Link>
            </div>
            <div className="divide-y divide-[#e5e7eb]">
              {syncLogs.length === 0 ? (
                <p className="p-4 text-sm text-[#707070]">No syncs yet</p>
              ) : (
                syncLogs.map((log) => (
                  <div key={log.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium capitalize">{log.sourceStore}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        log.status === "completed" ? "bg-green-100 text-green-700" :
                        log.status === "running" ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#707070] mt-1">
                      +{log.productsAdded} added · {log.productsUpdated} updated
                      {log.errors.length > 0 && ` · ${log.errors.length} errors`}
                    </p>
                    <p className="text-xs text-[#707070]">
                      {new Date(log.startedAt).toLocaleString("en-GB")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/stats-card.tsx src/app/api/admin/stats/ src/app/admin/\(dashboard\)/page.tsx
git commit -m "feat: add admin dashboard with stats, recent orders, sync status

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Orders Page + API

**Files:**
- Create: `src/components/admin/order-status-badge.tsx`
- Create: `src/components/admin/orders-table.tsx`
- Create: `src/app/api/admin/orders/route.ts`
- Create: `src/app/api/admin/orders/[id]/route.ts`
- Create: `src/app/admin/(dashboard)/orders/page.tsx`

- [ ] **Step 1: Create order status badge**

Create `src/components/admin/order-status-badge.tsx`:

```tsx
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  delivering: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}
```

- [ ] **Step 2: Create orders table (client component)**

Create `src/components/admin/orders-table.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  city: string;
  total: number;
  createdAt: string;
  items: { id: string; quantity: number; price: number; product: { title: string } }[];
}

const STATUS_FLOW = ["pending", "confirmed", "delivering", "delivered"];

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdating(orderId);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(null);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Order</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Customer</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">City</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Total</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Status</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Date</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb]">
          {orders.map((order) => {
            const currentIdx = STATUS_FLOW.indexOf(order.status);
            const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1
              ? STATUS_FLOW[currentIdx + 1]
              : null;

            return (
              <>
                <tr
                  key={order.id}
                  className="hover:bg-[#f8f9fa] cursor-pointer"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div>{order.customerName}</div>
                    <div className="text-xs text-[#707070]">{order.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3">{order.city}</td>
                  <td className="px-4 py-3 font-semibold">€{order.total.toFixed(2)}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-[#707070]">
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3">
                    {nextStatus && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(order.id, nextStatus);
                        }}
                        disabled={updating === order.id}
                        className="text-xs bg-[#121212] text-white px-3 py-1.5 rounded font-medium hover:bg-[#121212]/80 disabled:opacity-50"
                      >
                        {updating === order.id ? "..." : `→ ${nextStatus}`}
                      </button>
                    )}
                    {order.status !== "cancelled" && order.status !== "delivered" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(order.id, "cancelled");
                        }}
                        disabled={updating === order.id}
                        className="text-xs text-red-600 hover:text-red-800 ml-2 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === order.id && (
                  <tr key={`${order.id}-detail`}>
                    <td colSpan={7} className="px-4 py-3 bg-[#f8f9fa]">
                      <div className="text-xs space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>{item.product.title} × {item.quantity}</span>
                            <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
      {orders.length === 0 && (
        <p className="text-center py-8 text-sm text-[#707070]">No orders found</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create orders list API**

Create `src/app/api/admin/orders/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const city = searchParams.get("city");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 25;
  const offset = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (city) where.city = city;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: { items: { include: { product: true } } },
    }),
    db.order.count({ where }),
  ]);

  return NextResponse.json({
    orders: orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      total: Number(o.total),
      items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
```

- [ ] **Step 4: Create order status update API**

Create `src/app/api/admin/orders/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_STATUSES = ["pending", "confirmed", "delivering", "delivered", "cancelled"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body?.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await db.order.update({
    where: { id },
    data: { status: body.status },
  });

  return NextResponse.json({
    ...order,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
  });
}
```

- [ ] **Step 5: Create orders page**

Create `src/app/admin/(dashboard)/orders/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { OrdersTable } from "@/components/admin/orders-table";
import Link from "next/link";

const STATUSES = ["all", "pending", "confirmed", "delivering", "delivered", "cancelled"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page = "1" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page));
  const limit = 25;
  const offset = (pageNum - 1) * limit;

  const where: any = {};
  if (status && status !== "all") where.status = status;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: { items: { include: { product: true } } },
    }),
    db.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const serialized = orders.map((o) => ({
    ...o,
    subtotal: Number(o.subtotal),
    deliveryFee: Number(o.deliveryFee),
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
  }));

  return (
    <>
      <AdminHeader title="Orders" />
      <div className="p-6 space-y-4">
        {/* Status filter tabs */}
        <div className="flex gap-1 bg-white rounded-lg border border-[#e5e7eb] p-1 w-fit">
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/orders${s === "all" ? "" : `?status=${s}`}`}
              className={`px-3 py-1.5 text-xs font-medium rounded capitalize ${
                (s === "all" && !status) || s === status
                  ? "bg-[#121212] text-white"
                  : "text-[#707070] hover:text-[#121212]"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        <p className="text-sm text-[#707070]">{total} orders</p>

        <OrdersTable orders={serialized} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/orders?${status ? `status=${status}&` : ""}page=${p}`}
                className={`w-8 h-8 flex items-center justify-center text-xs font-medium rounded ${
                  p === pageNum ? "bg-[#121212] text-white" : "bg-white border border-[#e5e7eb] hover:bg-[#f8f9fa]"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
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
git add src/components/admin/order-status-badge.tsx src/components/admin/orders-table.tsx src/app/api/admin/orders/ src/app/admin/\(dashboard\)/orders/
git commit -m "feat: add admin orders page with status management

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Products Page + API

**Files:**
- Create: `src/components/admin/products-table.tsx`
- Create: `src/components/admin/product-edit-modal.tsx`
- Create: `src/app/api/admin/products/route.ts`
- Create: `src/app/api/admin/products/[id]/route.ts`
- Create: `src/app/admin/(dashboard)/products/page.tsx`

- [ ] **Step 1: Create product edit modal**

Create `src/components/admin/product-edit-modal.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EditableProduct {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  description: string | null;
  isActive: boolean;
  isFeatured: boolean;
}

export function ProductEditModal({
  product,
  onClose,
}: {
  product: EditableProduct;
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);

    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: parseFloat(form.get("price") as string),
        compareAtPrice: form.get("compareAtPrice")
          ? parseFloat(form.get("compareAtPrice") as string)
          : null,
        description: form.get("description") || null,
        isActive: form.get("isActive") === "on",
        isFeatured: form.get("isFeatured") === "on",
      }),
    });

    setSaving(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Edit Product</h2>
        <p className="text-sm text-[#707070] mb-4 line-clamp-1">{product.title}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Price (€)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={product.price}
                required
                className="w-full h-9 px-2 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Compare Price (€)</label>
              <input
                name="compareAtPrice"
                type="number"
                step="0.01"
                defaultValue={product.compareAtPrice ?? ""}
                className="w-full h-9 px-2 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={product.description ?? ""}
              className="w-full px-2 py-1.5 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7] resize-none"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input name="isActive" type="checkbox" defaultChecked={product.isActive} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input name="isFeatured" type="checkbox" defaultChecked={product.isFeatured} />
              Featured
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-9 bg-[#121212] text-white rounded text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 border border-[#d1d5db] rounded text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create products table**

Create `src/components/admin/products-table.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ProductEditModal } from "./product-edit-modal";

interface ProductRow {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  description: string | null;
  thumbnail: string | null;
  sourceStore: string;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
}

export function ProductsTable({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  async function toggleActive(id: string, isActive: boolean) {
    setToggling(id);
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setToggling(null);
    router.refresh();
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Product</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Source</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Category</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Price</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Status</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-[#f8f9fa]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-[#f5f5f5] flex-shrink-0 relative">
                      {product.thumbnail && (
                        <Image src={product.thumbnail} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <span className="font-medium line-clamp-1">{product.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">{product.sourceStore}</td>
                <td className="px-4 py-3 text-[#707070]">{product.category}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold">€{product.price.toFixed(2)}</span>
                  {product.compareAtPrice && (
                    <span className="text-xs text-[#707070] line-through ml-1">
                      €{product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(product.id, product.isActive)}
                    disabled={toggling === product.id}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      product.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {product.isActive ? "Active" : "Disabled"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="text-xs text-[#6767A7] hover:underline font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center py-8 text-sm text-[#707070]">No products found</p>
        )}
      </div>

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 3: Create products list API**

Create `src/app/api/admin/products/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") || "";
  const source = searchParams.get("source");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 25;
  const offset = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }
  if (source) where.sourceStore = source;

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
```

- [ ] **Step 4: Create product update API**

Create `src/app/api/admin/products/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: any = {};
  if (body.price !== undefined) data.price = body.price;
  if (body.compareAtPrice !== undefined) data.compareAtPrice = body.compareAtPrice;
  if (body.description !== undefined) data.description = body.description;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured;

  const product = await db.product.update({ where: { id }, data });

  return NextResponse.json({
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
  });
}
```

- [ ] **Step 5: Create products page**

Create `src/app/admin/(dashboard)/products/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductsTable } from "@/components/admin/products-table";
import Link from "next/link";

const SOURCES = ["all", "shporta", "tregu", "benny"];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; search?: string; page?: string }>;
}) {
  const { source, search, page = "1" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page));
  const limit = 25;
  const offset = (pageNum - 1) * limit;

  const where: any = {};
  if (source && source !== "all") where.sourceStore = source;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const serialized = products.map((p) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    syncedAt: p.syncedAt.toISOString(),
  }));

  const baseQuery = `${source && source !== "all" ? `source=${source}&` : ""}${search ? `search=${search}&` : ""}`;

  return (
    <>
      <AdminHeader title="Products" />
      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Source filter */}
          <div className="flex gap-1 bg-white rounded-lg border border-[#e5e7eb] p-1">
            {SOURCES.map((s) => (
              <Link
                key={s}
                href={`/admin/products${s === "all" ? "" : `?source=${s}`}${search ? `${s === "all" ? "?" : "&"}search=${search}` : ""}`}
                className={`px-3 py-1.5 text-xs font-medium rounded capitalize ${
                  (s === "all" && !source) || s === source
                    ? "bg-[#121212] text-white"
                    : "text-[#707070] hover:text-[#121212]"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>

          {/* Search */}
          <form action="/admin/products" className="flex-1 max-w-xs">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search products..."
              className="w-full h-9 px-3 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7]"
            />
            {source && source !== "all" && (
              <input type="hidden" name="source" value={source} />
            )}
          </form>
        </div>

        <p className="text-sm text-[#707070]">{total} products</p>

        <ProductsTable products={serialized} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/products?${baseQuery}page=${p}`}
                className={`w-8 h-8 flex items-center justify-center text-xs font-medium rounded ${
                  p === pageNum ? "bg-[#121212] text-white" : "bg-white border border-[#e5e7eb] hover:bg-[#f8f9fa]"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
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
git add src/components/admin/product-edit-modal.tsx src/components/admin/products-table.tsx src/app/api/admin/products/ src/app/admin/\(dashboard\)/products/
git commit -m "feat: add admin products page with search, filter, edit

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Collections Page + API

**Files:**
- Create: `src/components/admin/collections-manager.tsx`
- Create: `src/components/admin/collection-form.tsx`
- Create: `src/app/api/admin/collections/route.ts`
- Create: `src/app/api/admin/collections/[id]/route.ts`
- Create: `src/app/admin/(dashboard)/collections/page.tsx`

- [ ] **Step 1: Create collection form modal**

Create `src/components/admin/collection-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CollectionData {
  id?: string;
  title: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export function CollectionForm({
  collection,
  onClose,
}: {
  collection?: CollectionData;
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isEditing = !!collection?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title") as string,
      slug: form.get("slug") as string,
      description: (form.get("description") as string) || null,
      isActive: form.get("isActive") === "on",
      sortOrder: parseInt(form.get("sortOrder") as string) || 0,
    };

    if (isEditing) {
      await fetch(`/api/admin/collections/${collection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }

    setSaving(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? "Edit Collection" : "New Collection"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">Title</label>
            <input
              name="title"
              required
              defaultValue={collection?.title}
              className="w-full h-9 px-2 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">Slug</label>
            <input
              name="slug"
              required
              defaultValue={collection?.slug}
              placeholder="e.g. shtepi-kuzhine"
              className="w-full h-9 px-2 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">Description</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={collection?.description ?? ""}
              className="w-full px-2 py-1.5 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Sort Order</label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={collection?.sortOrder ?? 0}
                className="w-full h-9 px-2 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7]"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input name="isActive" type="checkbox" defaultChecked={collection?.isActive ?? true} />
                Active
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-9 bg-[#121212] text-white rounded text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : isEditing ? "Save" : "Create"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 border border-[#d1d5db] rounded text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create collections manager**

Create `src/components/admin/collections-manager.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CollectionForm } from "./collection-form";

interface CollectionRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: { products: number };
}

export function CollectionsManager({ collections }: { collections: CollectionRow[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CollectionRow | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this collection?")) return;
    setDeleting(id);
    await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[#707070]">{collections.length} collections</p>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="h-9 px-4 bg-[#121212] text-white rounded text-sm font-medium"
        >
          + New Collection
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Order</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Title</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Products</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Status</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]">
            {collections.map((col) => (
              <tr key={col.id} className="hover:bg-[#f8f9fa]">
                <td className="px-4 py-3 text-[#707070]">{col.sortOrder}</td>
                <td className="px-4 py-3 font-medium">{col.title}</td>
                <td className="px-4 py-3 text-[#707070] font-mono text-xs">{col.slug}</td>
                <td className="px-4 py-3">{col._count.products}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    col.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {col.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => { setEditing(col); setShowForm(true); }}
                    className="text-xs text-[#6767A7] hover:underline font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(col.id)}
                    disabled={deleting === col.id}
                    className="text-xs text-red-600 hover:underline font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {collections.length === 0 && (
          <p className="text-center py-8 text-sm text-[#707070]">No collections yet</p>
        )}
      </div>

      {showForm && (
        <CollectionForm
          collection={editing || undefined}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </>
  );
}
```

- [ ] **Step 3: Create collections API routes**

Create `src/app/api/admin/collections/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const collections = await db.collection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json(collections);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.slug) {
    return NextResponse.json({ error: "Title and slug required" }, { status: 400 });
  }

  const collection = await db.collection.create({
    data: {
      title: body.title,
      slug: body.slug,
      description: body.description || null,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
  });

  return NextResponse.json(collection, { status: 201 });
}
```

Create `src/app/api/admin/collections/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: any = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.description !== undefined) data.description = body.description;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;

  const collection = await db.collection.update({ where: { id }, data });
  return NextResponse.json(collection);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.collection.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Create collections page**

Create `src/app/admin/(dashboard)/collections/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { CollectionsManager } from "@/components/admin/collections-manager";

export default async function AdminCollectionsPage() {
  const collections = await db.collection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <AdminHeader title="Collections" />
      <div className="p-6">
        <CollectionsManager collections={collections} />
      </div>
    </>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/collection-form.tsx src/components/admin/collections-manager.tsx src/app/api/admin/collections/ src/app/admin/\(dashboard\)/collections/
git commit -m "feat: add admin collections page with CRUD operations

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Customers Page + API

**Files:**
- Create: `src/components/admin/customers-table.tsx`
- Create: `src/app/api/admin/customers/route.ts`
- Create: `src/app/admin/(dashboard)/customers/page.tsx`

- [ ] **Step 1: Create customers table**

Create `src/components/admin/customers-table.tsx`:

```tsx
interface CustomerRow {
  phone: string;
  name: string;
  city: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
}

export function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Name</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Phone</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">City</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Orders</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Total Spent</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Last Order</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb]">
          {customers.map((c, i) => (
            <tr key={i} className="hover:bg-[#f8f9fa]">
              <td className="px-4 py-3 font-medium">{c.name}</td>
              <td className="px-4 py-3 text-[#707070]">{c.phone}</td>
              <td className="px-4 py-3">{c.city}</td>
              <td className="px-4 py-3">{c.orderCount}</td>
              <td className="px-4 py-3 font-semibold">€{c.totalSpent.toFixed(2)}</td>
              <td className="px-4 py-3 text-[#707070]">
                {new Date(c.lastOrder).toLocaleDateString("en-GB")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {customers.length === 0 && (
        <p className="text-center py-8 text-sm text-[#707070]">No customers yet</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create customers API**

Create `src/app/api/admin/customers/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") || "";

  // Aggregate orders by phone number (guest checkout creates order records, not Customer records)
  const where: any = {};
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search } },
    ];
  }

  const orders = await db.order.findMany({
    where,
    select: {
      customerName: true,
      customerPhone: true,
      city: true,
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by phone
  const byPhone = new Map<string, {
    name: string;
    phone: string;
    city: string;
    orderCount: number;
    totalSpent: number;
    lastOrder: Date;
  }>();

  for (const order of orders) {
    const existing = byPhone.get(order.customerPhone);
    if (existing) {
      existing.orderCount++;
      existing.totalSpent += Number(order.total);
    } else {
      byPhone.set(order.customerPhone, {
        name: order.customerName,
        phone: order.customerPhone,
        city: order.city,
        orderCount: 1,
        totalSpent: Number(order.total),
        lastOrder: order.createdAt,
      });
    }
  }

  const customers = Array.from(byPhone.values())
    .sort((a, b) => b.orderCount - a.orderCount);

  return NextResponse.json(customers);
}
```

- [ ] **Step 3: Create customers page**

Create `src/app/admin/(dashboard)/customers/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { CustomersTable } from "@/components/admin/customers-table";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const where: any = {};
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search } },
    ];
  }

  const orders = await db.order.findMany({
    where,
    select: {
      customerName: true,
      customerPhone: true,
      city: true,
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by phone
  const byPhone = new Map<string, {
    name: string;
    phone: string;
    city: string;
    orderCount: number;
    totalSpent: number;
    lastOrder: string;
  }>();

  for (const order of orders) {
    const existing = byPhone.get(order.customerPhone);
    if (existing) {
      existing.orderCount++;
      existing.totalSpent += Number(order.total);
    } else {
      byPhone.set(order.customerPhone, {
        name: order.customerName,
        phone: order.customerPhone,
        city: order.city,
        orderCount: 1,
        totalSpent: Number(order.total),
        lastOrder: order.createdAt.toISOString(),
      });
    }
  }

  const customers = Array.from(byPhone.values())
    .sort((a, b) => b.orderCount - a.orderCount);

  return (
    <>
      <AdminHeader title="Customers" />
      <div className="p-6 space-y-4">
        <form action="/admin/customers" className="max-w-xs">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name or phone..."
            className="w-full h-9 px-3 border border-[#d1d5db] rounded text-sm outline-none focus:ring-2 focus:ring-[#6767A7]"
          />
        </form>

        <p className="text-sm text-[#707070]">{customers.length} customers</p>

        <CustomersTable customers={customers} />
      </div>
    </>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/customers-table.tsx src/app/api/admin/customers/ src/app/admin/\(dashboard\)/customers/
git commit -m "feat: add admin customers page with order-based lookup

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Sync Controls Page

**Files:**
- Create: `src/components/admin/sync-panel.tsx`
- Create: `src/app/admin/(dashboard)/sync/page.tsx`

- [ ] **Step 1: Create sync panel (client component)**

Create `src/components/admin/sync-panel.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SyncLogRow {
  id: string;
  sourceStore: string;
  status: string;
  productsAdded: number;
  productsUpdated: number;
  pricesChanged: number;
  imagesDownloaded: number;
  errors: string[];
  startedAt: string;
  completedAt: string | null;
}

const STORES = ["shporta", "tregu", "benny"] as const;

export function SyncPanel({ logs }: { logs: SyncLogRow[] }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState<string | null>(null);

  async function triggerSync(store: string, type: "full" | "price") {
    setSyncing(`${store}-${type}`);
    await fetch("/api/admin/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ store, type }),
    });
    setSyncing(null);
    router.refresh();
  }

  async function triggerSyncAll() {
    setSyncing("all");
    await fetch("/api/admin/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "full" }),
    });
    setSyncing(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Trigger buttons */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
        <h2 className="font-semibold mb-4">Trigger Sync</h2>

        <div className="flex gap-3 mb-4">
          <button
            onClick={triggerSyncAll}
            disabled={syncing !== null}
            className="h-9 px-4 bg-[#121212] text-white rounded text-sm font-medium disabled:opacity-50"
          >
            {syncing === "all" ? "Starting..." : "Sync All Stores"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STORES.map((store) => (
            <div key={store} className="border border-[#e5e7eb] rounded-lg p-4">
              <h3 className="font-medium capitalize mb-3">{store}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => triggerSync(store, "full")}
                  disabled={syncing !== null}
                  className="text-xs px-3 py-1.5 bg-[#6767A7] text-white rounded font-medium disabled:opacity-50"
                >
                  {syncing === `${store}-full` ? "..." : "Full Sync"}
                </button>
                <button
                  onClick={() => triggerSync(store, "price")}
                  disabled={syncing !== null}
                  className="text-xs px-3 py-1.5 border border-[#d1d5db] rounded font-medium disabled:opacity-50"
                >
                  {syncing === `${store}-price` ? "..." : "Price Only"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync log history */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="p-4 border-b border-[#e5e7eb]">
          <h2 className="font-semibold">Sync History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Store</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Status</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Added</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Updated</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Images</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Errors</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Started</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]">
            {logs.map((log) => {
              const duration = log.completedAt
                ? Math.round(
                    (new Date(log.completedAt).getTime() -
                      new Date(log.startedAt).getTime()) /
                      1000
                  )
                : null;

              return (
                <tr key={log.id} className="hover:bg-[#f8f9fa]">
                  <td className="px-4 py-3 font-medium capitalize">{log.sourceStore}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      log.status === "completed" ? "bg-green-100 text-green-700" :
                      log.status === "running" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{log.productsAdded}</td>
                  <td className="px-4 py-3">{log.productsUpdated}</td>
                  <td className="px-4 py-3">{log.imagesDownloaded}</td>
                  <td className="px-4 py-3">
                    {log.errors.length > 0 ? (
                      <span className="text-red-600 font-medium">{log.errors.length}</span>
                    ) : (
                      <span className="text-[#707070]">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#707070]">
                    {new Date(log.startedAt).toLocaleString("en-GB")}
                  </td>
                  <td className="px-4 py-3 text-[#707070]">
                    {duration !== null ? `${duration}s` : "running..."}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="text-center py-8 text-sm text-[#707070]">No sync logs yet</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create sync page**

Create `src/app/admin/(dashboard)/sync/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { SyncPanel } from "@/components/admin/sync-panel";

export default async function AdminSyncPage() {
  const logs = await db.syncLog.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  const serialized = logs.map((l) => ({
    ...l,
    startedAt: l.startedAt.toISOString(),
    completedAt: l.completedAt?.toISOString() || null,
  }));

  return (
    <>
      <AdminHeader title="Sync Controls" />
      <div className="p-6">
        <SyncPanel logs={serialized} />
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/sync-panel.tsx src/app/admin/\(dashboard\)/sync/
git commit -m "feat: add admin sync controls page with trigger buttons and log viewer

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 10: Build, Seed, Test & Deploy

- [ ] **Step 1: Add ADMIN_JWT_SECRET to .env**

Add to `.env`:

```
ADMIN_JWT_SECRET=blini-home-admin-jwt-2026-change-in-production
```

- [ ] **Step 2: Run full build**

```bash
npm run build
```

Expected: Clean build with all admin routes listed.

- [ ] **Step 3: Seed admin user locally**

```bash
npx tsx scripts/seed-admin.ts
```

Expected: `Admin user ready: admin@blini.world (id: ...)`

- [ ] **Step 4: Run existing tests**

```bash
npx vitest run
```

Expected: All existing tests still pass (admin changes don't affect scraper/sync tests).

- [ ] **Step 5: Push and deploy to CT 110**

```bash
git push origin main
```

SSH to CT 110 and update:

```bash
ssh root@192.168.100.50
pct exec 110 -- bash -c 'cd /app && git pull origin main && npm install && npx prisma generate && npm run build && pm2 restart blini-home'
exit
```

- [ ] **Step 6: Seed admin user on CT 110**

```bash
ssh root@192.168.100.50
pct exec 110 -- bash -c 'cd /app && npx tsx scripts/seed-admin.ts'
exit
```

- [ ] **Step 7: Add ADMIN_JWT_SECRET to CT 110 .env**

```bash
ssh root@192.168.100.50
pct exec 110 -- bash -c 'echo "ADMIN_JWT_SECRET=blini-home-admin-jwt-2026-production" >> /app/.env'
pct exec 110 -- bash -c 'cd /app && pm2 restart blini-home'
exit
```

- [ ] **Step 8: Verify live site**

```bash
curl -s -o /dev/null -w "%{http_code}" https://home.blini.world/
curl -s -o /dev/null -w "%{http_code}" https://home.blini.world/admin/login
curl -s -o /dev/null -w "%{http_code}" https://home.blini.world/api/health
```

Expected: 200 for homepage and health, 200 for login page, redirect (307) for /admin without auth.

- [ ] **Step 9: Final commit (if any remaining changes)**

```bash
git push origin main
```

---

## Summary

After completing Plan 4, you will have:

- **Auth:** JWT-based admin login with httpOnly cookies, middleware-protected routes
- **Dashboard:** Overview with today's orders, revenue, pending count, product stats, recent orders, sync status
- **Orders:** Filterable table by status, expandable detail view, status progression buttons (pending → confirmed → delivering → delivered), cancel option
- **Products:** Searchable table with source store filter, inline active/disable toggle, edit modal for price, description, featured
- **Collections:** Full CRUD — create, edit, delete collections with sort order management
- **Customers:** Phone-based lookup aggregating guest orders by phone number, showing order count and total spent
- **Sync Controls:** Per-store and all-stores sync triggers, sync log history with duration and error counts
- **Deployment:** Admin user seeded, JWT secret configured, all running on CT 110
