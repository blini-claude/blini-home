import { db } from "./db";
import { NAV_TAXONOMY, type NavCategory } from "./nav-taxonomy";

/**
 * Returns the storefront navigation taxonomy from the database. Falls back to
 * the hardcoded NAV_TAXONOMY constant when the DB has no nav rows yet (fresh
 * install) or on any query error, so the storefront menu never breaks.
 *
 * Server-only — relies on the Prisma client. Fetch this in a server component
 * (e.g. the storefront layout) and pass the result down to the client header.
 */
export async function getNavTaxonomy(): Promise<NavCategory[]> {
  try {
    const cats = await db.navCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { children: { orderBy: { sortOrder: "asc" } } },
    });

    if (cats.length === 0) return NAV_TAXONOMY;

    return cats.map((c) => ({
      label: c.label,
      slug: c.slug,
      color: c.color,
      promoTitle: c.promoTitle ?? undefined,
      promoSubtitle: c.promoSubtitle ?? undefined,
      children: c.children.map((ch) => ({
        label: ch.label,
        tag: ch.tag ?? undefined,
        href: ch.href ?? undefined,
      })),
    }));
  } catch {
    return NAV_TAXONOMY;
  }
}

/** Full taxonomy incl. inactive categories — for the admin editor. */
export async function getNavTaxonomyForAdmin() {
  return db.navCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { children: { orderBy: { sortOrder: "asc" } } },
  });
}
