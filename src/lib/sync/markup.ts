const MARKUP: Record<string, number> = {
  benny: 1.05,
  sivegeta: 1.05,
  kubik: 1.05,
};

/** Apply the per-store markup. Prices >= 1 are rounded up to the nearest .99. */
export function applyMarkup(price: number, sourceStore: string): number {
  if (!price || price <= 0) return 0;
  const factor = MARKUP[sourceStore] ?? 1.0;
  const marked = price * factor;
  if (factor === 1.0) return Math.round(marked * 100) / 100;
  if (marked >= 1) return Math.ceil(marked) - 0.01;
  return Math.round(marked * 1000) / 1000;
}
