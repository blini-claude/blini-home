"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, AnimatePresence, leftDrawerVariants, backdropVariants } from "./motion";

const CATEGORIES = [
  { label: "Të reja", href: "/koleksion/te-rejat", color: "#E8F0E4", emoji: "✨" },
  { label: "Bestseller", href: "/koleksion/me-te-shitura", color: "#FFF0E0", emoji: "🔥" },
  { label: "Shtëpi & Kuzhinë", href: "/koleksion/shtepi-kuzhine", color: "#E0EBF5", emoji: "🏠" },
  { label: "Dhurata", href: "/koleksion/dhurata", color: "#F5E0EA", emoji: "🎁" },
  { label: "Lodra & Lojëra", href: "/koleksion/femije-lodra", color: "#FFF0E0", emoji: "🧸" },
  { label: "Teknologji", href: "/koleksion/teknologji", color: "#E0EBF5", emoji: "💡" },
  { label: "Bukuri", href: "/koleksion/bukuri-kujdes", color: "#F5E0EA", emoji: "💄" },
  { label: "Aksesore", href: "/koleksion/veshje-aksesore", color: "#EDE0F5", emoji: "👜" },
  { label: "Nën €10", href: "/koleksion/nen-10", color: "#E8F0E4", emoji: "💰" },
];

const INFO_ITEMS = [
  { label: "Rreth nesh", href: "/rreth-nesh" },
  { label: "Dërgimi", href: "/dergimi" },
  { label: "Kthimi i produkteve", href: "/kthimi" },
  { label: "Pyetje të shpeshta", href: "/pyetje" },
];

export function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
            onClick={onClose}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* Panel */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-[310px] md:w-[350px] bg-white overflow-y-auto"
            variants={leftDrawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 h-[72px]">
              <Link href="/" onClick={onClose}>
                <img src="/logo.svg" alt="BLINI HOME" className="h-[56px] w-auto" />
              </Link>
              <button onClick={onClose} className="w-[36px] h-[36px] flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors cursor-pointer" aria-label="Mbyll">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Category pills */}
            <div className="px-4 pt-4 pb-2">
              <p className="text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-1 mb-3">Kategori</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] text-[13px] font-bold text-[#062F35] transition-all hover:scale-105"
                    style={{ backgroundColor: cat.color }}
                  >
                    <span className="text-[14px]">{cat.emoji}</span>
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Promo banner */}
            <div className="mx-4 mt-4 mb-2">
              <Link
                href="/koleksion/oferta"
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3.5 rounded-[12px] bg-gradient-to-r from-[#FFE8E8] to-[#FFF0E0]"
              >
                <div>
                  <p className="text-[14px] font-bold text-[#062F35]">Last Chance</p>
                  <p className="text-[12px] text-[rgba(18,18,18,0.6)]">Deri 50% zbritje</p>
                </div>
                <span className="text-[20px]">🏷️</span>
              </Link>
            </div>

            <div className="mx-4 mt-2 mb-2">
              <Link
                href="/koleksion/te-gjitha"
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-[8px] bg-[#062F35] text-white text-[14px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors"
              >
                Shiko të gjitha produktet
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Divider */}
            <div className="my-3 mx-4 border-t border-[rgba(18,18,18,0.06)]" />

            {/* Info links */}
            <div className="px-4 pb-6">
              <p className="text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-1 mb-2">Informata</p>
              {INFO_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-2 px-1 py-2.5 text-[14px] text-[rgba(18,18,18,0.6)] hover:text-[#062F35] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
