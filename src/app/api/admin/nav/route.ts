import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const categories = await db.navCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { children: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json(categories);
}

type IncomingChild = { label?: string; tag?: string | null; href?: string | null };
type IncomingCategory = {
  label?: string;
  slug?: string;
  color?: string;
  promoTitle?: string | null;
  promoSubtitle?: string | null;
  isActive?: boolean;
  children?: IncomingChild[];
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Replaces the entire nav taxonomy. The menu is small and not referenced by
 * foreign keys, so a delete-and-recreate inside a transaction is the simplest
 * correct way to persist reorders, additions and removals in one shot.
 */
export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const incoming: IncomingCategory[] | undefined = body?.categories;
  if (!Array.isArray(incoming)) {
    return NextResponse.json({ error: "categories array required" }, { status: 400 });
  }

  // Validate + normalize before touching the DB.
  const seenSlugs = new Set<string>();
  const categories = incoming.map((c, i) => {
    const label = (c.label ?? "").trim();
    if (!label) throw new Error(`Category ${i + 1} is missing a label`);
    const slug = (c.slug?.trim() ? slugify(c.slug) : slugify(label));
    if (!slug) throw new Error(`Category "${label}" produced an empty slug`);
    if (seenSlugs.has(slug)) throw new Error(`Duplicate slug "${slug}"`);
    seenSlugs.add(slug);
    return {
      label,
      slug,
      color: c.color?.trim() || "#E8F0E4",
      promoTitle: c.promoTitle?.trim() || null,
      promoSubtitle: c.promoSubtitle?.trim() || null,
      isActive: c.isActive ?? true,
      sortOrder: i,
      children: (c.children ?? [])
        .map((ch, j) => {
          const childLabel = (ch.label ?? "").trim();
          if (!childLabel) return null;
          return {
            label: childLabel,
            tag: ch.tag?.toString().trim() || null,
            href: ch.href?.toString().trim() || null,
            sortOrder: j,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    };
  });

  try {
    await db.$transaction(async (tx) => {
      await tx.navChild.deleteMany();
      await tx.navCategory.deleteMany();
      for (const cat of categories) {
        const { children, ...catData } = cat;
        await tx.navCategory.create({
          data: { ...catData, children: { create: children } },
        });
      }
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 500 }
    );
  }

  const saved = await db.navCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { children: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json(saved);
}
