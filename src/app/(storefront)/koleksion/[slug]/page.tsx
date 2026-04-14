import { notFound } from "next/navigation";
import Link from "next/link";
import { getCollectionBySlug, getActiveProducts } from "@/lib/queries";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SortSelect } from "@/components/storefront/sort-select";

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
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-text flex items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
        </Link>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary/50">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className="text-text">{collection.title}</span>
      </nav>

      {/* Title */}
      <h1 className="text-4xl font-bold tracking-tight">{collection.title}</h1>

      {/* Tag pill */}
      <div className="mt-3 mb-8">
        <span className="inline-block bg-text text-white rounded-full px-4 py-1.5 text-sm font-medium">
          {collection.title}
        </span>
      </div>

      {/* Layout: sidebar + grid */}
      <div className="flex gap-8">
        {/* Left sidebar - hidden on mobile */}
        <aside className="hidden lg:block w-[220px] flex-shrink-0">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3">Kategoritë</h2>
          <p className="text-sm text-text-secondary mb-4">{total} Produkte</p>
          <div>
            <SortSelect current={sort} />
          </div>
        </aside>

        {/* Right: products */}
        <div className="flex-1 min-w-0">
          {/* Mobile sort - shown only on mobile */}
          <div className="lg:hidden mb-4">
            <SortSelect current={sort} />
          </div>

          <ProductGrid products={products} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 mt-10">
              {pageNum > 1 && (
                <Link
                  href={`/koleksion/${slug}?sort=${sort}&page=${pageNum - 1}`}
                  className="w-10 h-10 flex items-center justify-center text-sm font-medium border border-border rounded-[5px] hover:bg-card-bg transition-colors"
                >
                  ‹
                </Link>
              )}
              {(() => {
                const pages: (number | "...")[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (pageNum > 3) pages.push("...");
                  for (let i = Math.max(2, pageNum - 1); i <= Math.min(totalPages - 1, pageNum + 1); i++) {
                    pages.push(i);
                  }
                  if (pageNum < totalPages - 2) pages.push("...");
                  pages.push(totalPages);
                }
                return pages.map((p, idx) =>
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-sm text-text-secondary">…</span>
                  ) : (
                    <Link
                      key={p}
                      href={`/koleksion/${slug}?sort=${sort}&page=${p}`}
                      className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-[5px] border transition-colors ${
                        p === pageNum
                          ? "bg-text text-white border-text"
                          : "border-border hover:bg-card-bg"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                );
              })()}
              {pageNum < totalPages && (
                <Link
                  href={`/koleksion/${slug}?sort=${sort}&page=${pageNum + 1}`}
                  className="w-10 h-10 flex items-center justify-center text-sm font-medium border border-border rounded-[5px] hover:bg-card-bg transition-colors"
                >
                  ›
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
