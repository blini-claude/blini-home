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
      <nav className="text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-text">Kryefaqja</Link>
        <span className="mx-2">/</span>
        <span className="text-text">{collection.title}</span>
      </nav>

      {/* Title & sort */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{collection.title}</h1>
          <p className="text-text-secondary text-sm mt-1">{total} produkte</p>
        </div>

        <div className="hidden sm:block">
          <SortSelect current={sort} />
        </div>
      </div>

      {/* Product grid */}
      <ProductGrid products={products} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/koleksion/${slug}?sort=${sort}&page=${p}`}
              className={`w-10 h-10 flex items-center justify-center text-sm font-medium border ${
                p === pageNum
                  ? "bg-text text-white border-text"
                  : "border-border hover:bg-card-bg"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
