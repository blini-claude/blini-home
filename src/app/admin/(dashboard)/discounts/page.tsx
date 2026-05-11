import { db } from "@/lib/db";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminDiscountsPage() {
  const discounts = await db.discount.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  const now = new Date();

  return (
    <>
      <AdminHeader title="Kuponët e zbritjes" subtitle={`${discounts.length} kupone`} />
      <div className="p-6 md:p-8 space-y-5">
        <div className="flex justify-between items-center">
          <p className="text-[12px] text-[rgba(18,18,18,0.45)] font-semibold">
            {discounts.length} kupone gjithsej · {discounts.filter((d) => d.isActive).length} aktivë
          </p>
          <Link
            href="/admin/discounts/new"
            className="h-[40px] px-5 flex items-center bg-[#062F35] text-white rounded-[8px] text-[12px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors"
          >
            + Kupon i ri
          </Link>
        </div>

        {discounts.length === 0 ? (
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-12 text-center">
            <p className="text-[13px] text-[rgba(18,18,18,0.4)]">Ende asnjë kupon</p>
            <Link
              href="/admin/discounts/new"
              className="inline-block mt-3 text-[12px] font-bold text-[#062F35] hover:text-[#FFC334] underline"
            >
              Krijo një kupon
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0F0]">
                  <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                    Kodi
                  </th>
                  <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                    Zbritja
                  </th>
                  <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                    Minimumi
                  </th>
                  <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                    Përdorimi
                  </th>
                  <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                    Skadon
                  </th>
                  <th className="text-center text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                    Statusi
                  </th>
                  <th className="text-right text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => {
                  const expired = d.expiresAt && d.expiresAt < now;
                  const exhausted = d.usageLimit != null && d.usageCount >= d.usageLimit;
                  const live = d.isActive && !expired && !exhausted;
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-[#F8F8F8] hover:bg-[#FAFBFC] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/discounts/${d.id}/edit`}
                          className="text-[13px] font-bold text-[#062F35] hover:text-[#FFC334] font-mono"
                        >
                          {d.code}
                        </Link>
                        {d.description && (
                          <p className="text-[11px] text-[rgba(18,18,18,0.4)] mt-0.5 truncate max-w-[260px]">
                            {d.description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[13px] font-bold text-[#062F35]">
                          {d.discountType === "percentage"
                            ? `${Number(d.value)}%`
                            : `€${Number(d.value).toFixed(2)}`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[rgba(18,18,18,0.5)]">
                        {d.minOrderTotal != null ? `€${Number(d.minOrderTotal).toFixed(2)}` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[#062F35] font-semibold">
                        {d.usageCount}
                        {d.usageLimit != null && (
                          <span className="text-[rgba(18,18,18,0.4)]"> / {d.usageLimit}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[rgba(18,18,18,0.5)]">
                        {d.expiresAt
                          ? new Date(d.expiresAt).toLocaleDateString("sq-AL", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Pakufizuar"}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-[4px] ${
                            live
                              ? "bg-[#E8F5E9] text-[#2E7D32]"
                              : exhausted
                              ? "bg-[#FFF8E1] text-[#B8860B]"
                              : expired
                              ? "bg-[#FFEBEE] text-[#C62828]"
                              : "bg-[#F5F5F5] text-[rgba(18,18,18,0.4)]"
                          }`}
                        >
                          {live ? "Aktiv" : exhausted ? "Mbaroi" : expired ? "Skaduar" : "Joaktiv"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/admin/discounts/${d.id}/edit`}
                          className="text-[11px] font-bold text-[#062F35] hover:text-[#FFC334] bg-[#F5F5F5] hover:bg-[#F0F7F8] px-3 py-1.5 rounded-[6px] transition-colors"
                        >
                          Ndrysho
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
