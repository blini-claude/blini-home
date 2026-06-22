import { getGoogleToken } from "./auth";

/** Google Analytics 4 (Data API) client. Returns empty data when unconfigured. */

const PROPERTY = process.env.GA4_PROPERTY_ID || "";
const BASE = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}`;

interface RunReportBody {
  dateRanges: Array<{ startDate: string; endDate: string }>;
  metrics: Array<{ name: string }>;
  dimensions?: Array<{ name: string }>;
  orderBys?: unknown[];
  limit?: number;
}

interface Ga4Row {
  dimensionValues?: Array<{ value: string }>;
  metricValues?: Array<{ value: string }>;
}

async function runReport(body: RunReportBody): Promise<Ga4Row[]> {
  if (!PROPERTY) return [];
  const token = await getGoogleToken();
  if (!token) return [];
  try {
    const res = await fetch(`${BASE}:runReport`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.rows ?? [];
  } catch {
    return [];
  }
}

const num = (s?: string) => (s ? Number(s) : 0);

export interface Ga4Totals {
  activeUsers: number;
  sessions: number;
  pageViews: number;
}

export async function ga4Totals(days = 28): Promise<Ga4Totals> {
  const rows = await runReport({
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
  });
  const m = rows[0]?.metricValues;
  return {
    activeUsers: num(m?.[0]?.value),
    sessions: num(m?.[1]?.value),
    pageViews: num(m?.[2]?.value),
  };
}

export async function ga4UsersByDate(days = 28): Promise<Array<{ date: string; users: number }>> {
  const rows = await runReport({
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });
  return rows.map((r) => {
    const d = r.dimensionValues?.[0]?.value ?? "";
    return {
      date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`,
      users: num(r.metricValues?.[0]?.value),
    };
  });
}

export async function ga4Channels(days = 28, limit = 8): Promise<Array<{ channel: string; users: number }>> {
  const rows = await runReport({
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit,
  });
  return rows.map((r) => ({
    channel: r.dimensionValues?.[0]?.value ?? "",
    users: num(r.metricValues?.[0]?.value),
  }));
}

export async function ga4TopPages(days = 28, limit = 12): Promise<Array<{ page: string; views: number }>> {
  const rows = await runReport({
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit,
  });
  return rows.map((r) => ({
    page: r.dimensionValues?.[0]?.value ?? "",
    views: num(r.metricValues?.[0]?.value),
  }));
}

export async function ga4Devices(days = 28): Promise<Array<{ device: string; users: number }>> {
  const rows = await runReport({
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: [{ name: "deviceCategory" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
  });
  return rows.map((r) => ({
    device: r.dimensionValues?.[0]?.value ?? "",
    users: num(r.metricValues?.[0]?.value),
  }));
}

export async function ga4TopCountries(days = 28, limit = 10): Promise<Array<{ country: string; users: number }>> {
  const rows = await runReport({
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: [{ name: "country" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit,
  });
  return rows.map((r) => ({
    country: r.dimensionValues?.[0]?.value ?? "",
    users: num(r.metricValues?.[0]?.value),
  }));
}
