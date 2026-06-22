import { getGoogleToken } from "./auth";

/** Google Search Console (Search Analytics) client. Empty when unconfigured. */

const SITE = process.env.GSC_SITE_URL || "";
const BASE = "https://searchconsole.googleapis.com/webmasters/v3";

export interface GscRow {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function query(body: Record<string, unknown>): Promise<GscRow[]> {
  if (!SITE) return [];
  const token = await getGoogleToken();
  if (!token) return [];
  try {
    const res = await fetch(
      `${BASE}/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.rows ?? [];
  } catch {
    return [];
  }
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
}

// GSC data lags ~2 days; buffer the end date.
export function gscRange(days = 28) {
  return { startDate: isoDaysAgo(days + 2), endDate: isoDaysAgo(2) };
}

export interface GscTotals {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export async function gscTotals(days = 28): Promise<GscTotals> {
  const { startDate, endDate } = gscRange(days);
  const rows = await query({ startDate, endDate });
  const r = rows[0];
  return {
    clicks: r?.clicks ?? 0,
    impressions: r?.impressions ?? 0,
    ctr: r?.ctr ?? 0,
    position: r?.position ?? 0,
  };
}

export async function gscByDate(days = 28): Promise<Array<{ date: string; clicks: number; impressions: number }>> {
  const { startDate, endDate } = gscRange(days);
  const rows = await query({ startDate, endDate, dimensions: ["date"], rowLimit: days + 2 });
  return rows.map((r) => ({ date: r.keys?.[0] ?? "", clicks: r.clicks, impressions: r.impressions }));
}

export async function gscTopQueries(days = 28, limit = 20): Promise<GscRow[]> {
  const { startDate, endDate } = gscRange(days);
  return query({ startDate, endDate, dimensions: ["query"], rowLimit: limit });
}

export async function gscTopPages(days = 28, limit = 20): Promise<GscRow[]> {
  const { startDate, endDate } = gscRange(days);
  return query({ startDate, endDate, dimensions: ["page"], rowLimit: limit });
}

export async function gscTopCountries(days = 28, limit = 10): Promise<GscRow[]> {
  const { startDate, endDate } = gscRange(days);
  return query({ startDate, endDate, dimensions: ["country"], rowLimit: limit });
}
