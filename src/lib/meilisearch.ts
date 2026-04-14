import { Meilisearch } from "meilisearch";

const globalForMeili = globalThis as unknown as {
  meili: Meilisearch | undefined;
};

export const meili =
  globalForMeili.meili ??
  new Meilisearch({
    host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
    apiKey: process.env.MEILISEARCH_API_KEY || "",
  });

if (process.env.NODE_ENV !== "production") globalForMeili.meili = meili;

export const PRODUCTS_INDEX = "products";
