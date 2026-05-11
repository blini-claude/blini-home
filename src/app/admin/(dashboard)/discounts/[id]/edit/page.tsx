import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { DiscountForm } from "@/components/admin/discount-form";

export default async function AdminDiscountEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const discount = await db.discount.findUnique({ where: { id } });
  if (!discount) {
    notFound();
  }

  return (
    <>
      <AdminHeader title="Ndrysho kuponin" subtitle={discount.code} />
      <DiscountForm
        mode="edit"
        discount={{
          id: discount.id,
          code: discount.code,
          description: discount.description,
          discountType: discount.discountType as "percentage" | "fixed",
          value: Number(discount.value),
          minOrderTotal: discount.minOrderTotal != null ? Number(discount.minOrderTotal) : null,
          startsAt: discount.startsAt.toISOString(),
          expiresAt: discount.expiresAt ? discount.expiresAt.toISOString() : null,
          usageLimit: discount.usageLimit,
          perCustomerLimit: discount.perCustomerLimit,
          isActive: discount.isActive,
          usageCount: discount.usageCount,
        }}
      />
    </>
  );
}
