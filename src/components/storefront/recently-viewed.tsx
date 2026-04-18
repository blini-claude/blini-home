"use client";

import { useRecentlyViewed, type RecentlyViewedItem } from "@/hooks/use-recently-viewed";
import Link from "next/link";
import { ActivityPill } from "./activity-pill";

export function RecentlyViewed() {
  const { items, clearHistory } = useRecentlyViewed();

  if (items.length < 2) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] md:text-[20px] font-bold text-[#062F35] tracking-[-0.3px]">
          Shikuar së fundi
        </h2>
        <button
          onClick={clearHistory}
          className="text-[11px] text-[rgba(18,18,18,0.4)] hover:text-[#062F35] transition-colors cursor-pointer"
        >
          Pastro historikun
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {items.map((item) => (
          <RecentlyViewedCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function RecentlyViewedCard({ item }: { item: RecentlyViewedItem }) {
  return (
    <Link
      href={`/produkt/${item.slug}`}
      className="flex-shrink-0 w-[140px] md:w-[170px] snap-start group"
      draggable={false}
    >
      <div
        className="relative overflow-hidden rounded-[8px] bg-[#E8E8E8]"
        style={{ aspectRatio: "3/4" }}
      >
        {item.thumbnail && (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            draggable={false}
          />
        )}
      </div>
      <div className="mt-2">
        <h3 className="text-[13px] font-bold text-[#062F35] leading-tight line-clamp-1">
          {item.title.split(/\s+/).slice(0, 3).join(" ")}
        </h3>
        <p className="text-[13px] font-bold text-[#062F35] mt-0.5">
          &euro;{item.price.toFixed(2)}
        </p>
        <div className="mt-1">
          <ActivityPill productId={item.id} price={item.price} variant="compact" />
        </div>
      </div>
    </Link>
  );
}
