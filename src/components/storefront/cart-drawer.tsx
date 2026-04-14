"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useCart } from "@/contexts/cart-context";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCart();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold">Shporta ({items.length})</h2>
          <button onClick={closeCart} className="p-1" aria-label="Mbyll">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">Shporta juaj është bosh</p>
              <button
                onClick={closeCart}
                className="text-sm font-semibold underline"
              >
                Vazhdo blerjen
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  {/* Square thumbnail */}
                  <div className="w-20 h-20 bg-card-bg flex-shrink-0">
                    {item.thumbnail && (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/produkt/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium line-clamp-2 hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm font-bold mt-1">{item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 border border-border flex items-center justify-center text-sm hover:bg-card-bg transition-colors"
                      >
                        −
                      </button>
                      <span className="text-sm w-6 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-7 h-7 border border-border flex items-center justify-center text-sm hover:bg-card-bg transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto text-text-secondary hover:text-text"
                        aria-label="Hiq"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex justify-between text-base font-bold">
              <span>Nëntotali</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-text-secondary">Dërgimi llogaritet në hapin tjetër</p>
            <Link
              href="/porosia"
              onClick={closeCart}
              className="block w-full bg-[#1A1A1A] text-white text-center py-4 rounded-[5px] text-base font-semibold hover:bg-[#1A1A1A]/90 transition-colors"
            >
              Vazhdo me porosinë
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
