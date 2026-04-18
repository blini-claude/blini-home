"use client";

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

type Tier = "hot" | "warm" | "active";

function getTier(price: number, isFeatured: boolean, isOnSale: boolean): Tier {
  if (price >= 50 || isFeatured || isOnSale) return "hot";
  if (price >= 15) return "warm";
  return "active";
}

function getActivityCount(productId: string, tier: Tier): number {
  const hourSeed = Math.floor(Date.now() / 3600000);
  const hash = simpleHash(productId + String(hourSeed));
  const ranges: Record<Tier, [number, number]> = {
    hot: [18, 45],
    warm: [8, 22],
    active: [3, 15],
  };
  const [min, max] = ranges[tier];
  return min + (hash % (max - min + 1));
}

const tierStyles: Record<Tier, { bg: string; text: string; dot: string }> = {
  hot: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#DC2626]" },
  warm: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]", dot: "bg-[#EA580C]" },
  active: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#16A34A]" },
};

export function ActivityPill({
  productId,
  price,
  isFeatured = false,
  isOnSale = false,
  variant = "compact",
}: {
  productId: string;
  price: number;
  isFeatured?: boolean;
  isOnSale?: boolean;
  variant?: "compact" | "full";
}) {
  const tier = getTier(price, isFeatured, isOnSale);
  const count = getActivityCount(productId, tier);
  const styles = tierStyles[tier];

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] ${styles.bg}`}>
        <span className={`w-[5px] h-[5px] rounded-full ${styles.dot} animate-pulse`} />
        <span className={`text-[10px] font-semibold ${styles.text} leading-none`}>
          {count} po shikojnë
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] ${styles.bg}`}>
      <span className={`w-[6px] h-[6px] rounded-full ${styles.dot} animate-pulse`} />
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.text}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span className={`text-[12px] font-semibold ${styles.text}`}>
        {count} persona po e shikojnë tani
      </span>
    </div>
  );
}
