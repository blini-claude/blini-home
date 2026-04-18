import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { BlacklistTable } from "@/components/admin/blacklist-table";
import { BlacklistForm } from "@/components/admin/blacklist-form";
import Link from "next/link";

export default async function AdminBlacklistPage({
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
    where.phone = { contains: search };
  }

  const [entries, total] = await Promise.all([
    db.blacklist.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    db.blacklist.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const serialized = entries.map((e) => ({
    id: e.id,
    phone: e.phone,
    reason: e.reason,
    notes: e.notes,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <>
      <AdminHeader
        title="Lista e zezë"
        subtitle={`${total} numra të bllokuar`}
      />
      <div className="p-6 md:p-8 space-y-6">
        <BlacklistForm />

        <form action="/admin/blacklist" className="max-w-xs">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Kërko me telefon..."
            className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors bg-white"
          />
        </form>

        <BlacklistTable entries={serialized} />

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(
              (p) => (
                <Link
                  key={p}
                  href={`/admin/blacklist?${search ? `search=${search}&` : ""}page=${p}`}
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
