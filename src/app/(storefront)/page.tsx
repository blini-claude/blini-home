import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts } from "@/lib/queries";
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
  { label: "Bukuri & Kujdes", href: "/koleksion/bukuri-kujdes" },
  { label: "Nën 10€", href: "/koleksion/nen-10" },
  { label: "Kuzhinë", href: "/koleksion/kuzhine" },
  { label: "Sporte & Aktivitete", href: "/koleksion/sporte-aktivitete" },
  { label: "Fëmijë & Lodra", href: "/koleksion/femije-lodra" },
  { label: "Të rejat", href: "/koleksion/te-rejat" },
];

export default async function HomePage() {
  // Pull each shelf from its OWN collection with a different sort, then dedupe
  // across shelves so the same product never shows up twice on the homepage.
  const [
    premiumRaw,
    techRaw,
    homeRaw,
    beautyRaw,
    bargainRaw,
    settings,
  ] = await Promise.all([
    // Hero shelf: the most premium, best-looking pieces (high price, real photos).
    getActiveProducts({ minPrice: 150, limit: 80, sortBy: "price-desc" }).then((r) => r.products),
    getActiveProducts({ collectionSlug: "teknologji", limit: 32, sortBy: "price-desc" }).then((r) => r.products),
    getActiveProducts({ collectionSlug: "shtepi-kuzhine", limit: 24, sortBy: "newest" }).then((r) => r.products),
    getActiveProducts({ collectionSlug: "bukuri-kujdes", limit: 24, sortBy: "newest" }).then((r) => r.products),
    getActiveProducts({ collectionSlug: "nen-10", limit: 24, sortBy: "price-asc" }).then((r) => r.products),
    getSiteSettings(),
  ]);

  // Lead with premium products that have more than one photo (they look richer),
  // then fall back to the rest of the premium pool to guarantee a full shelf.
  const richEnough = (p: { images?: string[] | null }) => (p.images?.length ?? 0) >= 2;
  const premiumOrdered = [
    ...premiumRaw.filter(richEnough),
    ...premiumRaw.filter((p) => !richEnough(p)),
  ];

  // Greedy dedupe in display order: a product claimed by an earlier shelf is
  // dropped from every later shelf, then each shelf is capped at 12 items.
  const seen = new Set<string>();
  const take12 = <T extends { id: string }>(list: T[]): T[] => {
    const out: T[] = [];
    for (const p of list) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      out.push(p);
      if (out.length === 12) break;
    }
    return out;
  };
  const newArrivalShelf = take12(premiumOrdered);
  const techShelf = take12(techRaw);
  const homeShelf = take12(homeRaw);
  const beautyShelf = take12(beautyRaw);
  const bargainShelf = take12(bargainRaw);

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

      {/* Premium hero shelf — most expensive, best-looking pieces */}
      <ProductCarousel
        title="Të zgjedhurat premium ✨"
        products={newArrivalShelf}
        viewAllHref="/koleksion/teknologji"
      />

      <div className="h-[40px] md:h-[60px]" />

      {/* Promo tiles — FT style with pastel bg + lifestyle images */}
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
            title: "Çdo gjë nën 10€",
            subtitle: "Gjetje të vogla me çmim të madh — perfekte për t'i shtuar çdo porosie",
            href: "/koleksion/nen-10",
            bgColor: "#FFF3C4",
            imageUrl: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&q=80&auto=format&fit=crop",
          },
        ]}
      />

      <div className="h-[40px] md:h-[60px]" />

      {/* Tech shelf — pulled from the Teknologji collection */}
      <ProductCarousel
        title="Teknologji & Gadgets"
        products={techShelf}
        viewAllHref="/koleksion/teknologji"
      />

      <div className="h-[40px] md:h-[60px]" />

      {/* Home & kitchen shelf — distinct from the tech shelf */}
      <ProductCarousel
        title="Shtëpi & Kuzhinë"
        products={homeShelf}
        viewAllHref="/koleksion/shtepi-kuzhine"
      />

      <div className="h-[40px] md:h-[60px]" />

      {/* Shop by category circles */}
      <CategoryBubbles />

      <div className="h-[40px] md:h-[60px]" />

      {/* Second promo row */}
      <PromoCards
        cards={[
          {
            title: "Bukuri & Kujdes",
            subtitle: "Kujdesu për veten — produkte bukurie që i do çdo ditë",
            href: "/koleksion/bukuri-kujdes",
            bgColor: "#F5E0EA",
            imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80&auto=format&fit=crop",
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

      <div className="h-[40px] md:h-[60px]" />

      {/* Beauty shelf */}
      <ProductCarousel
        title="Bukuri & Kujdes"
        products={beautyShelf}
        viewAllHref="/koleksion/bukuri-kujdes"
      />

      <div className="h-[40px] md:h-[60px]" />

      {/* Bargain shelf — cheapest-first, great COD add-ons */}
      <ProductCarousel
        title="Çmime që nuk i refuzon dot — nën 10€"
        products={bargainShelf}
        viewAllHref="/koleksion/nen-10"
      />

      <div className="h-[40px] md:h-[60px]" />

      {/* Recently viewed products */}
      <RecentlyViewed />

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
