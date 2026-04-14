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
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="font-semibold text-text mb-5">Trigger Sync</h2>

        <div className="mb-6">
          <button
            onClick={triggerSyncAll}
            disabled={syncing !== null}
            className="h-10 px-6 bg-text text-white rounded-[5px] text-sm font-semibold disabled:opacity-50 hover:bg-text/90 transition-colors cursor-pointer"
          >
            {syncing === "all" ? "Starting..." : "Sync All Stores"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STORES.map((store) => (
            <div key={store} className="border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-text capitalize mb-4">{store}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => triggerSync(store, "full")}
                  disabled={syncing !== null}
                  className="text-xs px-4 py-2 bg-text text-white rounded-[5px] font-medium disabled:opacity-50 hover:bg-text/90 transition-colors cursor-pointer"
                >
                  {syncing === `${store}-full` ? "..." : "Full Sync"}
                </button>
                <button
                  onClick={() => triggerSync(store, "price")}
                  disabled={syncing !== null}
                  className="text-xs px-4 py-2 border border-gray-200 rounded-[5px] font-medium text-text disabled:opacity-50 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {syncing === `${store}-price` ? "..." : "Price Only"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync log history */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-text">Sync History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Store</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Added</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Updated</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Images</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Errors</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Started</th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => {
              const duration = log.completedAt
                ? Math.round(
                    (new Date(log.completedAt).getTime() -
                      new Date(log.startedAt).getTime()) /
                      1000
                  )
                : null;

              return (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-text capitalize">{log.sourceStore}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                      log.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                      log.status === "running" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text">{log.productsAdded}</td>
                  <td className="px-6 py-4 text-text">{log.productsUpdated}</td>
                  <td className="px-6 py-4 text-text">{log.imagesDownloaded}</td>
                  <td className="px-6 py-4">
                    {log.errors.length > 0 ? (
                      <span className="text-red-600 font-semibold">{log.errors.length}</span>
                    ) : (
                      <span className="text-text-secondary">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {new Date(log.startedAt).toLocaleString("en-GB")}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {duration !== null ? `${duration}s` : "running..."}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="text-center py-12 text-sm text-text-secondary">No sync logs yet</p>
        )}
      </div>
    </div>
  );
}
