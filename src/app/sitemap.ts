import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://home.blini.world";

// Static marketing/info pages worth indexing.
const STATIC_PATHS = [
  "",
  "/koleksion/te-gjitha",
  "/rreth-nesh",
  "/kontakt",
  "/dergimi",
  "/kthimi",
  "/pyetje",
  "/privatesia",
  "/kushtet",
];

export const revalidate = 3600; // refresh hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  try {
    const [collections, products] = await Promise.all([
      db.collection.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      db.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 5000,
      }),
    ]);

    for (const c of collections) {
      entries.push({
        url: `${BASE_URL}/koleksion/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
    for (const p of products) {
      entries.push({
        url: `${BASE_URL}/produkt/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // DB unavailable — still return the static entries.
  }

  return entries;
}
