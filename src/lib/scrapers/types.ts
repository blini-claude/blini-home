export interface ScrapedProduct {
  sourceStore: "shporta" | "tregu" | "benny" | "sivegeta" | "kubik";
  sourceId: string;
  sourceUrl: string;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  images: string[]; // Source image URLs
  category: string;
  inStock: boolean;
}

export interface ScraperAdapter {
  name: string;
  sourceStore: "shporta" | "tregu" | "benny" | "sivegeta" | "kubik";
  scrapeAll(): AsyncGenerator<ScrapedProduct[], void, unknown>;
  scrapeProduct(url: string): Promise<ScrapedProduct | null>;
}

export interface SyncResult {
  sourceStore: string;
  productsAdded: number;
  productsUpdated: number;
  pricesChanged: number;
  errors: string[];
}
