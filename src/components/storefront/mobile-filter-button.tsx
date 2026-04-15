"use client";

import { useState } from "react";
import { CollectionFilters } from "./collection-filters";
import { motion, AnimatePresence, backdropVariants } from "./motion";

export function MobileFilterButton({
  currentTag,
  availableTags,
  minPrice,
  maxPrice,
  priceMin,
  priceMax,
  total,
  hasFilters,
}: {
  currentTag: string;
  availableTags: string[];
  minPrice: number;
  maxPrice: number;
  priceMin: number;
  priceMax: number;
  total: number;
  hasFilters: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-bold bg-[#F5F5F5] hover:bg-[#EBEBEB] transition-colors cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="20" y2="12" />
          <line x1="12" y1="18" x2="20" y2="18" />
          <circle cx="6" cy="12" r="2" fill="#062F35" stroke="none" />
          <circle cx="10" cy="18" r="2" fill="#062F35" stroke="none" />
        </svg>
        Filtro
        {hasFilters && (
          <span className="w-[6px] h-[6px] bg-[#FFC334] rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50">
            <motion.div
              className="absolute inset-0 bg-black/30"
              onClick={() => setOpen(false)}
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] max-h-[70vh] overflow-y-auto p-5 pt-3"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[16px] font-extrabold text-[#062F35]">Filtro</p>
                <button
                  onClick={() => setOpen(false)}
                  className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-[#F5F5F5] cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <CollectionFilters
                currentTag={currentTag}
                availableTags={availableTags}
                minPrice={minPrice}
                maxPrice={maxPrice}
                priceMin={priceMin}
                priceMax={priceMax}
                productCount={total}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
