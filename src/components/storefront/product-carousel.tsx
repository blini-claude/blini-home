import type { Product } from "@prisma/client";
import { ProductCard } from "./product-card";

export function ProductCarousel({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: Product[];
  viewAllHref?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {viewAllHref && (
            <a
              href={viewAllHref}
              className="text-sm font-medium text-text-secondary hover:text-text underline"
            >
              Shiko të gjitha
            </a>
          )}
        </div>

        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
