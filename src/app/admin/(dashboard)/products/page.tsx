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
