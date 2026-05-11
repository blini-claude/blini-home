import { AdminHeader } from "@/components/admin/admin-header";
import { ManualOrderForm } from "@/components/admin/manual-order-form";

export default function AdminOrderNewPage() {
  return (
    <>
      <AdminHeader title="Porosi e re manuale" subtitle="Krijo një porosi për një klient që ka kontaktuar përmes telefonit ose WhatsApp" />
      <ManualOrderForm />
    </>
  );
}
