import { NextRequest, NextResponse } from "next/server";
import { meili, PRODUCTS_INDEX } from "@/lib/meilisearch";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "24");
  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

  if (!q.trim()) {
    return NextResponse.json({ hits: [], estimatedTotalHits: 0, query: "" });
  }

  const results = await meili.index(PRODUCTS_INDEX).search(q, {
    limit,
    offset,
    filter: ["isActive = true"],
    attributesToRetrieve: [
      "id", "title", "slug", "price", "compareAtPrice",
      "thumbnail", "category", "sourceStore", "collections",
    ],
  });

  return NextResponse.json(results);
}
