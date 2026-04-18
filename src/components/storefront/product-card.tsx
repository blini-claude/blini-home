"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { ActivityPill } from "./activity-pill";
import { StarRating } from "./star-rating";
import { getProductRating } from "@/lib/reviews";
import type { Product } from "@prisma/client";

export function ProductCard({
  product,
  variant = "full",
}: {
  product: Product;
  variant?: "full" | "minimal";
}) {
  const { addItem } = useCart();
  const price = Number(product.price);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const isOnSale = compareAt && compareAt > price;
  const { rating, count } = getProductRating(product.id, price);

  const imgSrc = product.thumbnail || product.images[0] || null;

  return (
    <div className="group flex flex-col h-full">
      {/* Image — fixed aspect ratio for uniform height */}
      <Link
        href={`/produkt/${product.slug}`}
        className="block relative overflow-hidden rounded-[8px] bg-[#E8E8E8]"
        style={{ aspectRatio: "3/5" }}
        draggable={false}
      >
        {imgSrc && (
          <img
            src={imgSrc}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
            draggable={false}
            loading="lazy"
          />
        )}

        {/* Sale badge — only on sale items */}
        {isOnSale && (
          <span className="absolute top-2.5 left-2.5 bg-[#FFC334] text-[#062F35] text-[11px] font-bold px-2.5 py-1 rounded-[8px] leading-none">
            -{Math.round(((compareAt! - price) / compareAt!) * 100)}%
          </span>
        )}
      </Link>

      {/* Product info */}
      <div className="mt-2.5 flex-1 flex flex-col">
        <Link href={`/produkt/${product.slug}`} draggable={false}>
          <h3 className="text-[15px] font-bold text-[#062F35] leading-[20px] line-clamp-1">
            {product.title.split(/\s+/).slice(0, 3).join(" ")}
          </h3>
        </Link>

        {/* Activity Pill */}
        <div className="mt-1">
          <ActivityPill
            productId={product.id}
            price={price}
            isFeatured={product.isFeatured}
            isOnSale={!!isOnSale}
            variant="compact"
          />
        </div>

        {/* Star Rating */}
        <div className="mt-1">
          <StarRating rating={rating} count={count} size="sm" />
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <span className={`text-[15px] font-bold ${isOnSale ? "text-[#D4A017]" : "text-[#062F35]"}`}>
            &euro;{price.toFixed(2)}
          </span>
          {isOnSale && (
            <span className="text-[13px] text-[rgba(18,18,18,0.4)] line-through">
              &euro;{compareAt!.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Add to bag — only in full variant (carousels) */}
      {variant === "full" && (
        <button
          onClick={() => {
            addItem({
              productId: product.id,
              quantity: 1,
              price,
              title: product.title,
              thumbnail: product.thumbnail,
              slug: product.slug,
            });
          }}
          className="w-full mt-2 bg-[#062F35] text-white text-[13px] font-bold py-2 rounded-[8px] border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors cursor-pointer"
        >
          Shto në shportë
        </button>
      )}
    </div>
  );
}
