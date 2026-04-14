"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@prisma/client";

export function ProductGrid({ products }: { products: Product[] }) {
  const { addItem } = useCart();

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary text-lg">Nuk u gjetën produkte</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => {
        const price = Number(product.price);
        const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
        const isOnSale = compareAt && compareAt > price;

        return (
          <div key={product.id} className="group">
            <Link href={`/produkt/${product.slug}`} className="block relative" style={{ aspectRatio: "5/7" }}>
              <div className="w-full h-full bg-card-bg">
                {(product.thumbnail || product.images[0]) && (
                  <Image
                    src={product.thumbnail || product.images[0]}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                )}
              </div>
              {isOnSale && (
                <div className="absolute top-2 left-2 bg-sale-badge text-white text-[11px] font-bold w-14 h-14 rounded-full flex items-center justify-center">
                  OFERT
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addItem({
                      productId: product.id,
                      quantity: 1,
                      price,
                      title: product.title,
                      thumbnail: product.thumbnail,
                      slug: product.slug,
                    });
                  }}
                  className="w-full bg-text text-white text-sm font-bold py-2 rounded-[7px]"
                >
                  Shto në shportë
                </button>
              </div>
            </Link>
            <div className="mt-2">
              <Link href={`/produkt/${product.slug}`}>
                <h3 className="text-[15px] font-medium text-text line-clamp-2 leading-tight">{product.title}</h3>
              </Link>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-xl font-bold tracking-tight ${isOnSale ? "text-sale" : "text-text"}`}>
                  €{price.toFixed(2)}
                </span>
                {isOnSale && (
                  <span className="text-sm text-text-secondary line-through">€{compareAt!.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
