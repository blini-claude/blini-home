"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Product } from "@prisma/client";
import { ProductCard } from "./product-card";
import { FadeIn } from "./motion";

export function ProductCarousel({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: Product[];
  viewAllHref?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ isDown: false, startX: 0, scrollLeft: 0, hasDragged: false, pointerId: -1 });

  if (products.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector("div")?.offsetWidth || 240;
    const amount = direction === "left" ? -(cardWidth + 15) : cardWidth + 15;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <FadeIn>
    <section className="pt-[20px]">
      <div className="px-5 mx-auto" style={{ maxWidth: 1440 }}>
        {/* Title */}
        <div className="flex items-end justify-between mb-[20px]">
          <h2 className="text-[24px] md:text-[32px] font-bold text-[#062F35] tracking-[-1px] leading-[1.1]">
            {title}
          </h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[8px] text-[13px] font-bold text-white bg-[#062F35] border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors"
            >
              Shiko të gjitha
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {/* Scrollable carousel */}
        <div className="relative group/carousel">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-[30%] -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-[8px] flex items-center justify-center shadow-md border border-[#eee] opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
            aria-label="Scroll left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            onPointerDown={(e) => {
              if (!scrollRef.current || e.button !== 0) return;
              drag.current = {
                isDown: true,
                startX: e.clientX,
                scrollLeft: scrollRef.current.scrollLeft,
                hasDragged: false,
                pointerId: e.pointerId,
              };
            }}
            onPointerMove={(e) => {
              if (!drag.current.isDown || drag.current.pointerId !== e.pointerId || !scrollRef.current) return;
              const diff = e.clientX - drag.current.startX;
              if (Math.abs(diff) > 5) {
                if (!drag.current.hasDragged) {
                  // First time crossing threshold — capture pointer now
                  drag.current.hasDragged = true;
                  scrollRef.current.setPointerCapture(e.pointerId);
                }
                scrollRef.current.scrollLeft = drag.current.scrollLeft - diff;
              }
            }}
            onPointerUp={(e) => {
              if (drag.current.pointerId !== e.pointerId) return;
              drag.current.isDown = false;
              if (scrollRef.current?.hasPointerCapture(e.pointerId)) {
                scrollRef.current.releasePointerCapture(e.pointerId);
              }
              drag.current.pointerId = -1;
            }}
            onPointerCancel={() => {
              drag.current.isDown = false;
              drag.current.pointerId = -1;
            }}
            onDragStart={(e) => e.preventDefault()}
            onClickCapture={(e) => {
              if (drag.current.hasDragged) {
                e.preventDefault();
                e.stopPropagation();
                drag.current.hasDragged = false;
              }
            }}
            className="flex gap-[15px] overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing select-none touch-pan-y"
          >
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[165px] md:w-[240px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-[30%] -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-[8px] flex items-center justify-center shadow-md border border-[#eee] opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
            aria-label="Scroll right"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
    </FadeIn>
  );
}
