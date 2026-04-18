import { OrderTracker } from "@/components/storefront/order-tracker";

export const metadata = {
  title: "Ndiq porosinë — BLINI HOME",
  description: "Kontrollo statusin e porosisë tënde me numrin e porosisë dhe telefonin.",
};

export default async function TrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-5 py-10 md:py-14">
      <div className="text-center mb-8">
        <h1 className="text-[28px] md:text-[36px] font-bold text-[#062F35] tracking-[-0.8px] mb-2">
          Ndiq porosinë
        </h1>
        <p className="text-[14px] text-[rgba(18,18,18,0.6)] max-w-md mx-auto">
          Vendos numrin e porosisë dhe telefonin me të cilin ke porositur për të parë statusin aktual.
        </p>
      </div>
      <OrderTracker defaultOrderNumber={order || ""} />
    </div>
  );
}
