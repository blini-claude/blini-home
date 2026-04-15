"use client";

import type { Product } from "@prisma/client";
import { ProductCard } from "./product-card";
import { StaggerContainer, StaggerItem } from "./motion";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[rgba(18,18,18,0.55)] text-[15px]">Nuk u gjeten produkte</p>
      </div>
    );
  }

  return (
    <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 md:gap-x-5 md:gap-y-8" staggerDelay={0.04}>
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} variant="minimal" />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
