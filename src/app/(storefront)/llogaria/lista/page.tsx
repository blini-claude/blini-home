import { WishlistGrid } from "@/components/storefront/wishlist-grid";

export const metadata = {
  title: "Lista e dëshirave — BLINI HOME",
  description: "Produktet që keni ruajtur për më vonë.",
};

export default function WishlistPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-5 py-8 md:py-12">
      <div className="mb-6 md:mb-8">
        <h1 className="text-[26px] md:text-[32px] font-bold text-[#062F35] tracking-[-0.6px]">
          Lista e dëshirave
        </h1>
        <p className="text-[13px] md:text-[14px] text-[rgba(18,18,18,0.55)] mt-1">
          Produktet që dëshironi t&apos;i blini më vonë.
        </p>
      </div>
      <WishlistGrid />
    </div>
  );
}
