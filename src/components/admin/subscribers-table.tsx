"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Subscriber = {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
};

export function SubscribersTable({ subscribers }: { subscribers: Subscriber[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Je i sigurt që dëshiron të fshish këtë abonent?")) return;
    setDeleting(id);
    try {
      await fetch("/api/admin/subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      router.refresh();
    } catch {
      alert("Gabim gjatë fshirjes");
    } finally {
      setDeleting(null);
    }
  }

  if (subscribers.length === 0) {
    return (
      <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-10 text-center">
        <p className="text-[13px] text-[rgba(18,18,18,0.4)]">Nuk ka abonentë ende</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#F0F0F0]">
            <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Email
            </th>
            <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Statusi
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
          {subscribers.map((sub) => (
            <tr
              key={sub.id}
              className="border-b border-[#F8F8F8] hover:bg-[#FAFBFC] transition-colors"
            >
              <td className="px-5 py-3.5 text-[13px] font-medium text-[#062F35]">
                {sub.email}
              </td>
              <td className="px-5 py-3.5">
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-[4px] ${
                    sub.isActive
                      ? "bg-[#E8F5E9] text-[#2E7D32]"
                      : "bg-[#F5F5F5] text-[rgba(18,18,18,0.4)]"
                  }`}
                >
                  {sub.isActive ? "Aktiv" : "Joaktiv"}
                </span>
              </td>
              <td className="px-5 py-3.5 text-[12px] text-[rgba(18,18,18,0.4)]">
                {new Date(sub.createdAt).toLocaleDateString("sq-AL")}
              </td>
              <td className="px-5 py-3.5 text-right">
                <button
                  onClick={() => handleDelete(sub.id)}
                  disabled={deleting === sub.id}
                  className="text-[11px] text-[rgba(18,18,18,0.3)] hover:text-[#C62828] transition-colors cursor-pointer font-medium"
                >
                  {deleting === sub.id ? "..." : "Fshij"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
