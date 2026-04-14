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
    <div className="group">
      {/* Image area — square 1:1, no border-radius */}
      <Link href={`/produkt/${product.slug}`} className="block relative aspect-square">
        <div className="w-full h-full bg-card-bg">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain"
            />
          ) : product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain"
            />
          ) : null}
        </div>

        {/* Pill badge top-left */}
        {isOnSale && (
          <span className="absolute top-2 left-2 bg-badge-sale text-white rounded-full px-3 py-1 text-xs font-bold">
            OFERT&Euml;
          </span>
        )}

        {/* Wishlist heart icon top-right */}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Shto në listën e dëshirave"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* "Shto ne shporte" button on hover — full width at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
            className="w-full bg-text text-white text-sm font-semibold py-2.5 rounded-[5px]"
          >
            Shto n&euml; shport&euml;
          </button>
        </div>
      </Link>

      {/* Product info */}
      <div className="mt-3">
        <Link href={`/produkt/${product.slug}`}>
          <h3 className="text-sm font-medium text-text line-clamp-2 leading-snug">
            {product.title}
          </h3>
        </Link>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={`text-base font-bold ${isOnSale ? "text-sale" : "text-text"}`}>
            &euro;{price.toFixed(2)}
          </span>
          {isOnSale && (
            <span className="text-sm text-text-secondary line-through">
              &euro;{compareAt!.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
