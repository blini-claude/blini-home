import { NextRequest, NextResponse } from "next/server";
import { productSyncQueue, priceSyncQueue } from "@/lib/queue";
import type { SourceStore } from "@/types";

const VALID_STORES: SourceStore[] = ["shporta", "tregu", "benny"];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { store, type = "full" } = body as { store?: string; type?: string };

  if (store && !VALID_STORES.includes(store as SourceStore)) {
    return NextResponse.json(
      { error: `Invalid store. Must be one of: ${VALID_STORES.join(", ")}` },
      { status: 400 }
    );
  }

  const stores = store ? [store as SourceStore] : VALID_STORES;
  const jobs = [];

  for (const s of stores) {
    if (type === "price") {
      const job = await priceSyncQueue.add(`price-${s}`, { store: s });
      jobs.push({ store: s, type: "price", jobId: job.id });
    } else {
      const job = await productSyncQueue.add(`sync-${s}`, {
        store: s,
        downloadImages: true,
      });
      jobs.push({ store: s, type: "full", jobId: job.id });
    }
  }

  return NextResponse.json({ message: "Sync jobs queued", jobs });
}
