import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductsTable } from "@/components/admin/products-table";
import Link from "next/link";

const SOURCES = ["all", "shporta", "tregu", "benny"];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; search?: string; page?: string; tag?: string }>;
}) {
  const { source, search, page = "1", tag } = await searchParams;
  const pageNum = Math.max(1, parseInt(page));
  const limit = 25;
  const offset = (pageNum - 1) * limit;

  const where: Record<string, unknown> = {};
  if (source && source !== "all") where.sourceStore = source;
  if (search) where.title = { contains: search, mode: "insensitive" };
  if (tag) where.tags = { has: tag };

  const [products, total, allTags, categories] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    db.product.count({ where }),
    db.product.findMany({
      select: { tags: true },
      distinct: ["tags"],
    }).then((rows) => {
      const tagSet = new Set<string>();
      rows.forEach((r) => r.tags.forEach((t) => tagSet.add(t)));
      return Array.from(tagSet).sort();
    }),
    db.product.findMany({
      select: { category: true },
      distinct: ["category"],
    }).then((rows) => rows.map((r) => r.category).sort()),
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

  const baseQuery = [
    source && source !== "all" ? `source=${source}` : "",
    search ? `search=${search}` : "",
    tag ? `tag=${tag}` : "",
  ].filter(Boolean).join("&");

  return (
    <>
      <AdminHeader title="Produktet" subtitle={`${total} produkte gjithsej`} />
      <div className="p-6 md:p-8 space-y-5">
        {/* Filters row */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Source filter */}
          <div className="flex gap-1 bg-white rounded-[10px] border border-[#E8E8E8] p-1">
            {SOURCES.map((s) => (
              <Link
                key={s}
                href={`/admin/products${s === "all" ? "" : `?source=${s}`}${search ? `${s === "all" ? "?" : "&"}search=${search}` : ""}${tag ? `${!search && s === "all" ? "?" : "&"}tag=${tag}` : ""}`}
                className={`px-3.5 py-1.5 text-[11px] font-bold rounded-[6px] capitalize transition-colors ${
                  (s === "all" && !source) || s === source
                    ? "bg-[#062F35] text-white"
                    : "text-[rgba(18,18,18,0.5)] hover:text-[#062F35] hover:bg-[#F5F5F5]"
                }`}
              >
                {s === "all" ? "Të gjitha" : s}
              </Link>
            ))}
          </div>

          {/* Search */}
          <form action="/admin/products" className="flex-1 max-w-xs">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(18,18,18,0.3)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Kërko produkte..."
                className="w-full h-[40px] pl-10 pr-4 border-2 border-[#E8E8E8] rounded-[8px] text-[12px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors bg-white"
              />
              {source && source !== "all" && (
                <input type="hidden" name="source" value={source} />
              )}
              {tag && <input type="hidden" name="tag" value={tag} />}
            </div>
          </form>

          {/* Tag filter */}
          {tag && (
            <Link
              href={`/admin/products?${source && source !== "all" ? `source=${source}` : ""}${search ? `${source && source !== "all" ? "&" : ""}search=${search}` : ""}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF8E1] text-[#B8860B] text-[11px] font-bold rounded-[6px] hover:bg-[#FFF0C4] transition-colors"
            >
              Tag: {tag}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </Link>
          )}
        </div>

        <ProductsTable products={serialized} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {pageNum > 1 && (
              <Link
                href={`/admin/products?${baseQuery}${baseQuery ? "&" : ""}page=${pageNum - 1}`}
                className="w-9 h-9 flex items-center justify-center text-[12px] font-bold rounded-[8px] bg-white border border-[#E8E8E8] hover:bg-[#F5F5F5] text-[#062F35]"
              >
                ‹
              </Link>
            )}
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(
              (p) => (
                <Link
                  key={p}
                  href={`/admin/products?${baseQuery}${baseQuery ? "&" : ""}page=${p}`}
                  className={`w-9 h-9 flex items-center justify-center text-[12px] font-bold rounded-[8px] ${
                    p === pageNum
                      ? "bg-[#062F35] text-white"
                      : "bg-white border border-[#E8E8E8] hover:bg-[#F5F5F5] text-[#062F35]"
                  }`}
                >
                  {p}
                </Link>
              )
            )}
            {pageNum < totalPages && (
              <Link
                href={`/admin/products?${baseQuery}${baseQuery ? "&" : ""}page=${pageNum + 1}`}
                className="w-9 h-9 flex items-center justify-center text-[12px] font-bold rounded-[8px] bg-white border border-[#E8E8E8] hover:bg-[#F5F5F5] text-[#062F35]"
              >
                ›
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
