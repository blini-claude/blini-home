import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Admin JWT secret. No fallback: a missing/short secret would make admin
 * tokens forgeable, so fail loudly instead.
 */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("ADMIN_JWT_SECRET is missing or too short (min 16 chars)");
  }
  return new TextEncoder().encode(secret);
}
const COOKIE_NAME = "admin-token";

export async function signToken(payload: { id: string; email: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
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

/**
 * Convenience guard for admin API route handlers that mutate data or touch
 * the filesystem. The global middleware only protects `/admin/*` pages, NOT
 * `/api/admin/*`, so write endpoints must check this themselves.
 */
export async function isAdmin(): Promise<boolean> {
  return (await getAdminFromCookie()) !== null;
}

export { COOKIE_NAME };
