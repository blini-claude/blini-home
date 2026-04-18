"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BlacklistEntry = {
  id: string;
  phone: string;
  reason: string | null;
  notes: string | null;
  createdAt: string;
};

export function BlacklistTable({ entries }: { entries: BlacklistEntry[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string, phone: string) {
    if (!confirm(`Hiq ${phone} nga lista e zezë?`)) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/blacklist/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      alert("Gabim gjatë fshirjes");
    } finally {
      setDeleting(null);
    }
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-10 text-center">
        <p className="text-[13px] text-[rgba(18,18,18,0.4)]">Nuk ka numra në listë të zezë</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#F0F0F0]">
            <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Telefoni
            </th>
            <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Arsyeja
            </th>
            <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Shënime
            </th>
            <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Data
            </th>
            <th className="text-right text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Veprime
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-[#F8F8F8] hover:bg-[#FAFBFC] transition-colors"
            >
              <td className="px-5 py-3.5 text-[13px] font-medium text-[#062F35] font-mono">
                {entry.phone}
              </td>
              <td className="px-5 py-3.5 text-[12px] text-[rgba(18,18,18,0.6)]">
                {entry.reason || "—"}
              </td>
              <td className="px-5 py-3.5 text-[12px] text-[rgba(18,18,18,0.5)] max-w-[280px] truncate">
                {entry.notes || "—"}
              </td>
              <td className="px-5 py-3.5 text-[12px] text-[rgba(18,18,18,0.4)]">
                {new Date(entry.createdAt).toLocaleDateString("sq-AL")}
              </td>
              <td className="px-5 py-3.5 text-right">
                <button
                  onClick={() => handleDelete(entry.id, entry.phone)}
                  disabled={deleting === entry.id}
                  className="text-[11px] text-[rgba(18,18,18,0.3)] hover:text-[#C62828] transition-colors cursor-pointer font-medium"
                >
                  {deleting === entry.id ? "..." : "Hiq"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
