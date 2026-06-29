import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://home.blini.world";
export const BRAND = "BLINI HOME";

const SOCIALS = [
  "https://instagram.com/blini.home",
  "https://facebook.com/blini.home",
  "https://tiktok.com/@blini.home",
];

/** Absolute URL for og/json-ld images (next/image + crawlers need full URLs). */
export function abs(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function clamp(s: string, n: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, n - 1).trimEnd()}…`;
}

function eur(n: number): string {
  return `${n.toFixed(2)}€`;
}

interface SeoProduct {
  title: string;
  slug: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  category?: string | null;
  tags?: string[];
  price: number;
  compareAtPrice?: number | null;
  stock?: number;
  images?: string[];
  thumbnail?: string | null;
}

/**
 * Keyword-rich Albanian product description, generated from structured fields.
 * Used as the storefront description AND as the auto-filled description when a
 * product is created without one — so every product ships with buying-intent,
 * Kosovo-market copy out of the box.
 */
export function autoProductDescription(p: SeoProduct): string {
  const cat = p.category?.trim();
  const tags = (p.tags ?? []).filter(Boolean).slice(0, 4);
  const onSale = p.compareAtPrice && p.compareAtPrice > p.price;

  const parts: string[] = [];
  parts.push(
    `${p.title} — ${cat ? `${cat.toLowerCase()} ` : ""}me cilësi të lartë, tani në BLINI HOME.`
  );
  if (tags.length) parts.push(`Ideale për: ${tags.join(", ")}.`);
  parts.push(
    `Bli online me ${onSale ? "çmim të zbritur " : "çmimin më të mirë "}${eur(p.price)}, ` +
      `me pagesë në dorë (COD) dhe dërgesë 1–3 ditë në të gjithë Kosovën.`
  );
  parts.push(`Kthim falas brenda 14 ditësh. Porosit tani te BLINI HOME.`);
  return parts.join(" ");
}

export function productSeoTitle(p: SeoProduct): string {
  if (p.metaTitle?.trim()) return clamp(p.metaTitle, 65);
  // Keep the product name first (most important), brand last.
  return clamp(`${p.title} – Blej online | ${BRAND}`, 65);
}

export function productSeoDescription(p: SeoProduct): string {
  if (p.metaDescription?.trim()) return clamp(p.metaDescription, 165);
  if (p.description?.trim()) {
    const onSale = p.compareAtPrice && p.compareAtPrice > p.price;
    return clamp(
      `${p.description} ${eur(p.price)}${onSale ? " (zbritje)" : ""}, pagesë në dorë, dërgesë 1–3 ditë në Kosovë.`,
      165
    );
  }
  return clamp(autoProductDescription(p), 165);
}

export function productKeywords(p: SeoProduct): string[] {
  const base = [
    p.title,
    p.category || "",
    ...(p.tags ?? []),
    `${p.title} çmim`,
    `blej ${p.title}`,
    "blej online Kosovë",
    "pagesa në dorë",
    "dërgesa Kosovë",
    BRAND,
  ];
  return Array.from(new Set(base.map((k) => k.trim()).filter(Boolean)));
}

export function productMetadata(p: SeoProduct): Metadata {
  const title = productSeoTitle(p);
  const description = productSeoDescription(p);
  const url = `${SITE_URL}/produkt/${p.slug}`;
  const image = abs(p.thumbnail || p.images?.[0]);
  return {
    title,
    description,
    keywords: productKeywords(p),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: BRAND,
      locale: "sq_AL",
      ...(image ? { images: [{ url: image, alt: p.title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

interface SeoCollection {
  title: string;
  slug: string;
  description?: string | null;
  image?: string | null;
}

export function collectionMetadata(c: SeoCollection, productCount?: number): Metadata {
  const title = clamp(`${c.title} – Blej online në Kosovë | ${BRAND}`, 65);
  const description = clamp(
    c.description?.trim() ||
      `Zbulo ${c.title.toLowerCase()}${productCount ? ` (${productCount}+ produkte)` : ""} në BLINI HOME. ` +
        `Çmime të mira, pagesë në dorë (COD) dhe dërgesë 1–3 ditë në të gjithë Kosovën.`,
    165
  );
  const url = `${SITE_URL}/koleksion/${c.slug}`;
  const image = abs(c.image);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: BRAND,
      locale: "sq_AL",
      ...(image ? { images: [{ url: image, alt: c.title }] } : {}),
    },
  };
}

/**
 * Keyword-rich, indexable Albanian intro copy for a category/collection page.
 * Category landing pages need real text to rank for buying-intent searches
 * like "blej <category> online Kosovë" / "<category> me pagesë në dorë".
 * Returns short paragraphs.
 */
export function collectionIntro(
  c: { title: string; description?: string | null },
  productCount?: number
): string[] {
  if (c.description?.trim() && c.description.trim().length > 80) {
    return c.description.trim().split(/\n{2,}/).slice(0, 3);
  }
  const t = c.title.trim();
  const tl = t.toLowerCase();
  const count = productCount ? `${productCount}+ ` : "";
  return [
    `Bli ${tl} online në Kosovë te ${BRAND}. Zgjidh nga ${count}produkte ${tl} ` +
      `me çmimet më të mira, pagesë në dorë (COD) dhe dërgesë e shpejtë 1–3 ditë në Prishtinë, ` +
      `Pejë, Prizren, Gjakovë, Ferizaj e në të gjithë Kosovën.`,
    `Te ${BRAND} gjen ${tl} cilësore nga markat më të njohura, me kthim falas brenda 14 ditësh ` +
      `dhe mbështetje në shqip. Porosit ${tl} sot dhe paguaj kur ta marrësh në dorë — pa rrezik, pa parapagesë.`,
  ];
}

/** Default store-wide FAQ (COD / shipping / returns) — drives FAQ rich snippets. */
export const STORE_FAQS: { q: string; a: string }[] = [
  {
    q: "A mund të paguaj kur ta marr produktin në dorë?",
    a: `Po. ${BRAND} ofron pagesë në dorë (COD) në të gjithë Kosovën — paguan vetëm kur porosia të arrijë te ti, pa parapagesë.`,
  },
  {
    q: "Sa zgjat dërgesa?",
    a: "Dërgesa është e shpejtë, zakonisht brenda 1–3 ditëve pune në të gjithë Kosovën. Çmimi i transportit shfaqet gjatë porosisë.",
  },
  {
    q: "A mund ta kthej produktin nëse nuk jam i kënaqur?",
    a: "Po, ke kthim falas brenda 14 ditësh nga marrja e produktit. Na kontakto dhe e zgjidhim menjëherë.",
  },
  {
    q: "Si mund të porosis?",
    a: `Zgjidh produktin, shto në shportë dhe plotëso porosinë me emër, numër telefoni dhe adresë. Ekipi i ${BRAND} të kontakton për konfirmim.`,
  },
];

// ---------- JSON-LD (structured data for rich results) ----------

/** FAQPage structured data — eligible for FAQ rich results in Google. */
export function faqJsonLd(items: { q: string; a: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

export function productJsonLd(
  p: SeoProduct,
  rating: { rating: number; count: number }
): Record<string, unknown> {
  const url = `${SITE_URL}/produkt/${p.slug}`;
  const images = (p.images?.length ? p.images : p.thumbnail ? [p.thumbnail] : [])
    .map((i) => abs(i))
    .filter(Boolean);
  const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: p.title,
    description: productSeoDescription(p),
    sku: p.slug,
    brand: { "@type": "Brand", name: BRAND },
    ...(images.length ? { image: images } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      price: p.price.toFixed(2),
      priceValidUntil: nextYear,
      availability:
        (p.stock ?? 1) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: BRAND },
    },
  };
  if (rating.count > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.rating.toFixed(1),
      reviewCount: rating.count,
      bestRating: "5",
      worstRating: "1",
    };
  }
  return data;
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    sameAs: SOCIALS,
    areaServed: "XK",
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND,
    url: SITE_URL,
    inLanguage: "sq",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/kerko?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function itemListJsonLd(
  products: { title: string; slug: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/produkt/${p.slug}`,
      name: p.title,
    })),
  };
}
