import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { SubscribersTable } from "@/components/admin/subscribers-table";
import Link from "next/link";

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { page = "1", search } = await searchParams;
  const pageNum = Math.max(1, parseInt(page));
  const limit = 30;
  const offset = (pageNum - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.email = { contains: search, mode: "insensitive" };
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);

  const [subscribers, total, activeCount, thisMonth, thisWeek] = await Promise.all([
    db.subscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    db.subscriber.count({ where }),
    db.subscriber.count({ where: { isActive: true } }),
    db.subscriber.count({ where: { createdAt: { gte: monthStart } } }),
    db.subscriber.count({ where: { createdAt: { gte: weekStart } } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const serialized = subscribers.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <>
      <AdminHeader title="Abonentët" subtitle={`${activeCount} abonentë aktivë`} />
      <div className="p-6 md:p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 text-center">
            <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
              Gjithsej
            </p>
            <p className="text-[28px] font-bold text-[#062F35] mt-1 tracking-[-1px]">
              {total}
            </p>
          </div>
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 text-center">
            <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
              Këtë muaj
            </p>
            <p className="text-[28px] font-bold text-[#062F35] mt-1 tracking-[-1px]">
              +{thisMonth}
            </p>
          </div>
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 text-center">
            <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
              Këtë javë
            </p>
            <p className="text-[28px] font-bold text-[#062F35] mt-1 tracking-[-1px]">
              +{thisWeek}
            </p>
          </div>
        </div>

        {/* Search */}
        <form action="/admin/subscribers" className="max-w-xs">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Kërko me email..."
            className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors bg-white"
          />
        </form>

        <SubscribersTable subscribers={serialized} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(
              (p) => (
                <Link
                  key={p}
                  href={`/admin/subscribers?${search ? `search=${search}&` : ""}page=${p}`}
                  className={`w-9 h-9 flex items-center justify-center text-[12px] font-bold rounded-[8px] ${
                    p === pageNum
                      ? "bg-[#062F35] text-white"
                      : "bg-white border border-[#E8E8E8] hover:bg-[#F5F5F5] text-[#062F35]"
                  }`}
                >
                  {p}
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}
