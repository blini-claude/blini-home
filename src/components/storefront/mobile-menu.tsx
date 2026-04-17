"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, leftDrawerVariants, backdropVariants } from "./motion";
import {
  NAV_TAXONOMY,
  PROMO_LINK,
  ALL_PRODUCTS_LINK,
  buildCategoryHref,
  buildSubcategoryHref,
} from "@/lib/nav-taxonomy";

const INFO_ITEMS = [
  { label: "Rreth nesh", href: "/rreth-nesh" },
  { label: "Dërgimi", href: "/dergimi" },
  { label: "Kthimi i produkteve", href: "/kthimi" },
  { label: "Pyetje të shpeshta", href: "/pyetje" },
  { label: "Llogaria ime", href: "/llogaria" },
];

export function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setExpanded(null);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          <motion.div
            className="absolute left-0 top-0 bottom-0 w-[320px] md:w-[360px] bg-white overflow-y-auto flex flex-col"
            variants={leftDrawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 h-[72px] border-b border-[rgba(18,18,18,0.06)]">
              <Link href="/" onClick={onClose}>
                <img src="/logo.svg" alt="BLINI HOME" className="h-[52px] w-auto" />
              </Link>
              <button
                onClick={onClose}
                className="w-[36px] h-[36px] flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                aria-label="Mbyll"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Category list — Flying Tiger style: inline-expandable */}
            <div className="flex-1 py-2">
              {NAV_TAXONOMY.map((cat) => {
                const isExpanded = expanded === cat.slug;
                const hasChildren = cat.children.length > 0;
                return (
                  <div key={cat.slug}>
                    <div
                      className="flex items-center justify-between pl-5 pr-3 h-[54px] transition-colors hover:bg-[#FAFAFA]"
                      style={{ borderLeft: `4px solid ${cat.color}` }}
                    >
                      <Link
                        href={buildCategoryHref(cat)}
                        onClick={onClose}
                        className="flex-1 text-[16px] font-bold text-[#062F35] flex items-center"
                      >
                        {cat.label}
                      </Link>
                      {hasChildren && (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : cat.slug)}
                          className="w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? "Mbyll" : "Hap"}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#062F35"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded && hasChildren && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden"
                          style={{ backgroundColor: cat.color }}
                        >
                          <div className="py-2">
                            <Link
                              href={buildCategoryHref(cat)}
                              onClick={onClose}
                              className="block pl-9 pr-4 py-2.5 text-[14px] font-bold text-[#062F35] hover:opacity-70"
                            >
                              Të gjitha në {cat.label} →
                            </Link>
                            {cat.children.map((child) => (
                              <Link
                                key={child.label}
                                href={buildSubcategoryHref(cat, child)}
                                onClick={onClose}
                                className="block pl-9 pr-4 py-2 text-[14px] text-[#062F35] hover:opacity-70 transition-opacity"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Promo banner */}
            <div className="px-5 py-3 border-t border-[rgba(18,18,18,0.06)]">
              <Link
                href={PROMO_LINK.href}
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3.5 rounded-[12px] bg-gradient-to-r from-[#FFE8E8] to-[#FFF0E0]"
              >
                <div>
                  <p className="text-[14px] font-bold text-[#D4A017]">Last Chance</p>
                  <p className="text-[12px] text-[rgba(18,18,18,0.6)]">Deri 50% zbritje</p>
                </div>
                <span className="text-[20px]">🏷️</span>
              </Link>
            </div>

            <div className="px-5 pb-3">
              <Link
                href={ALL_PRODUCTS_LINK.href}
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-[8px] bg-[#062F35] text-white text-[14px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors"
              >
                {ALL_PRODUCTS_LINK.label}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Info links */}
            <div className="px-5 pb-6 border-t border-[rgba(18,18,18,0.06)] pt-3">
              <p className="text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider mb-2">
                Informata
              </p>
              {INFO_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between py-2.5 text-[14px] text-[#062F35] hover:opacity-60 transition-opacity"
                >
                  {item.label}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
