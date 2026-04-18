"use client";

import { useState, useEffect, useCallback } from "react";

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  thumbnail: string | null;
  viewedAt: number;
}

const STORAGE_KEY = "blini-recently-viewed";
const MAX_ITEMS = 20;

function getStored(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStored(items: RecentlyViewedItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    setItems(getStored());
  }, []);

  const addItem = useCallback((product: Omit<RecentlyViewedItem, "viewedAt">) => {
    const stored = getStored();
    const filtered = stored.filter((item) => item.id !== product.id);
    const updated = [
      { ...product, viewedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_ITEMS);
    setStored(updated);
    setItems(updated);
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  }, []);

  return { items, addItem, clearHistory };
}
