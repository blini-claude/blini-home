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
      <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-6">
        <h2 className="text-[14px] font-bold text-[#062F35] mb-5">
          Nis sinkronizimin
        </h2>

        <div className="mb-6">
          <button
            onClick={triggerSyncAll}
            disabled={syncing !== null}
            className="h-[42px] px-6 bg-[#062F35] text-white rounded-[8px] text-[12px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {syncing === "all" ? "Duke nisur..." : "Sinkronizo të gjitha dyqanet"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STORES.map((store) => (
            <div
              key={store}
              className="border-2 border-[#F0F0F0] rounded-[10px] p-5"
            >
              <h3 className="text-[13px] font-bold text-[#062F35] capitalize mb-4">
                {store}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => triggerSync(store, "full")}
                  disabled={syncing !== null}
                  className="text-[11px] px-4 py-2 bg-[#062F35] text-white rounded-[6px] font-bold disabled:opacity-50 hover:bg-[#0a4a54] transition-colors cursor-pointer"
                >
                  {syncing === `${store}-full` ? "..." : "Sinkronizim i plotë"}
                </button>
                <button
                  onClick={() => triggerSync(store, "price")}
                  disabled={syncing !== null}
                  className="text-[11px] px-4 py-2 border-2 border-[#E8E8E8] rounded-[6px] font-bold text-[#062F35] disabled:opacity-50 hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                >
                  {syncing === `${store}-price` ? "..." : "Vetëm çmimet"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync log history */}
      <div className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F0F0F0]">
          <h2 className="text-[14px] font-bold text-[#062F35]">
            Historia e sinkronizimeve
          </h2>
        </div>
        {logs.length === 0 ? (
          <p className="px-5 py-12 text-[13px] text-[rgba(18,18,18,0.4)] text-center">
            Nuk ka sinkronizime ende
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0F0F0]">
                <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                  Dyqani
                </th>
                <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                  Statusi
                </th>
                <th className="text-center text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-3 py-3">
                  Shtuar
                </th>
                <th className="text-center text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-3 py-3">
                  Përditësuar
                </th>
                <th className="text-center text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-3 py-3">
                  Foto
                </th>
                <th className="text-center text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-3 py-3">
                  Gabime
                </th>
                <th className="text-right text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                  Koha
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const duration = log.completedAt
                  ? Math.round(
                      (new Date(log.completedAt).getTime() -
                        new Date(log.startedAt).getTime()) /
                        1000
                    )
                  : null;

                return (
                  <tr
                    key={log.id}
                    className="border-b border-[#F8F8F8] hover:bg-[#FAFBFC] transition-colors"
                  >
                    <td className="px-5 py-3 text-[12px] font-semibold text-[#062F35] capitalize">
                      {log.sourceStore}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-[4px] font-bold ${
                          log.status === "completed"
                            ? "bg-[#E8F5E9] text-[#2E7D32]"
                            : log.status === "running"
                            ? "bg-[#E3F2FD] text-[#1565C0]"
                            : "bg-[#FFEBEE] text-[#C62828]"
                        }`}
                      >
                        {log.status === "completed"
                          ? "Përfunduar"
                          : log.status === "running"
                          ? "Duke punuar"
                          : "Gabim"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-[12px] text-[#062F35]">
                      {log.productsAdded > 0 ? (
                        <span className="font-bold text-[#2E7D32]">
                          +{log.productsAdded}
                        </span>
                      ) : (
                        "0"
                      )}
                    </td>
                    <td className="px-3 py-3 text-center text-[12px] text-[#062F35]">
                      {log.productsUpdated}
                    </td>
                    <td className="px-3 py-3 text-center text-[12px] text-[rgba(18,18,18,0.45)]">
                      {log.imagesDownloaded}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {log.errors.length > 0 ? (
                        <span className="text-[12px] font-bold text-[#C62828]">
                          {log.errors.length}
                        </span>
                      ) : (
                        <span className="text-[12px] text-[rgba(18,18,18,0.3)]">
                          0
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <p className="text-[11px] text-[rgba(18,18,18,0.4)]">
                        {new Date(log.startedAt).toLocaleDateString("sq-AL", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-[10px] text-[rgba(18,18,18,0.3)]">
                        {duration !== null
                          ? `${duration}s`
                          : "duke punuar..."}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
