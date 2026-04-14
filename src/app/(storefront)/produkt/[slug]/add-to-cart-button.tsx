"use client";

import { useState } from "react";
import { useCart } from "@/contexts/cart-context";

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
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-border">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center text-lg hover:bg-card-bg transition-colors"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center text-lg hover:bg-card-bg transition-colors"
          >
            +
          </button>
        </div>
      </div>

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
        className="w-full bg-[#1A1A1A] text-white py-4 rounded-[5px] text-base font-semibold hover:bg-[#1A1A1A]/90 transition-colors"
      >
        Shto në shportë — €{(product.price * quantity).toFixed(2)}
      </button>
    </div>
  );
}
