import "dotenv/config";
import { Meilisearch } from "meilisearch";

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || "http://localhost:7700";
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || "blini_home_meili_2026";

async function setup() {
  const client = new Meilisearch({
    host: MEILISEARCH_HOST,
    apiKey: MEILISEARCH_API_KEY,
  });

  console.log("Setting up Meilisearch indexes...");

  // Create or get products index
  try {
    const task = await client.createIndex("products", { primaryKey: "id" });
    await client.tasks.waitForTask(task.taskUid);
    console.log("Created products index");
  } catch {
    console.log("Products index already exists, continuing...");
  }

  const index = client.index("products");

  await index.updateSearchableAttributes(["title", "description", "category"]);
  console.log("Set searchable attributes");

  await index.updateFilterableAttributes([
    "category", "sourceStore", "isActive", "isFeatured", "price", "collections",
  ]);
  console.log("Set filterable attributes");

  await index.updateSortableAttributes(["price", "createdAt", "title"]);
  console.log("Set sortable attributes");

  await index.updateDisplayedAttributes([
    "id", "title", "slug", "description", "price", "compareAtPrice",
    "thumbnail", "category", "sourceStore", "isActive", "isFeatured", "collections",
  ]);
  console.log("Set displayed attributes");

  console.log("Meilisearch setup complete!");
}

setup().catch(console.error);
