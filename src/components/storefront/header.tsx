"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { MobileMenu } from "./mobile-menu";
import { CartDrawer } from "./cart-drawer";
import { InstantSearch } from "./instant-search";
import { motion, AnimatePresence } from "./motion";

const NAV_ITEMS: {
  label: string;
  href: string;
  isPromo?: boolean;
  color?: string;
  promoTitle?: string;
  promoSubtitle?: string;
  children?: { heading?: string; links: { label: string; href: string }[] }[];
}[] = [
  {
    label: "Të reja",
    href: "/koleksion/te-rejat",
    color: "#E8F0E4",
    promoTitle: "Zbulo të rejat",
    promoSubtitle: "Produktet më të reja të javës",
    children: [
      {
        heading: "Kategori",
        links: [
          { label: "Të gjitha të rejat", href: "/koleksion/te-rejat" },
          { label: "Shtepi & Kuzhine", href: "/koleksion/shtepi-kuzhine" },
          { label: "Femije & Lodra", href: "/koleksion/femije-lodra" },
          { label: "Teknologji", href: "/koleksion/teknologji" },
        ],
      },
      {
        heading: "Çmimi",
        links: [
          { label: "Nën €10", href: "/koleksion/nen-10" },
          { label: "Oferta & Zbritje", href: "/koleksion/oferta" },
        ],
      },
    ],
  },
  {
    label: "Bestseller",
    href: "/koleksion/me-te-shitura",
    color: "#FFF0E0",
    promoTitle: "Më të shitura",
    promoSubtitle: "Produktet më të dashura nga klientët",
    children: [
      {
        heading: "Popullaritet",
        links: [
          { label: "Më të shitura", href: "/koleksion/me-te-shitura" },
          { label: "Të gjitha produktet", href: "/koleksion/te-gjitha" },
        ],
      },
      {
        heading: "Çmimi",
        links: [
          { label: "Nën €10", href: "/koleksion/nen-10" },
          { label: "Oferta & Zbritje", href: "/koleksion/oferta" },
        ],
      },
    ],
  },
  { label: "Shtepi", href: "/koleksion/shtepi-kuzhine" },
  {
    label: "Dhurata",
    href: "/koleksion/dhurata",
    color: "#F5E0EA",
    promoTitle: "Ide për dhurata",
    promoSubtitle: "Gjej dhuratën perfekte për të dashurit tuaj",
    children: [
      {
        heading: "Dhurata",
        links: [
          { label: "Ide për dhurata", href: "/koleksion/dhurata" },
          { label: "Nën €10", href: "/koleksion/nen-10" },
          { label: "Të gjitha", href: "/koleksion/te-gjitha" },
        ],
      },
    ],
  },
  { label: "Lodra & Lojera", href: "/koleksion/femije-lodra" },
  { label: "Teknologji", href: "/koleksion/teknologji" },
  { label: "Bukuri", href: "/koleksion/bukuri-kujdes" },
  { label: "Aksesore", href: "/koleksion/veshje-aksesore" },
  { label: "Last Chance - deri 50%", href: "/koleksion/oferta", isPromo: true },
  { label: "Shiko të gjitha", href: "/koleksion/te-gjitha" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const { openCart, itemCount } = useCart();

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
            {NAV_ITEMS.map((item) => (
              <li
                key={item.href + item.label}
                className="relative"
                onMouseEnter={() => item.children ? setHoveredNav(item.label) : setHoveredNav(null)}
              >
                <Link
                  href={item.href}
                  className={`whitespace-nowrap text-[15px] font-semibold transition-colors py-2 ${
                    item.isPromo
                      ? "text-[#D4A017] font-bold"
                      : hoveredNav === item.label
                      ? "text-[#062F35]"
                      : "text-[#062F35] hover:text-[rgba(18,18,18,0.6)]"
                  }`}
                >
                  {item.label}
                </Link>

                {/* Full-width mega menu dropdown */}
                <AnimatePresence>
                {item.children && hoveredNav === item.label && (
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
                        {/* Link columns */}
                        <div className="flex-1 flex gap-10 py-9 px-10">
                          {item.children.map((group, gi) => (
                            <div key={gi} className="min-w-[160px]">
                              {group.heading && (
                                <p className="text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider mb-4">
                                  {group.heading}
                                </p>
                              )}
                              {group.links.map((link) => (
                                <Link
                                  key={link.href}
                                  href={link.href}
                                  className="block text-[14px] text-[#062F35] py-2 hover:text-[rgba(18,18,18,0.5)] transition-colors"
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          ))}
                          {/* CTA at bottom of links area */}
                          <div className="flex items-end ml-auto">
                            <Link
                              href={item.href}
                              className="inline-flex items-center bg-[#062F35] text-white text-[13px] font-bold px-5 py-2 rounded-[8px] border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors whitespace-nowrap"
                            >
                              Blej tani
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                        {/* Pastel promo image area — takes up more space */}
                        <div
                          className="w-[420px] flex flex-col items-center justify-center p-10 flex-shrink-0 relative"
                          style={{ backgroundColor: item.color || "#F5F5F5" }}
                        >
                          <p className="text-[22px] font-bold text-[#062F35] text-center leading-snug tracking-[-0.3px]">
                            {item.promoTitle || item.label}
                          </p>
                          {item.promoSubtitle && (
                            <p className="text-[14px] text-[rgba(18,18,18,0.55)] text-center mt-3 leading-relaxed max-w-[280px]">
                              {item.promoSubtitle}
                            </p>
                          )}
                          <Link
                            href={item.href}
                            className="mt-5 inline-flex items-center gap-1.5 bg-[#062F35] text-white text-[13px] font-bold px-5 py-2 rounded-[8px] border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors"
                          >
                            Zbulo
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
            ))}
          </ul>
        </nav>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <CartDrawer />
    </>
  );
}
