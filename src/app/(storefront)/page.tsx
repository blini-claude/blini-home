import type { Metadata } from "next";
import Link from "next/link";
import { getNewArrivals, getActiveProducts } from "@/lib/queries";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { CategoryBubbles } from "@/components/storefront/category-bubbles";
import { ProductCarousel } from "@/components/storefront/product-carousel";
import { PromoCards } from "@/components/storefront/promo-cards";
import { DeliveryInfo } from "@/components/storefront/delivery-info";
import { RecentlyViewed } from "@/components/storefront/recently-viewed";
import { getSiteSettings } from "@/lib/site-settings";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd, STORE_FAQS, SITE_URL, BRAND } from "@/lib/seo";

export const metadata: Metadata = {
  title: "BLINI HOME — Bli online në Kosovë me pagesë në dorë | Teknologji, Shtëpi, Kuzhinë",
  description:
    "Dyqani online në Kosovë për teknologji, shtëpi, kuzhinë, mobilje, bukuri e lodra. " +
    "Çmime të mira, pagesë në dorë (COD) dhe dërgesë 1–3 ditë në të gjithë Kosovën. Kthim falas 14 ditë.",
  alternates: { canonical: SITE_URL },
};

// ISR: fast cached homepage (better Core Web Vitals → better rankings & conversion),
// refreshed every 10 min so new arrivals / hero edits still flow through.
export const revalidate = 600;

const POPULAR_CATEGORIES: { label: string; href: string }[] = [
  { label: "Teknologji", href: "/koleksion/teknologji" },
  { label: "Shtëpi & Kuzhinë", href: "/koleksion/shtepi-kuzhine" },
  { label: "Mobilje", href: "/koleksion/mobilje" },
  { label: "Bukuri & Kujdes", href: "/koleksion/bukuri-kujdes" },
  { label: "Fëmijë & Lodra", href: "/koleksion/femije-lodra" },
  { label: "Më të shitura", href: "/koleksion/me-te-shitura" },
  { label: "Oferta & Zbritje", href: "/koleksion/oferta" },
  { label: "Të rejat", href: "/koleksion/te-rejat" },
];

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
      <JsonLd data={[faqJsonLd(STORE_FAQS)]} />

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

      {/* SEO content block — H1, value prop, internal links, FAQ */}
      <section className="px-5 mx-auto mt-12 pt-10 border-t border-[rgba(18,18,18,0.08)]" style={{ maxWidth: 1000 }}>
        <h1 className="text-[24px] md:text-[30px] font-extrabold text-[#062F35] tracking-[-1px] leading-tight mb-4">
          {BRAND} — bli online në Kosovë me pagesë në dorë
        </h1>
        <div className="space-y-3 text-[14px] leading-relaxed text-[rgba(18,18,18,0.7)] max-w-[760px]">
          <p>
            {BRAND} është dyqani yt online në Kosovë për teknologji, shtëpi, kuzhinë, mobilje, bukuri,
            fëmijë e lodra dhe shumë më tepër. Mijëra produkte cilësore me çmimet më të mira, të gjitha
            në një vend, me pagesë në dorë (COD) — paguan vetëm kur porosia të arrijë te ti.
          </p>
          <p>
            Dërgesë e shpejtë 1–3 ditë në Prishtinë, Pejë, Prizren, Gjakovë, Ferizaj, Mitrovicë e në
            të gjithë Kosovën, me kthim falas brenda 14 ditësh dhe mbështetje në shqip. Porosit online
            sot dhe blej pa rrezik, pa parapagesë.
          </p>
        </div>

        <h2 className="text-[16px] font-extrabold text-[#062F35] mt-8 mb-3">Kategoritë më të kërkuara</h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR_CATEGORIES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="px-3.5 py-2 text-[13px] font-bold text-[#062F35] bg-[#F1F4F3] rounded-full hover:bg-[#E2E8E6] transition-colors"
            >
              {c.label}
            </Link>
          ))}
        </div>

        <h2 className="text-[16px] font-extrabold text-[#062F35] mt-10 mb-3">Pyetje të shpeshta</h2>
        <div className="divide-y divide-[rgba(18,18,18,0.08)] max-w-[760px]">
          {STORE_FAQS.map((f, i) => (
            <div key={i} className="py-3.5">
              <h3 className="text-[14px] font-bold text-[#062F35] mb-1">{f.q}</h3>
              <p className="text-[14px] leading-relaxed text-[rgba(18,18,18,0.7)]">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-[40px]" />
    </>
  );
}
