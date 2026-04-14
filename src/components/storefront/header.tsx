"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { MobileMenu } from "./mobile-menu";
import { CartDrawer } from "./cart-drawer";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { openCart, itemCount } = useCart();

  return (
    <>
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2"
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          {/* Center: logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
            <span className="text-xl font-semibold tracking-tight text-text">BLINI HOME</span>
          </Link>

          {/* Desktop search bar */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <form action="/kerko" className="w-full relative">
              <input
                type="text"
                name="q"
                placeholder="Kërko produkte..."
                className="w-full h-10 pl-10 pr-4 rounded-full bg-search-bg text-sm outline-none focus:ring-2 focus:ring-accent"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </form>
          </div>

          {/* Right: icons */}
          <div className="flex items-center gap-1">
            {/* Mobile search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="lg:hidden p-2"
              aria-label="Kërko"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Cart */}
            <button onClick={openCart} className="p-2 relative" aria-label="Shporta">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-sale-badge text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar (expandable) */}
        {searchOpen && (
          <div className="lg:hidden px-4 pb-3">
            <form action="/kerko" className="relative">
              <input
                type="text"
                name="q"
                placeholder="Kërko produkte..."
                autoFocus
                className="w-full h-10 pl-10 pr-4 rounded-full bg-search-bg text-sm outline-none"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </form>
          </div>
        )}
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <CartDrawer />
    </>
  );
}
