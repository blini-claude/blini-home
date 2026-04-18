"use client";

import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { WishlistButton } from "@/components/storefront/wishlist-button";

export function AddToCartButton({
  product,
}: {
  product: {
    id: string;
    title: string;
    price: number;
    thumbnail: string | null;
    slug: string;
  };
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <div className="flex items-center border border-border rounded-[8px] overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-11 h-11 flex items-center justify-center text-[16px] hover:bg-[#F7F7F7] transition-colors"
          >
            &minus;
          </button>
          <span className="w-10 text-center text-[14px] font-bold">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-11 h-11 flex items-center justify-center text-[16px] hover:bg-[#F7F7F7] transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            addItem({
              productId: product.id,
              quantity,
              price: product.price,
              title: product.title,
              thumbnail: product.thumbnail,
              slug: product.slug,
            });
            setQuantity(1);
          }}
          className="flex-1 bg-[#062F35] text-white py-4 rounded-[8px] text-[15px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors"
        >
          Shto në shportë &mdash; &euro;{(product.price * quantity).toFixed(2)}
        </button>
        <WishlistButton product={product} variant="pdp" />
      </div>
    </div>
  );
}
