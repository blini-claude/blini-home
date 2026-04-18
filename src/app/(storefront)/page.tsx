import { getNewArrivals, getActiveProducts } from "@/lib/queries";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { CategoryBubbles } from "@/components/storefront/category-bubbles";
import { ProductCarousel } from "@/components/storefront/product-carousel";
import { PromoCards } from "@/components/storefront/promo-cards";
import { DeliveryInfo } from "@/components/storefront/delivery-info";
import { RecentlyViewed } from "@/components/storefront/recently-viewed";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [newArrivals, bestSellers, settings] = await Promise.all([
    getNewArrivals(12),
    getActiveProducts({ limit: 12, sortBy: "newest" }).then((r) => r.products),
    getSiteSettings(),
  ]);

  const heroSlides = Array.isArray(settings.heroSlides)
    ? (settings.heroSlides as Array<{
        title: string;
        subtitle: string;
        buttonText: string;
        buttonLink: string;
        image: string;
      }>)
    : [];

  return (
    <>
      {/* Hero banner — full width, immediately after header */}
      <HeroBanner slides={heroSlides} />

      <div className="h-[40px] md:h-[50px]" />

      {/* "Shop new arrivals!" carousel */}
      <ProductCarousel
        title="Të rejat e javës!"
        products={newArrivals}
        viewAllHref="/koleksion/te-rejat"
      />

      <div className="h-[40px] md:h-[60px]" />

      {/* Promo tiles — FT style with pastel bg + lifestyle images */}
      <PromoCards
        cards={[
          {
            title: "Zbukuro tryezen me stile",
            subtitle: "Produkte për kuzhinë dhe tryezë që sjellin ngjyrë në çdo vakt",
            href: "/koleksion/shtepi-kuzhine",
            bgColor: "#FFF3C4",
            imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop",
          },
          {
            title: "Ide për Dhurata",
            subtitle: "Gjej dhuratën perfekte për të dashurit tuaj — për çdo rast dhe çdo buxhet",
            href: "/koleksion/dhurata",
            bgColor: "#F5E0EA",
            imageUrl: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&q=80&auto=format&fit=crop",
          },
        ]}
      />

      <div className="h-[40px] md:h-[60px]" />

      {/* Trending / bestsellers */}
      <ProductCarousel
        title="Më të shitura"
        products={bestSellers}
        viewAllHref="/koleksion/me-te-shitura"
      />

      <div className="h-[40px] md:h-[60px]" />

      {/* Recently viewed products */}
      <RecentlyViewed />

      <div className="h-[40px] md:h-[60px]" />

      {/* Shop by category circles */}
      <CategoryBubbles />

      <div className="h-[40px] md:h-[60px]" />

      {/* Second promo row */}
      <PromoCards
        cards={[
          {
            title: "Teknologji & Gadgets",
            subtitle: "Pajisje smart për çdo ditë — organizohu, argëtohu dhe simplifikohu",
            href: "/koleksion/teknologji",
            bgColor: "#E0EBF5",
            imageUrl: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80&auto=format&fit=crop",
          },
          {
            title: "Fëmijë & Familje",
            subtitle: "Lodra, kujdes dhe gjithçka për të vegjlit që sjellin gëzim",
            href: "/koleksion/femije-lodra",
            bgColor: "#EDE0F5",
            imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80&auto=format&fit=crop",
          },
        ]}
      />

      <div className="h-[20px]" />

      {/* Delivery info bar */}
      <DeliveryInfo />
    </>
  );
}
