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
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center gap-4">
          {/* Left: Hamburger + Menu text */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 p-1 -ml-1 flex-shrink-0"
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            <span className="hidden lg:inline text-xs font-medium text-text">Menu</span>
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-xl font-bold tracking-tight text-text">BLINI HOME</span>
          </Link>

          {/* Desktop: Search bar */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-auto">
            <form action="/kerko" className="w-full relative flex">
              <input
                type="text"
                name="q"
                placeholder="Kërko produkte..."
                className="w-full h-10 pl-4 pr-12 bg-white border border-text/30 text-sm outline-none focus:border-text rounded-none"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center bg-text"
                aria-label="Kërko"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </form>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-0.5 flex-shrink-0 ml-auto">
            {/* Mobile search toggle */}
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

            {/* Account icon (desktop) */}
            <Link href="/llogaria" className="hidden lg:flex p-2" aria-label="Llogaria">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
              </svg>
            </Link>

            {/* Wishlist heart icon (desktop) */}
            <button className="hidden lg:flex p-2" aria-label="Lista e dëshirave">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Cart - shopping bag */}
            <button onClick={openCart} className="p-2 relative" aria-label="Shporta">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
            <form action="/kerko" className="relative flex">
              <input
                type="text"
                name="q"
                placeholder="Kërko produkte..."
                autoFocus
                className="w-full h-10 pl-4 pr-12 bg-white border border-text/30 text-sm outline-none rounded-none"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center bg-text"
                aria-label="Kërko"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <CartDrawer />
    </>
  );
}
