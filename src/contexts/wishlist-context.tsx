"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type WishlistItem = {
  productId: string;
  slug: string;
  title: string;
  price: number;
  thumbnail: string | null;
  addedAt: number;
};

interface WishlistContextType {
  items: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  toggle: (item: Omit<WishlistItem, "addedAt">) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "blini-home-wishlist";
const MAX_ITEMS = 100;

function load(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function save(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(load());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) save(items);
  }, [items, mounted]);

  const isInWishlist = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  const toggle = useCallback((item: Omit<WishlistItem, "addedAt">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.filter((i) => i.productId !== item.productId);
      }
      const next = [{ ...item, addedAt: Date.now() }, ...prev];
      return next.slice(0, MAX_ITEMS);
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        isInWishlist,
        toggle,
        remove,
        clear,
        count: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
