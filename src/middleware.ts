import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "blini-home-admin-secret-change-me"
);

// Canonical domain for SEO — every other public hostname 301s here so Google
// consolidates all ranking signals onto the one brand domain.
const CANONICAL_HOST = "blinihome.com";
const REDIRECT_HOSTS = new Set(["home.blini.world", "www.blinihome.com"]);

export async function middleware(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase();
  const { pathname, search } = request.nextUrl;

  // 1) Force the canonical domain (skips localhost/internal so health checks work).
  if (REDIRECT_HOSTS.has(host)) {
    return NextResponse.redirect(`https://${CANONICAL_HOST}${pathname}${search}`, 301);
  }

  // 2) Protect /admin pages (the login page and API routes self-handle auth).
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
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
  // Run on all routes except Next internals and static assets, so the canonical
  // redirect covers the whole storefront (not just /admin).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|logo.svg|apple-touch-icon.png|manifest.webmanifest).*)",
  ],
};
