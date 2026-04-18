"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { MobileMenu } from "./mobile-menu";
import { CartDrawer } from "./cart-drawer";
import { InstantSearch } from "./instant-search";
import { motion, AnimatePresence } from "./motion";
import {
  NAV_TAXONOMY,
  PROMO_LINK,
  ALL_PRODUCTS_LINK,
  buildCategoryHref,
  buildSubcategoryHref,
  type NavCategory,
} from "@/lib/nav-taxonomy";

export function Header({ freeShippingThreshold = 30 }: { freeShippingThreshold?: number }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const { openCart, itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  return (
    <>
      <header className="w-full px-5 mx-auto" style={{ maxWidth: 1440 }}>
        {/* Row 1: Menu | Logo | Search (desktop) | Icons */}
        <div className="flex items-center h-[77px]">
          {/* Menu icon */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-[40px] h-[77px] flex flex-col items-center justify-center flex-shrink-0 cursor-pointer"
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h16M4 6h16M4 18h16" />
            </svg>
            <span className="text-[11px] text-[#062F35] mt-0.5 leading-none tracking-wide">Menu</span>
          </button>

          <div className="w-[20px] md:w-[60px] flex-shrink-0" />

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/logo.svg" alt="BLINI HOME" className="h-[40px] md:h-[50px] w-auto" />
          </Link>

          <div className="hidden md:block w-[60px] flex-shrink-0" />

          {/* Search — instant with live dropdown */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <InstantSearch variant="header" />
          </div>

          <div className="flex-1 md:hidden" />

          <div className="hidden md:block w-[60px] flex-shrink-0" />

          {/* Right icons */}
          <div className="flex items-center flex-shrink-0 gap-0.5">
            {/* Mobile search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden w-[38px] h-[38px] flex items-center justify-center cursor-pointer rounded-full hover:bg-[#F5F5F5] transition-colors"
              aria-label="Kerko"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Account */}
            <Link href="/llogaria" className="hidden md:flex w-[38px] h-[38px] items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors" aria-label="Llogaria">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
              </svg>
            </Link>

            {/* Wishlist */}
            <Link
              href="/llogaria/lista"
              className="w-[38px] h-[38px] flex items-center justify-center relative rounded-full hover:bg-[#F5F5F5] transition-colors"
              aria-label="Lista e dëshirave"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 -right-0.5 bg-[#FFC334] text-[#062F35] text-[9px] font-extrabold w-[17px] h-[17px] rounded-full flex items-center justify-center">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button onClick={openCart} className="w-[38px] h-[38px] flex items-center justify-center relative cursor-pointer rounded-full hover:bg-[#F5F5F5] transition-colors" aria-label="Shporta">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute top-0.5 -right-0.5 bg-[#FFC334] text-[#062F35] text-[9px] font-extrabold w-[17px] h-[17px] rounded-full flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden pb-3">
            <form action="/kerko" className="relative">
              <input
                type="text"
                name="q"
                placeholder="Kërko produkte"
                autoFocus
                className="w-full h-[46px] pl-4 pr-11 bg-[#F5F5F5] text-[15px] outline-none placeholder:text-[rgba(18,18,18,0.4)] rounded-[8px] border border-[rgba(18,18,18,0.08)]"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                aria-label="Kerko"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Row 2: Nav with hover dropdowns */}
        <nav
          className="hidden md:block h-[41px] border-t border-[rgba(18,18,18,0.06)]"
          onMouseLeave={() => setHoveredNav(null)}
        >
          <ul className="flex items-center h-full list-none" style={{ justifyContent: "space-between" }}>
            {NAV_TAXONOMY.map((cat) => (
              <NavItem
                key={cat.slug}
                category={cat}
                isHovered={hoveredNav === cat.slug}
                onHover={() => setHoveredNav(cat.slug)}
              />
            ))}
            <li>
              <Link
                href={PROMO_LINK.href}
                className="whitespace-nowrap text-[15px] font-bold text-[#D4A017] transition-colors py-2"
              >
                {PROMO_LINK.label}
              </Link>
            </li>
            <li>
              <Link
                href={ALL_PRODUCTS_LINK.href}
                className="whitespace-nowrap text-[15px] font-semibold text-[#062F35] hover:text-[rgba(18,18,18,0.6)] transition-colors py-2"
              >
                {ALL_PRODUCTS_LINK.label}
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <CartDrawer freeShippingThreshold={freeShippingThreshold} />
    </>
  );
}

function NavItem({
  category,
  isHovered,
  onHover,
}: {
  category: NavCategory;
  isHovered: boolean;
  onHover: () => void;
}) {
  const catHref = buildCategoryHref(category);
  const hasChildren = category.children.length > 0;

  return (
    <li className="relative" onMouseEnter={onHover}>
      <Link
        href={catHref}
        className={`whitespace-nowrap text-[15px] font-semibold transition-colors py-2 ${
          isHovered ? "text-[#062F35]" : "text-[#062F35] hover:text-[rgba(18,18,18,0.6)]"
        }`}
      >
        {category.label}
      </Link>

      <AnimatePresence>
        {hasChildren && isHovered && (
          <motion.div
            className="fixed left-0 right-0 top-auto pt-2 z-50"
            style={{ marginTop: 20 }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="px-5 mx-auto" style={{ maxWidth: 1440 }}>
              <div
                className="flex bg-white rounded-[16px] shadow-xl border border-[rgba(18,18,18,0.06)] overflow-hidden"
                style={{ minHeight: 340 }}
              >
                <div className="flex-1 py-9 px-10">
                  <p className="text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider mb-4">
                    Nënkategoritë
                  </p>
                  <div className="grid grid-cols-3 gap-x-8 gap-y-1 max-w-[640px]">
                    {category.children.map((child) => (
                      <Link
                        key={child.label}
                        href={buildSubcategoryHref(category, child)}
                        className="text-[14px] text-[#062F35] py-2 hover:text-[rgba(18,18,18,0.5)] transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div
                  className="w-[400px] flex flex-col items-center justify-center p-10 flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                >
                  <p className="text-[22px] font-bold text-[#062F35] text-center leading-snug tracking-[-0.3px]">
                    {category.promoTitle || category.label}
                  </p>
                  {category.promoSubtitle && (
                    <p className="text-[14px] text-[rgba(18,18,18,0.55)] text-center mt-3 leading-relaxed max-w-[280px]">
                      {category.promoSubtitle}
                    </p>
                  )}
                  <Link
                    href={catHref}
                    className="mt-5 inline-flex items-center gap-1.5 bg-[#062F35] text-white text-[13px] font-bold px-5 py-2 rounded-[8px] border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors"
                  >
                    Zbulo të gjitha
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
