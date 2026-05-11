import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { CollectionEditor } from "@/components/admin/collection-editor";

export default async function AdminCollectionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [collection, allProducts] = await Promise.all([
    db.collection.findUnique({
      where: { id },
      include: {
        products: {
          select: { productId: true },
        },
      },
    }),
    db.product.findMany({
      orderBy: [{ isActive: "desc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        thumbnail: true,
        sourceStore: true,
        category: true,
        price: true,
        isActive: true,
      },
    }),
  ]);

  if (!collection) {
    notFound();
  }

  const productIds = collection.products.map((p) => p.productId);

  const serializedProducts = allProducts.map((p) => ({
    id: p.id,
    title: p.title,
    thumbnail: p.thumbnail,
    sourceStore: p.sourceStore,
    category: p.category,
    price: Number(p.price),
    isActive: p.isActive,
  }));

  return (
    <>
      <AdminHeader title="Ndrysho koleksionin" subtitle={collection.title} />
      <CollectionEditor
        collection={{
          id: collection.id,
          title: collection.title,
          slug: collection.slug,
          description: collection.description,
          image: collection.image,
          isActive: collection.isActive,
          sortOrder: collection.sortOrder,
          productIds,
        }}
        allProducts={serializedProducts}
      />
    </>
  );
}
