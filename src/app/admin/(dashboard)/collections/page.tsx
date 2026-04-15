import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { CollectionsManager } from "@/components/admin/collections-manager";

export default async function AdminCollectionsPage() {
  const collections = await db.collection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <AdminHeader
        title="Koleksionet"
        subtitle={`${collections.length} koleksione`}
      />
      <div className="p-6 md:p-8">
        <CollectionsManager collections={collections} />
      </div>
    </>
  );
}
