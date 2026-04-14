import { getNewArrivals, getActiveProducts } from "@/lib/queries";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { CategoryBubbles } from "@/components/storefront/category-bubbles";
import { ProductCarousel } from "@/components/storefront/product-carousel";
import { PromoCards } from "@/components/storefront/promo-cards";
import { DeliveryInfo } from "@/components/storefront/delivery-info";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [newArrivals, bestSellers] = await Promise.all([
    getNewArrivals(12),
    getActiveProducts({ limit: 12, sortBy: "newest" }).then((r) => r.products),
  ]);

  return (
    <>
      <HeroBanner />

      <CategoryBubbles />

      <ProductCarousel
        title="Të rejat e javës"
        products={newArrivals}
        viewAllHref="/koleksion/te-rejat"
      />

      <PromoCards
        cards={[
          {
            title: "Ide për Dhurata",
            subtitle: "Gjej dhuratën perfekte për të dashurit tuaj",
            href: "/koleksion/te-rejat",
            gradient: "bg-gradient-to-br from-[#6767A7] to-[#303061]",
          },
          {
            title: "Gjithçka nën €10",
            subtitle: "Produkte cilësore me çmime të ulëta",
            href: "/koleksion/nen-10",
            gradient: "bg-gradient-to-br from-[#E83800] to-[#DC3545]",
          },
        ]}
      />

      <ProductCarousel
        title="Më të shitura"
        products={bestSellers}
        viewAllHref="/koleksion/me-te-shitura"
      />

      <PromoCards
        cards={[
          {
            title: "Teknologji & Gadgets",
            subtitle: "Pajisje smart për çdo ditë",
            href: "/koleksion/teknologji",
            gradient: "bg-gradient-to-br from-[#1a1a2e] to-[#16213e]",
          },
          {
            title: "Fëmijë & Familje",
            subtitle: "Lodra, kujdes dhe gjithçka për të vegjlit",
            href: "/koleksion/femije-lodra",
            gradient: "bg-gradient-to-br from-[#2d6a4f] to-[#40916c]",
          },
        ]}
      />

      <DeliveryInfo />
    </>
  );
}
