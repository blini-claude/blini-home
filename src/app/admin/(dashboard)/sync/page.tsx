import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { SyncPanel } from "@/components/admin/sync-panel";

export default async function AdminSyncPage() {
  const logs = await db.syncLog.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  const serialized = logs.map((l) => ({
    ...l,
    startedAt: l.startedAt.toISOString(),
    completedAt: l.completedAt?.toISOString() || null,
  }));

  return (
    <>
      <AdminHeader title="Sync Controls" />
      <div className="p-6">
        <SyncPanel logs={serialized} />
      </div>
    </>
  );
}
