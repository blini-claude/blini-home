import "dotenv/config";
import fs from "fs";
import { db } from "../src/lib/db";
import { processProduct } from "../src/lib/sync/product-sync";
import type { ScrapedProduct, SyncResult } from "../src/lib/scrapers/types";

// usage: tsx scripts/import-snapshot.ts <snapshot.json> [--apply]
// Source shops changed product ids, so a plain sync would duplicate everything.
// Existing rows are re-linked by title first; rows no longer at the source are hidden.
const norm = (t: string) =>
  t.toLowerCase().replace(/&[#a-z0-9]+;/g, " ").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

async function main() {
  const file = process.argv[2];
  const apply = process.argv.includes("--apply");
  const snap: Record<string, ScrapedProduct[]> = JSON.parse(fs.readFileSync(file, "utf8"));

  for (const [store, items] of Object.entries(snap)) {
    const rows = await db.product.findMany({
      where: { sourceStore: store },
      select: { id: true, sourceId: true, title: true, isActive: true },
    });
    const liveIds = new Set(items.map((i) => i.sourceId));
    const byId = new Set(rows.map((r) => r.sourceId));
    const orphans = new Map<string, (typeof rows)[number]>();
    for (const r of rows) if (!liveIds.has(r.sourceId)) orphans.set(norm(r.title), r);

    let relinked = 0;
    for (const it of items) {
      if (byId.has(it.sourceId)) continue;
      const hit = orphans.get(norm(it.title));
      if (!hit) continue;
      orphans.delete(norm(it.title));
      relinked++;
      if (apply) await db.product.update({ where: { id: hit.id }, data: { sourceId: it.sourceId } });
      byId.add(it.sourceId);
    }
    const added = items.filter((i) => !byId.has(i.sourceId));
    const hide = [...orphans.values()].filter((r) => r.isActive);
    console.log(`${store}: source ${items.length}, db ${rows.length}, relink ${relinked}, new ${added.length} (in stock ${added.filter((a) => a.inStock).length}), hide ${hide.length}`);
    if (!apply) continue;

    const result: SyncResult = { sourceStore: store as SyncResult["sourceStore"], productsAdded: 0, productsUpdated: 0, pricesChanged: 0, errors: [] };
    for (const it of items) {
      try {
        await processProduct(it, true, result);
      } catch (err) {
        result.errors.push(`${it.title}: ${err}`);
      }
    }
    if (hide.length) await db.product.updateMany({ where: { id: { in: hide.map((h) => h.id) } }, data: { isActive: false } });
    await db.syncLog.create({ data: { sourceStore: store, status: "completed", productsAdded: result.productsAdded, productsUpdated: result.productsUpdated, pricesChanged: result.pricesChanged, errors: result.errors, completedAt: new Date() } });
    console.log(`${store}: +${result.productsAdded} ~${result.productsUpdated} prices ${result.pricesChanged} errors ${result.errors.length}`, result.errors.slice(0, 5));
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
