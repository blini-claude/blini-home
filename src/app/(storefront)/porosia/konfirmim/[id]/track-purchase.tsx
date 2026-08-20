"use client";

import { useEffect } from "react";
import { metaPurchase, type PixelItem } from "@/lib/meta-pixel";

/**
 * Fires the pixel's Purchase exactly once per order. Guarded by sessionStorage
 * because this page is a normal URL: a refresh, a back-button, or a customer
 * re-opening the link would otherwise report the same sale again and quietly
 * inflate every campaign's ROAS.
 */
export function TrackPurchase({
  orderNumber,
  items,
  value,
}: {
  orderNumber: string;
  items: PixelItem[];
  value: number;
}) {
  useEffect(() => {
    const key = `bh_purchase_${orderNumber}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private mode with storage denied — better a possible double than none.
    }
    metaPurchase(orderNumber, items, value);
  }, [orderNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
