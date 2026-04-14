import "dotenv/config";
import { syncAll, syncStore } from "../src/lib/sync/product-sync";
import type { SourceStore } from "../src/types";

async function main() {
  const store = process.argv[2] as SourceStore | "all" | undefined;
  const noImages = process.argv.includes("--no-images");
  const maxProducts = process.argv.find((a) => a.startsWith("--max="));
  const max = maxProducts ? parseInt(maxProducts.split("=")[1]) : undefined;

  console.log("BLINI-HOME Product Sync");
  console.log("=======================");
  console.log(`Store: ${store || "all"}`);
  console.log(`Images: ${noImages ? "skip" : "download"}`);
  if (max) console.log(`Max products: ${max}`);
  console.log("");

  if (store && store !== "all") {
    const result = await syncStore(store, { downloadImages: !noImages, maxProducts: max });
    console.log("\nResult:", JSON.stringify(result, null, 2));
  } else {
    const results = await syncAll({ downloadImages: !noImages, maxProducts: max });
    console.log("\nResults:", JSON.stringify(results, null, 2));
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
