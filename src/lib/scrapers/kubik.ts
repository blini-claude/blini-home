import { ScrapedProduct, ScraperAdapter } from "./types";
import { fetchWithRetry } from "./utils";

const BASE_URL = "https://www.kubikmall.com";
const API = `${BASE_URL}/wp-json/wc/store/v1/products`;

function toAmount(minor: string | number | undefined, minorUnit: number): number {
  if (minor === undefined || minor === null || minor === "") return 0;
  const n = typeof minor === "string" ? parseInt(minor, 10) : minor;
  if (Number.isNaN(n)) return 0;
  return n / Math.pow(10, minorUnit || 2);
}

export class KubikScraper implements ScraperAdapter {
  name = "Kubik";
  sourceStore = "kubik" as const;

  private map(p: any): ScrapedProduct {
    const minorUnit = p?.prices?.currency_minor_unit ?? 2;
    const price = toAmount(p?.prices?.price, minorUnit);
    const regular = toAmount(p?.prices?.regular_price, minorUnit);
    const html = p?.description || p?.short_description || "";
    return {
      sourceStore: "kubik",
      sourceId: String(p.id),
      sourceUrl: p.permalink || `${BASE_URL}/produkt/${p.slug}`,
      title: p.name,
      description: html.replace(/<[^>]*>/g, "").trim() || null,
      price,
      compareAtPrice: regular > price ? regular : null,
      images: Array.isArray(p.images) ? p.images.map((img: any) => img.src).filter(Boolean) : [],
      category: p?.categories?.[0]?.name || "Të përgjithshme",
      inStock: p?.is_in_stock ?? true,
    };
  }

  async *scrapeAll(): AsyncGenerator<ScrapedProduct[], void, unknown> {
    let page = 1;
    const perPage = 100;
    while (true) {
      const url = `${API}?per_page=${perPage}&page=${page}`;
      let response: Response;
      try {
        response = await fetchWithRetry(url);
      } catch {
        break;
      }
      if (!response.ok) break;
      const products = await response.json();
      if (!Array.isArray(products) || products.length === 0) break;
      const batch = products
        .map((p: any) => this.map(p))
        .filter((p) => p.title && p.price > 0);
      yield batch;
      if (products.length < perPage) break;
      page++;
    }
  }

  async scrapeProduct(url: string): Promise<ScrapedProduct | null> {
    try {
      const slug = url.split("/produkt/")[1]?.replace(/\/$/, "");
      if (!slug) return null;
      const response = await fetchWithRetry(`${API}?slug=${encodeURIComponent(slug)}`);
      if (!response.ok) return null;
      const products = await response.json();
      const p = Array.isArray(products) ? products[0] : null;
      if (!p) return null;
      return this.map(p);
    } catch (err) {
      console.error(`Error scraping ${url}:`, err);
      return null;
    }
  }
}
