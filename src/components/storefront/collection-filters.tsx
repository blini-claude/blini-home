"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PASTEL_COLORS = [
  "#E8F0E4", "#FFF0E0", "#E0EBF5", "#F5E0EA",
  "#EDE0F5", "#FFF3C4", "#E0F0E8", "#F0E8E4",
  "#E4E8F0", "#F5F0E0", "#E8F0E4", "#FFF0E0",
  "#E0EBF5", "#F5E0EA", "#EDE0F5", "#FFF3C4",
  "#E0F0E8", "#F0E8E4", "#E4E8F0", "#F5F0E0",
];

const TAG_LABELS: Record<string, string> = {
  "Te pergjithshme": "Të gjitha",
  "Elektronike": "Elektronike",
  "Aksesore": "Aksesore",
  "Makine": "Për makinë",
  "Vegla": "Vegla punë",
  "Depilim": "Depilim",
  "Ngjyrosje": "Ngjyra flokesh",
  "Kuzhine": "Kuzhine",
  "Organizim": "Organizim",
  "Bebe": "Për bebe",
  "Dekor": "Dekor",
  "Floke": "Kujdes flokesh",
  "Pastrim": "Pastrim",
  "Ndricim": "Ndricim",
  "Kafshe": "Për kafshë",
  "Shtepi": "Shtëpi",
  "Lekure": "Kujdes lëkure",
  "Makeup": "Makeup",
  "Fitness": "Fitness",
  "Lodra": "Lodra",
};

function PriceRangeSlider({
  min,
  max,
  currentMin,
  currentMax,
  onChange,
}: {
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
  onChange: (min: number, max: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [localMin, setLocalMin] = useState(currentMin);
  const [localMax, setLocalMax] = useState(currentMax);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setLocalMin(currentMin);
    setLocalMax(currentMax);
  }, [currentMin, currentMax]);

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(min + ratio * (max - min));
    },
    [min, max]
  );

  const handlePointerDown = (handle: "min" | "max") => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(handle);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const val = getValueFromPosition(e.clientX);
    if (dragging === "min") {
      const newMin = Math.min(val, localMax - 1);
      setLocalMin(Math.max(min, newMin));
    } else {
      const newMax = Math.max(val, localMin + 1);
      setLocalMax(Math.min(max, newMax));
    }
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(localMin, localMax);
    }, 300);
  };

  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  return (
    <div className="pt-1 pb-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-bold text-[rgba(18,18,18,0.6)]">
          €{localMin.toFixed(0)}
        </span>
        <span className="text-[13px] font-bold text-[rgba(18,18,18,0.6)]">
          €{localMax.toFixed(0)}
        </span>
      </div>
      <div
        ref={trackRef}
        className="relative h-[6px] bg-[#F0F0F0] rounded-full cursor-pointer"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          className="absolute top-0 bottom-0 bg-[#062F35] rounded-full"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[20px] h-[20px] bg-white border-2 border-[#062F35] rounded-full cursor-grab active:cursor-grabbing shadow-sm z-10 touch-none"
          style={{ left: `${minPercent}%`, marginLeft: -10 }}
          onPointerDown={handlePointerDown("min")}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[20px] h-[20px] bg-white border-2 border-[#062F35] rounded-full cursor-grab active:cursor-grabbing shadow-sm z-10 touch-none"
          style={{ left: `${maxPercent}%`, marginLeft: -10 }}
          onPointerDown={handlePointerDown("max")}
        />
      </div>
    </div>
  );
}

export function CollectionFilters({
  currentTag,
  availableTags,
  minPrice,
  maxPrice,
  priceMin,
  priceMax,
  productCount,
}: {
  currentTag: string;
  availableTags: string[];
  minPrice: number;
  maxPrice: number;
  priceMin: number;
  priceMax: number;
  productCount: number;
}) {
  const navigate = useCallback(
    (params: Record<string, string>) => {
      const url = new URL(window.location.href);
      for (const [k, v] of Object.entries(params)) {
        if (v) url.searchParams.set(k, v);
        else url.searchParams.delete(k);
      }
      url.searchParams.delete("page");
      window.location.href = url.toString();
    },
    []
  );

  // Show "Të gjitha" first, then the rest
  const allTag = { value: "", label: "Të gjitha" };
  const tagList = [allTag, ...availableTags.filter(t => t !== "Te pergjithshme").map(t => ({
    value: t,
    label: TAG_LABELS[t] || t,
  }))];

  return (
    <aside className="w-full">
      {/* Tag filters */}
      <div className="mb-6">
        <p className="text-[12px] font-extrabold text-[rgba(18,18,18,0.4)] uppercase tracking-wider mb-3">
          Nënkategori
        </p>
        <div className="flex flex-wrap gap-2">
          {tagList.map((tag, i) => {
            const isActive = currentTag === tag.value;
            return (
              <button
                key={tag.value}
                onClick={() => navigate({ tag: tag.value })}
                className={`px-3.5 py-1.5 rounded-[8px] text-[13px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#062F35] text-white"
                    : "text-[#062F35] hover:scale-105"
                }`}
                style={
                  isActive
                    ? {}
                    : { backgroundColor: PASTEL_COLORS[i % PASTEL_COLORS.length] }
                }
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price filter */}
      <div className="mb-6">
        <p className="text-[12px] font-extrabold text-[rgba(18,18,18,0.4)] uppercase tracking-wider mb-3">
          Çmimi
        </p>
        <PriceRangeSlider
          min={priceMin}
          max={priceMax}
          currentMin={minPrice}
          currentMax={maxPrice}
          onChange={(newMin, newMax) => {
            navigate({
              minPrice: newMin > priceMin ? String(newMin) : "",
              maxPrice: newMax < priceMax ? String(newMax) : "",
            });
          }}
        />
      </div>

      <p className="text-[12px] font-bold text-[rgba(18,18,18,0.4)]">
        {productCount} produkte
      </p>
    </aside>
  );
}
