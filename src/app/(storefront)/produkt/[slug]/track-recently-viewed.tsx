"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { metaViewContent } from "@/lib/meta-pixel";

export function TrackRecentlyViewed({
  product,
}: {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    thumbnail: string | null;
  };
}) {
  const { addItem } = useRecentlyViewed();

  useEffect(() => {
    addItem(product);
    // Same trigger, same product: the pixel's ViewContent is what later lets a
    // sales campaign re-show this exact item as a product card.
    metaViewContent({ id: product.id, title: product.title, price: product.price, quantity: 1 });
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
