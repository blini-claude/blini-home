import { AdminHeader } from "@/components/admin/admin-header";
import { DiscountForm } from "@/components/admin/discount-form";

export default function AdminDiscountNewPage() {
  return (
    <>
      <AdminHeader title="Kupon i ri" subtitle="Krijo një kupon zbritjeje" />
      <DiscountForm
        mode="create"
        discount={{
          code: "",
          description: null,
          discountType: "percentage",
          value: 10,
          minOrderTotal: null,
          startsAt: new Date().toISOString(),
          expiresAt: null,
          usageLimit: null,
          perCustomerLimit: null,
          isActive: true,
        }}
      />
    </>
  );
}
