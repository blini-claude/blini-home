import { db } from "@/lib/db";

export async function PriceHistoryBadge({
  productId,
  currentPrice,
}: {
  productId: string;
  currentPrice: number;
}) {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400_000);

  const history = await db.priceHistory.findMany({
    where: { productId, recordedAt: { gte: ninetyDaysAgo } },
    orderBy: { price: "asc" },
    take: 1,
  });

  if (history.length === 0) return null;

  const lowest = Number(history[0].price);

  if (currentPrice <= lowest) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-3 py-1.5 rounded-[6px]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m19 12-7 7-7-7" />
          <path d="M12 5v14" />
        </svg>
        Çmimi më i ulët i 90 ditëve
      </div>
    );
  }

  return (
    <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold text-[rgba(18,18,18,0.55)] bg-[#F5F5F5] px-3 py-1.5 rounded-[6px]">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      Çmimi më i ulët në 90 ditë: €{lowest.toFixed(2)}
    </div>
  );
}
