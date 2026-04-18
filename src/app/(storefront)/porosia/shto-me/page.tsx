import { UpsellProducts } from "./upsell-products";

export const metadata = {
  title: "Plotëso porosinë — BLINI HOME",
};

export default function UpsellPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
      <UpsellProducts />
    </div>
  );
}
