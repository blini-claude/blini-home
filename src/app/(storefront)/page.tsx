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
            gradient: "bg-gradient-to-br from-[#B8C6A8] to-[#8FA876]",
          },
          {
            title: "Gjithçka nën €10",
            subtitle: "Produkte cilësore me çmime të ulëta",
            href: "/koleksion/nen-10",
            gradient: "bg-gradient-to-br from-[#E8A87C] to-[#D68C5E]",
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
            gradient: "bg-gradient-to-br from-[#6B7B8D] to-[#4A5568]",
          },
          {
            title: "Fëmijë & Familje",
            subtitle: "Lodra, kujdes dhe gjithçka për të vegjlit",
            href: "/koleksion/femije-lodra",
            gradient: "bg-gradient-to-br from-[#A8D5BA] to-[#7CB899]",
          },
        ]}
      />

      <DeliveryInfo />
    </>
  );
}
