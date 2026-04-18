"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

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
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
