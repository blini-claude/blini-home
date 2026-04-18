"use client";

import { useWishlist } from "@/contexts/wishlist-context";

export function WishlistButton({
  product,
  variant = "card",
}: {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    thumbnail: string | null;
  };
  variant?: "card" | "pdp";
}) {
  const { isInWishlist, toggle } = useWishlist();
  const active = isInWishlist(product.id);

  const base =
    variant === "card"
      ? "absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm shadow-sm hover:bg-white transition-colors flex items-center justify-center"
      : "inline-flex items-center gap-2 h-[44px] px-4 rounded-[8px] border-2 border-[#062F35] text-[13px] font-bold transition-colors cursor-pointer";

  const pdpActive = active
    ? "bg-[#062F35] text-white"
    : "bg-transparent text-[#062F35] hover:bg-[#062F35] hover:text-white";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle({
          productId: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
        });
      }}
      className={variant === "card" ? base : `${base} ${pdpActive}`}
      aria-label={active ? "Hiq nga lista e dëshirave" : "Shto në listën e dëshirave"}
    >
      <svg
        width={variant === "card" ? "16" : "18"}
        height={variant === "card" ? "16" : "18"}
        viewBox="0 0 24 24"
        fill={active ? "#C62828" : "none"}
        stroke={active ? "#C62828" : variant === "card" ? "#062F35" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {variant === "pdp" && (
        <span>{active ? "Hequr nga lista" : "Shto në listën e dëshirave"}</span>
      )}
    </button>
  );
}
