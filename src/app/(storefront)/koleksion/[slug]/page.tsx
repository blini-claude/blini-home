import { notFound } from "next/navigation";
import Link from "next/link";
import { getCollectionBySlug, getActiveProducts, getPriceRange, getTagsForCollection } from "@/lib/queries";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SortSelect } from "@/components/storefront/sort-select";
import { CollectionFilters } from "@/components/storefront/collection-filters";
import { MobileFilterButton } from "@/components/storefront/mobile-filter-button";

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    page?: string;
    tag?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  const { slug } = await params;
  const {
    sort = "newest",
    page = "1",
    tag = "",
    minPrice: minPriceStr,
    maxPrice: maxPriceStr,
  } = await searchParams;

  const isAllProducts = slug === "te-gjitha";
  const collection = isAllProducts
    ? { title: "Të gjitha produktet", slug: "te-gjitha", description: null }
    : await getCollectionBySlug(slug);
  if (!collection) notFound();

  const pageNum = Math.max(1, parseInt(page));
  const limit = 30;
  const offset = (pageNum - 1) * limit;

  const minPrice = minPriceStr ? parseFloat(minPriceStr) : undefined;
  const maxPrice = maxPriceStr ? parseFloat(maxPriceStr) : undefined;

  const [{ products, total }, priceRange, availableTags] = await Promise.all([
    getActiveProducts({
      ...(isAllProducts ? {} : { collectionSlug: slug }),
      sortBy: sort as any,
      limit,
      offset,
      tag: tag || undefined,
      minPrice,
      maxPrice,
    }),
    getPriceRange(),
    getTagsForCollection(isAllProducts ? undefined : slug),
  ]);

  const totalPages = Math.ceil(total / limit);
  const filterParams = `${tag ? `&tag=${tag}` : ""}${minPriceStr ? `&minPrice=${minPriceStr}` : ""}${maxPriceStr ? `&maxPrice=${maxPriceStr}` : ""}`;

  return (
    <div className="px-5 mx-auto py-6 md:py-10" style={{ maxWidth: 1440 }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] font-bold text-[rgba(18,18,18,0.55)] mb-4">
        <Link href="/" className="hover:text-[#062F35] transition-colors">
          Ballina
        </Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className="text-[#062F35] font-extrabold">{collection.title}</span>
      </nav>

      {/* Title */}
      <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#062F35] tracking-[-1.5px] leading-tight">
        {collection.title}
      </h1>

      {/* Sort bar */}
      <div className="flex items-center justify-between mt-3 mb-6 pb-4 border-b border-[rgba(18,18,18,0.08)]">
        <p className="text-[13px] font-bold text-[rgba(18,18,18,0.55)]">{total} produkte</p>
        <SortSelect current={sort} />
      </div>

      {/* Main: sidebar + grid */}
      <div className="flex gap-8">
        {/* Sidebar — desktop only */}
        <div className="hidden lg:block w-[220px] flex-shrink-0">
          <CollectionFilters
            currentTag={tag}
            availableTags={availableTags}
            minPrice={minPrice ?? priceRange.min}
            maxPrice={maxPrice ?? priceRange.max}
            priceMin={priceRange.min}
            priceMax={priceRange.max}
            productCount={total}
          />
        </div>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {/* Mobile filters */}
          <div className="lg:hidden mb-5">
            <MobileFilterButton
              currentTag={tag}
              availableTags={availableTags}
              minPrice={minPrice ?? priceRange.min}
              maxPrice={maxPrice ?? priceRange.max}
              priceMin={priceRange.min}
              priceMax={priceRange.max}
              total={total}
              hasFilters={!!(tag || minPrice !== undefined || maxPrice !== undefined)}
            />
          </div>

          <ProductGrid key={`${slug}-${page}-${sort}-${tag}`} products={products} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 mt-12">
              {pageNum > 1 && (
                <Link
                  href={`/koleksion/${slug}?sort=${sort}&page=${pageNum - 1}${filterParams}`}
                  className="w-10 h-10 flex items-center justify-center text-[14px] font-bold border border-[rgba(18,18,18,0.15)] rounded-[8px] hover:bg-[#F7F7F7] transition-colors"
                >
                  &lsaquo;
                </Link>
              )}
              {(() => {
                const pages: (number | "...")[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (pageNum > 3) pages.push("...");
                  for (let i = Math.max(2, pageNum - 1); i <= Math.min(totalPages - 1, pageNum + 1); i++) pages.push(i);
                  if (pageNum < totalPages - 2) pages.push("...");
                  pages.push(totalPages);
                }
                return pages.map((p, idx) =>
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-[14px] text-[rgba(18,18,18,0.45)]">&hellip;</span>
                  ) : (
                    <Link
                      key={p}
                      href={`/koleksion/${slug}?sort=${sort}&page=${p}${filterParams}`}
                      className={`w-10 h-10 flex items-center justify-center text-[14px] font-bold rounded-[8px] transition-colors ${
                        p === pageNum ? "bg-[#062F35] text-white" : "border border-[rgba(18,18,18,0.15)] hover:bg-[#F7F7F7]"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                );
              })()}
              {pageNum < totalPages && (
                <Link
                  href={`/koleksion/${slug}?sort=${sort}&page=${pageNum + 1}${filterParams}`}
                  className="w-10 h-10 flex items-center justify-center text-[14px] font-bold border border-[rgba(18,18,18,0.15)] rounded-[8px] hover:bg-[#F7F7F7] transition-colors"
                >
                  &rsaquo;
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
