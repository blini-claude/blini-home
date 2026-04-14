"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SyncLogRow {
  id: string;
  sourceStore: string;
  status: string;
  productsAdded: number;
  productsUpdated: number;
  pricesChanged: number;
  imagesDownloaded: number;
  errors: string[];
  startedAt: string;
  completedAt: string | null;
}

const STORES = ["shporta", "tregu", "benny"] as const;

export function SyncPanel({ logs }: { logs: SyncLogRow[] }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState<string | null>(null);

  async function triggerSync(store: string, type: "full" | "price") {
    setSyncing(`${store}-${type}`);
    await fetch("/api/admin/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ store, type }),
    });
    setSyncing(null);
    router.refresh();
  }

  async function triggerSyncAll() {
    setSyncing("all");
    await fetch("/api/admin/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "full" }),
    });
    setSyncing(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Trigger buttons */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
        <h2 className="font-semibold mb-4">Trigger Sync</h2>

        <div className="flex gap-3 mb-4">
          <button
            onClick={triggerSyncAll}
            disabled={syncing !== null}
            className="h-9 px-4 bg-[#121212] text-white rounded text-sm font-medium disabled:opacity-50"
          >
            {syncing === "all" ? "Starting..." : "Sync All Stores"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STORES.map((store) => (
            <div key={store} className="border border-[#e5e7eb] rounded-lg p-4">
              <h3 className="font-medium capitalize mb-3">{store}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => triggerSync(store, "full")}
                  disabled={syncing !== null}
                  className="text-xs px-3 py-1.5 bg-[#6767A7] text-white rounded font-medium disabled:opacity-50"
                >
                  {syncing === `${store}-full` ? "..." : "Full Sync"}
                </button>
                <button
                  onClick={() => triggerSync(store, "price")}
                  disabled={syncing !== null}
                  className="text-xs px-3 py-1.5 border border-[#d1d5db] rounded font-medium disabled:opacity-50"
                >
                  {syncing === `${store}-price` ? "..." : "Price Only"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync log history */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="p-4 border-b border-[#e5e7eb]">
          <h2 className="font-semibold">Sync History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Store</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Status</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Added</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Updated</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Images</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Errors</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Started</th>
              <th className="text-left px-4 py-3 font-medium text-[#707070]">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]">
            {logs.map((log) => {
              const duration = log.completedAt
                ? Math.round(
                    (new Date(log.completedAt).getTime() -
                      new Date(log.startedAt).getTime()) /
                      1000
                  )
                : null;

              return (
                <tr key={log.id} className="hover:bg-[#f8f9fa]">
                  <td className="px-4 py-3 font-medium capitalize">{log.sourceStore}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      log.status === "completed" ? "bg-green-100 text-green-700" :
                      log.status === "running" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{log.productsAdded}</td>
                  <td className="px-4 py-3">{log.productsUpdated}</td>
                  <td className="px-4 py-3">{log.imagesDownloaded}</td>
                  <td className="px-4 py-3">
                    {log.errors.length > 0 ? (
                      <span className="text-red-600 font-medium">{log.errors.length}</span>
                    ) : (
                      <span className="text-[#707070]">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#707070]">
                    {new Date(log.startedAt).toLocaleString("en-GB")}
                  </td>
                  <td className="px-4 py-3 text-[#707070]">
                    {duration !== null ? `${duration}s` : "running..."}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="text-center py-8 text-sm text-[#707070]">No sync logs yet</p>
        )}
      </div>
    </div>
  );
}
