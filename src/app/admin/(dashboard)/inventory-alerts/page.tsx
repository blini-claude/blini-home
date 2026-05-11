import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { AdminHeader } from "@/components/admin/admin-header";

const DEFAULT_THRESHOLD = 5;

export default async function AdminInventoryAlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ threshold?: string; source?: string }>;
}) {
  const { threshold: thresholdParam, source } = await searchParams;
  const threshold = Math.max(0, parseInt(thresholdParam || String(DEFAULT_THRESHOLD), 10));

  const where: Record<string, unknown> = {
    stock: { lte: threshold },
    isActive: true,
  };
  if (source && source !== "all") where.sourceStore = source;

  const [products, allSources, outOfStockCount, lowStockCount] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: [{ stock: "asc" }, { title: "asc" }],
      take: 200,
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        sourceStore: true,
        sourceUrl: true,
        category: true,
        price: true,
        stock: true,
        isActive: true,
        updatedAt: true,
      },
    }),
    db.product
      .findMany({
        where: { isActive: true },
        select: { sourceStore: true },
        distinct: ["sourceStore"],
      })
      .then((rows) => rows.map((r) => r.sourceStore).sort()),
    db.product.count({ where: { isActive: true, stock: 0 } }),
    db.product.count({ where: { isActive: true, stock: { gt: 0, lte: threshold } } }),
  ]);

  return (
    <>
      <AdminHeader
        title="Sinjalizimet e stokut"
        subtitle={`${outOfStockCount} pa stok · ${lowStockCount} stok i ulët`}
      />
      <div className="p-6 md:p-8 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FFEBEE] border border-[#EF5350] rounded-[12px] p-5">
            <p className="text-[11px] text-[#C62828] font-semibold uppercase tracking-wider">
              Pa stok
            </p>
            <p className="text-[36px] font-bold text-[#C62828] mt-1 tracking-[-1px]">
              {outOfStockCount}
            </p>
            <p className="text-[11px] text-[#C62828] mt-1">Stok = 0</p>
          </div>
          <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-[12px] p-5">
            <p className="text-[11px] text-[#B8860B] font-semibold uppercase tracking-wider">
              Stok i ulët
            </p>
            <p className="text-[36px] font-bold text-[#B8860B] mt-1 tracking-[-1px]">
              {lowStockCount}
            </p>
            <p className="text-[11px] text-[#B8860B] mt-1">Më pak se {threshold + 1} njësi</p>
          </div>
          <div className="bg-white border border-[#E8E8E8] rounded-[12px] p-5">
            <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
              Burimet
            </p>
            <p className="text-[36px] font-bold text-[#062F35] mt-1 tracking-[-1px]">
              {allSources.length}
            </p>
            <p className="text-[11px] text-[rgba(18,18,18,0.45)] mt-1 capitalize">
              {allSources.join(" · ")}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <form action="/admin/inventory-alerts" className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-[#062F35] uppercase tracking-wider">
              Pragu
            </label>
            <input
              name="threshold"
              type="number"
              min="0"
              defaultValue={threshold}
              className="h-[40px] w-[80px] px-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] bg-white"
            />
            {source && <input type="hidden" name="source" value={source} />}
            <button
              type="submit"
              className="h-[40px] px-4 bg-[#062F35] text-white rounded-[8px] text-[12px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors"
            >
              Përditëso
            </button>
          </form>

          <div className="flex gap-1 bg-white rounded-[10px] border border-[#E8E8E8] p-1">
            {[{ k: "all", l: "Të gjitha" }, ...allSources.map((s) => ({ k: s, l: s }))].map((s) => (
              <Link
                key={s.k}
                href={`/admin/inventory-alerts?threshold=${threshold}${s.k !== "all" ? `&source=${s.k}` : ""}`}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-[6px] capitalize transition-colors ${
                  (s.k === "all" && !source) || s.k === source
                    ? "bg-[#062F35] text-white"
                    : "text-[rgba(18,18,18,0.5)] hover:text-[#062F35] hover:bg-[#F5F5F5]"
                }`}
              >
                {s.l}
              </Link>
            ))}
          </div>
        </div>

        {/* Table */}
        {products.length === 0 ? (
          <div className="bg-[#E8F5E9] border border-[#A5D6A7] rounded-[12px] p-12 text-center">
            <p className="text-[14px] font-bold text-[#2E7D32]">
              ✓ Të gjitha produktet kanë stok mbi {threshold}
            </p>
            <p className="text-[12px] text-[#2E7D32] mt-1">
              Nuk ka sinjalizime për momentin
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0F0]">
                  <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                    Produkti
                  </th>
                  <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                    Burimi
                  </th>
                  <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                    Kategoria
                  </th>
                  <th className="text-right text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                    Stoku
                  </th>
                  <th className="text-right text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                    Çmimi
                  </th>
                  <th className="text-right text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
                    Veprime
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const out = p.stock === 0;
                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-[#F8F8F8] hover:bg-[#FAFBFC] transition-colors ${
                        out ? "bg-[#FFFAFA]" : ""
                      }`}
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="w-[40px] h-[40px] bg-[#F5F5F5] flex-shrink-0 relative rounded-[8px] overflow-hidden">
                            {p.thumbnail && (
                              <Image
                                src={p.thumbnail}
                                alt=""
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <span className="text-[13px] font-semibold text-[#062F35] group-hover:text-[#FFC334] truncate max-w-[280px]">
                            {p.title}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3 capitalize text-[12px] text-[rgba(18,18,18,0.5)]">
                        {p.sourceStore}
                      </td>
                      <td className="px-5 py-3 text-[12px] text-[rgba(18,18,18,0.5)]">
                        {p.category}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`inline-block min-w-[44px] text-center text-[12px] font-bold px-2.5 py-1 rounded-[4px] ${
                            out
                              ? "bg-[#FFEBEE] text-[#C62828]"
                              : "bg-[#FFF8E1] text-[#B8860B]"
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-[13px] font-bold text-[#062F35]">
                        €{Number(p.price).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <a
                            href={p.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-[rgba(18,18,18,0.5)] hover:text-[#062F35] px-2 py-1 rounded-[4px] hover:bg-[#F5F5F5]"
                          >
                            Burimi ↗
                          </a>
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="text-[11px] font-bold text-[#062F35] hover:text-[#FFC334] bg-[#F5F5F5] hover:bg-[#F0F7F8] px-3 py-1.5 rounded-[6px] transition-colors"
                          >
                            Ndrysho
                          </Link>
                        </div>
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
