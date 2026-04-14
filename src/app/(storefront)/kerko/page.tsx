import Link from "next/link";
import Image from "next/image";
import { meili, PRODUCTS_INDEX } from "@/lib/meilisearch";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  let results: any = { hits: [], estimatedTotalHits: 0 };

  if (q.trim()) {
    results = await meili.index(PRODUCTS_INDEX).search(q, {
      limit: 48,
      filter: ["isActive = true"],
      attributesToRetrieve: [
        "id", "title", "slug", "price", "compareAtPrice",
        "thumbnail", "category", "sourceStore",
      ],
    });
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Kërko</h1>

      {/* Search form */}
      <form action="/kerko" className="mb-8">
        <div className="relative max-w-xl">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Kërko produkte..."
            autoFocus
            className="w-full h-12 pl-12 pr-4 rounded-full bg-search-bg text-base outline-none focus:ring-2 focus:ring-accent"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </form>

      {q.trim() && (
        <p className="text-text-secondary text-sm mb-6">
          {results.estimatedTotalHits} rezultate për &ldquo;{q}&rdquo;
        </p>
      )}

      {/* Results grid */}
      {results.hits.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.hits.map((hit: any) => {
            const price = Number(hit.price);
            const compareAt = hit.compareAtPrice ? Number(hit.compareAtPrice) : null;
            const isOnSale = compareAt && compareAt > price;

            return (
              <Link key={hit.slug} href={`/produkt/${hit.slug}`} className="group">
                <div className="relative bg-card-bg" style={{ aspectRatio: "5/7" }}>
                  {hit.thumbnail && (
                    <Image
                      src={hit.thumbnail}
                      alt={hit.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  )}
                  {isOnSale && (
                    <div className="absolute top-2 left-2 bg-sale-badge text-white text-[11px] font-bold w-14 h-14 rounded-full flex items-center justify-center">
                      OFERT
                    </div>
                  )}
                </div>
                <h3 className="text-[15px] font-medium text-text line-clamp-2 mt-2">{hit.title}</h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className={`text-xl font-bold tracking-tight ${isOnSale ? "text-sale" : "text-text"}`}>
                    €{price.toFixed(2)}
                  </span>
                  {isOnSale && (
                    <span className="text-sm text-text-secondary line-through">€{compareAt!.toFixed(2)}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : q.trim() ? (
        <div className="text-center py-16">
          <p className="text-text-secondary text-lg">Nuk u gjetën produkte për &ldquo;{q}&rdquo;</p>
          <Link href="/" className="text-sm font-semibold underline mt-4 inline-block">
            Kthehu në kryefaqje
          </Link>
        </div>
      ) : null}
    </div>
  );
}
