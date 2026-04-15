"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useCart } from "@/contexts/cart-context";
import { motion, AnimatePresence, drawerVariants, backdropVariants } from "./motion";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCart();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/30"
            onClick={closeCart}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* Drawer */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-white flex flex-col"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-[60px] border-b border-[#E8E8E8]">
              <h2 className="text-[16px] font-bold text-[#062F35]">Shporta ({items.length})</h2>
              <button onClick={closeCart} className="p-1 cursor-pointer" aria-label="Mbyll">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-[rgba(18,18,18,0.55)] text-[14px] mb-4">Shporta juaj është bosh</p>
                  <button
                    onClick={closeCart}
                    className="text-[13px] font-bold text-[#062F35] underline underline-offset-4 cursor-pointer"
                  >
                    Vazhdo blerjen
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-[80px] h-[80px] bg-[#F7F7F7] flex-shrink-0 overflow-hidden">
                        {item.thumbnail && (
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            width={80}
                            height={80}
                            className="w-full h-full object-contain p-1"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/produkt/${item.slug}`}
                          onClick={closeCart}
                          className="text-[13px] font-semibold text-[#062F35] line-clamp-2 hover:underline leading-snug"
                        >
                          {item.title}
                        </Link>
                        <p className="text-[14px] font-bold text-[#062F35] mt-1">€{item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-7 h-7 border border-[#E8E8E8] flex items-center justify-center text-[13px] hover:bg-[#F7F7F7] transition-colors cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-[13px] w-6 text-center font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-7 h-7 border border-[#E8E8E8] flex items-center justify-center text-[13px] hover:bg-[#F7F7F7] transition-colors cursor-pointer"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="ml-auto text-[rgba(18,18,18,0.55)] hover:text-[#062F35] transition-colors cursor-pointer"
                            aria-label="Hiq"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <div className="border-t border-[#E8E8E8] p-5 space-y-4">
                <div className="flex justify-between text-[16px] font-bold text-[#062F35]">
                  <span>Nëntotali</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <p className="text-[12px] text-[rgba(18,18,18,0.55)]">Dërgimi llogaritet në hapin tjetër</p>
                <Link
                  href="/porosia"
                  onClick={closeCart}
                  className="block w-full bg-[#062F35] text-white text-center py-3.5 text-[14px] font-bold rounded-[8px] border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors"
                >
                  Vazhdo me porosinë
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
