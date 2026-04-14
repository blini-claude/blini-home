"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@prisma/client";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const price = Number(product.price);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const isOnSale = compareAt && compareAt > price;

  return (
    <div className="group w-[180px] sm:w-[220px] flex-shrink-0">
      {/* Image area — no border-radius, 5:7 aspect ratio */}
      <Link href={`/produkt/${product.slug}`} className="block relative" style={{ aspectRatio: "5/7" }}>
        <div className="w-full h-full bg-card-bg">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="220px"
              className="object-cover"
            />
          ) : product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              sizes="220px"
              className="object-cover"
            />
          ) : null}
        </div>

        {/* Badges */}
        {isOnSale && (
          <div className="absolute top-2 left-2 bg-sale-badge text-white text-[11px] font-bold w-14 h-14 rounded-full flex items-center justify-center">
            OFERT
          </div>
        )}

        {/* Quick add — appears on hover */}
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

      {/* Info */}
      <div className="mt-2">
        <Link href={`/produkt/${product.slug}`}>
          <h3 className="text-[15px] font-medium text-text line-clamp-2 leading-tight">
            {product.title}
          </h3>
        </Link>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={`text-xl font-bold tracking-tight ${isOnSale ? "text-sale" : "text-text"}`}>
            €{price.toFixed(2)}
          </span>
          {isOnSale && (
            <span className="text-sm text-text-secondary line-through">
              €{compareAt!.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
