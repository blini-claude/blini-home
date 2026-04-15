"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface SearchHit {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  thumbnail?: string;
  category?: string;
}

export function InstantSearch({ variant }: { variant: "header" | "page" }) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setHits([]);
      setTotalHits(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=${variant === "header" ? 6 : 60}`);
      const data = await res.json();
      setHits(data.hits || []);
      setTotalHits(data.estimatedTotalHits || 0);
    } catch {
      setHits([]);
      setTotalHits(0);
    }
    setLoading(false);
  }, [variant]);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    setShowDropdown(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 200);
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    if (variant !== "header") return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [variant]);

  if (variant === "header") {
    return (
      <div ref={containerRef} className="relative w-full max-w-[530px]">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.trim() && setShowDropdown(true)}
          placeholder="Kërko produkte"
          className="w-full h-[46px] pl-4 pr-11 bg-[#F5F5F5] text-[15px] text-[#062F35] outline-none placeholder:text-[rgba(18,18,18,0.4)] rounded-[8px] border border-[rgba(18,18,18,0.08)] focus:border-[rgba(18,18,18,0.2)] transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <div className="w-[18px] h-[18px] border-2 border-[rgba(18,18,18,0.15)] border-t-[#062F35] rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          )}
        </div>

        {/* Dropdown results */}
        {showDropdown && query.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[16px] shadow-xl border border-[rgba(18,18,18,0.06)] overflow-hidden z-50 max-h-[420px] overflow-y-auto">
            {hits.length > 0 ? (
              <>
                {hits.map((hit) => {
                  const price = Number(hit.price);
                  const compareAt = hit.compareAtPrice ? Number(hit.compareAtPrice) : null;
                  const isOnSale = compareAt && compareAt > price;
                  return (
                    <Link
                      key={hit.slug}
                      href={`/produkt/${hit.slug}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#F9F9F9] transition-colors"
                    >
                      <div className="w-[48px] h-[48px] rounded-[8px] bg-[#f5f5f5] overflow-hidden flex-shrink-0 relative">
                        {hit.thumbnail && (
                          <Image
                            src={hit.thumbnail}
                            alt={hit.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#062F35] line-clamp-1">{hit.title}</p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className={`text-[14px] font-bold ${isOnSale ? "text-[#D4A017]" : "text-[#062F35]"}`}>
                            €{price.toFixed(2)}
                          </span>
                          {isOnSale && (
                            <span className="text-[12px] text-[rgba(18,18,18,0.4)] line-through">
                              €{compareAt!.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {totalHits > hits.length && (
                  <Link
                    href={`/kerko?q=${encodeURIComponent(query)}`}
                    onClick={() => setShowDropdown(false)}
                    className="block text-center py-3 text-[13px] font-bold text-[#062F35] bg-[#F9F9F9] hover:bg-[#F0F0F0] transition-colors"
                  >
                    Shiko të {totalHits} rezultatet
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </>
            ) : !loading ? (
              <div className="py-8 text-center">
                <p className="text-[13px] text-[rgba(18,18,18,0.45)]">
                  Nuk u gjeten rezultate per &ldquo;{query}&rdquo;
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  // Page variant — full search page with instant results
  return (
    <div>
      <div className="relative max-w-[530px] mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Kërko produkte..."
          autoFocus
          className="w-full h-[46px] pl-12 pr-4 bg-[#F5F5F5] text-[15px] text-[#062F35] outline-none placeholder:text-[rgba(18,18,18,0.4)] rounded-[8px] border border-[rgba(18,18,18,0.08)] focus:border-[rgba(18,18,18,0.2)] transition-colors"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {loading ? (
            <div className="w-[18px] h-[18px] border-2 border-[rgba(18,18,18,0.15)] border-t-[#062F35] rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(18,18,18,0.4)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          )}
        </div>
      </div>

      {query.trim() && (
        <p className="text-[13px] text-[rgba(18,18,18,0.55)] mb-6">
          {totalHits} rezultate per &ldquo;{query}&rdquo;
        </p>
      )}

      {hits.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 md:gap-x-5 md:gap-y-8">
          {hits.map((hit) => {
            const price = Number(hit.price);
            const compareAt = hit.compareAtPrice ? Number(hit.compareAtPrice) : null;
            const isOnSale = compareAt && compareAt > price;
            return (
              <Link key={hit.slug} href={`/produkt/${hit.slug}`} className="group flex flex-col">
                <div className="relative overflow-hidden rounded-[8px] bg-[#E8E8E8]" style={{ aspectRatio: "3/5" }}>
                  {hit.thumbnail && (
                    <img
                      src={hit.thumbnail}
                      alt={hit.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}
                  {isOnSale && (
                    <span className="absolute top-2.5 left-2.5 bg-[#FFC334] text-[#062F35] text-[11px] font-bold px-2.5 py-1 rounded-[8px] leading-none">
                      -{Math.round(((compareAt! - price) / compareAt!) * 100)}%
                    </span>
                  )}
                </div>
                <h3 className="text-[15px] font-bold text-[#062F35] leading-[20px] line-clamp-1 mt-2.5">
                  {hit.title.split(/\s+/).slice(0, 3).join(" ")}
                </h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className={`text-[15px] font-bold ${isOnSale ? "text-[#D4A017]" : "text-[#062F35]"}`}>
                    €{price.toFixed(2)}
                  </span>
                  {isOnSale && (
                    <span className="text-[13px] text-[rgba(18,18,18,0.4)] line-through">
                      €{compareAt!.toFixed(2)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : query.trim() && !loading ? (
        <div className="text-center py-16">
          <div className="w-[56px] h-[56px] rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(18,18,18,0.3)" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <p className="text-[15px] text-[rgba(18,18,18,0.55)] mb-4">
            Nuk u gjeten produkte per &ldquo;{query}&rdquo;
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[14px] font-bold text-[#062F35] hover:text-[rgba(18,18,18,0.6)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Kthehu në kryefaqje
          </Link>
        </div>
      ) : null}
    </div>
  );
}
