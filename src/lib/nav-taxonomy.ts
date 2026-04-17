/**
 * Shared navigation taxonomy.
 *
 * Categories here drive BOTH the desktop mega menu and the Flying Tiger
 * mobile sidebar. Subcategory labels MUST match the `tags` values produced
 * by scripts/retaxonomize.ts, so that /koleksion/<slug>?tag=<label>
 * filters correctly on the collection page.
 */
export type NavChild = { label: string; tag?: string; href?: string };
export type NavCategory = {
  label: string;
  slug: string;        // collection slug → /koleksion/<slug>
  color: string;       // pastel accent for sidebar + mega-menu promo
  promoTitle?: string;
  promoSubtitle?: string;
  children: NavChild[];
};

export const NAV_TAXONOMY: NavCategory[] = [
  {
    label: "Të reja",
    slug: "te-rejat",
    color: "#E8F0E4",
    promoTitle: "Zbulo të rejat",
    promoSubtitle: "Produktet më të reja të javës",
    children: [
      { label: "Të gjitha të rejat", href: "/koleksion/te-rejat" },
      { label: "Shtëpi", href: "/koleksion/shtepi-kuzhine" },
      { label: "Teknologji", href: "/koleksion/teknologji" },
      { label: "Mobilje", href: "/koleksion/mobilje" },
      { label: "Bukuri", href: "/koleksion/bukuri-kujdes" },
      { label: "Nën €10", href: "/koleksion/nen-10" },
    ],
  },
  {
    label: "Bestseller",
    slug: "me-te-shitura",
    color: "#FFF0E0",
    promoTitle: "Më të shitura",
    promoSubtitle: "Produktet më të dashura nga klientët",
    children: [
      { label: "Të gjitha bestseller", href: "/koleksion/me-te-shitura" },
      { label: "Oferta & Zbritje", href: "/koleksion/oferta" },
      { label: "Dhurata", href: "/koleksion/dhurata" },
      { label: "Ide për Dhurata", href: "/koleksion/ide-per-dhurata" },
    ],
  },
  {
    label: "Shtëpi",
    slug: "shtepi-kuzhine",
    color: "#E0EBF5",
    promoTitle: "Gjithçka për shtëpinë",
    promoSubtitle: "Pastrim, organizim, dekor dhe më shumë",
    children: [
      { label: "Pastrim", tag: "Pastrim" },
      { label: "Organizim", tag: "Organizim" },
      { label: "Dekor", tag: "Dekor" },
      { label: "Ndriçim", tag: "Ndriçim" },
      { label: "Tekstil Shtëpie", tag: "Tekstil Shtëpie" },
      { label: "Ngrohje & Ajrim", tag: "Ngrohje & Ajrim" },
      { label: "Kopshti & Oborr", tag: "Kopshti & Oborr" },
      { label: "Vegla Dore", tag: "Vegla Dore" },
      { label: "Vegla Elektrike", tag: "Vegla Elektrike" },
      { label: "Bojë & Ndërtim", tag: "Bojë & Ndërtim" },
      { label: "Sanitari & Ujë", tag: "Sanitari & Ujë" },
      { label: "Aksesore Makine", tag: "Aksesore Makine" },
      { label: "Kafshë Shtëpie", tag: "Kafshë Shtëpie" },
    ],
  },
  {
    label: "Kuzhinë",
    slug: "kuzhine",
    color: "#FFF3C4",
    promoTitle: "Kuzhina juaj, e plotësuar",
    promoSubtitle: "Enë gatimi, pajisje elektrike dhe takëm",
    children: [
      { label: "Enë Gatimi", tag: "Enë Gatimi" },
      { label: "Pajisje Elektrike", tag: "Pajisje Elektrike" },
      { label: "Aksesore Kuzhine", tag: "Aksesore Kuzhine" },
    ],
  },
  {
    label: "Mobilje",
    slug: "mobilje",
    color: "#F0E8E4",
    promoTitle: "Mobilje për çdo dhomë",
    promoSubtitle: "Karrige, tavolina, shtretër dhe më shumë",
    children: [
      { label: "Karrige", tag: "Karrige" },
      { label: "Tavolina", tag: "Tavolina" },
      { label: "Rafte & Dollap", tag: "Rafte & Dollap" },
      { label: "Shtretër & Dyshek", tag: "Shtretër & Dyshek" },
      { label: "Mobilje Oborri", tag: "Mobilje Oborri" },
    ],
  },
  {
    label: "Teknologji",
    slug: "teknologji",
    color: "#E4E8F0",
    promoTitle: "Teknologjia që të lehtëson jetën",
    promoSubtitle: "Telefona, TV, Gaming dhe aksesore",
    children: [
      { label: "Telefona & Tablet", tag: "Telefona & Tablet" },
      { label: "Laptop & Kompjuter", tag: "Laptop & Kompjuter" },
      { label: "TV & Projektor", tag: "TV & Projektor" },
      { label: "Audio & Kufje", tag: "Audio & Kufje" },
      { label: "Gaming & Konzola", tag: "Gaming & Konzola" },
      { label: "Kamera & Sigurie", tag: "Kamera & Sigurie" },
      { label: "Smartwatch", tag: "Smartwatch & Fitness Tracker" },
      { label: "Dronë", tag: "Dronë" },
      { label: "Scooter & Hoverboard", tag: "Scooter & Hoverboard" },
      { label: "Aksesore Teknologjike", tag: "Aksesore Teknologjike" },
      { label: "Smart Home & Rrjet", tag: "Smart Home & Rrjet" },
    ],
  },
  {
    label: "Fëmijë & Lodra",
    slug: "femije-lodra",
    color: "#F5E0EA",
    promoTitle: "Për fëmijët dhe bebet",
    promoSubtitle: "Bebe, lodra, karroca, veshje",
    children: [
      { label: "Bebe (0-2)", tag: "Bebe (0-2)" },
      { label: "Karrocat & Dubak", tag: "Karrocat & Dubak" },
      { label: "Baby Monitor", tag: "Baby Monitor" },
      { label: "Lodra", tag: "Lodra" },
      { label: "Mobilje Fëmijësh", tag: "Mobilje Fëmijësh" },
    ],
  },
  {
    label: "Bukuri & Kujdes",
    slug: "bukuri-kujdes",
    color: "#EDE0F5",
    promoTitle: "Bukuri dhe kujdes personal",
    promoSubtitle: "Flokë, makeup, parfum dhe lëkurë",
    children: [
      { label: "Makeup", tag: "Makeup" },
      { label: "Flokë (Hair)", tag: "Flokë (Hair)" },
      { label: "Depilim & Rroje", tag: "Depilim & Rroje" },
      { label: "Lëkurë", tag: "Lëkurë" },
      { label: "Parfume", tag: "Parfume" },
      { label: "Thonjë & Manikyr", tag: "Thonjë & Manikyr" },
      { label: "Kujdes Personal", tag: "Kujdes Personal" },
    ],
  },
  {
    label: "Sporte & Fitness",
    slug: "sporte-fitness",
    color: "#E0F0E8",
    promoTitle: "Lëvizje dhe aktivitet",
    promoSubtitle: "Gym, biçikleta, outdoor",
    children: [
      { label: "Fitness & Gym", tag: "Fitness & Gym" },
      { label: "Biçikleta & Trotinet", tag: "Biçikleta & Trotinet" },
      { label: "Kampirim & Outdoor", tag: "Kampirim & Outdoor" },
      { label: "Ekipim Sportiv", tag: "Ekipim Sportiv" },
    ],
  },
  {
    label: "Veshje & Aksesore",
    slug: "veshje-aksesore",
    color: "#F5F0E0",
    promoTitle: "Stil që flet",
    promoSubtitle: "Veshje, çanta, orë, bizhuteri",
    children: [
      { label: "Veshje", tag: "Veshje" },
      { label: "Veshje Fëmijësh", tag: "Veshje Fëmijësh" },
      { label: "Këpucë", tag: "Këpucë" },
      { label: "Çanta & Valixhe", tag: "Çanta & Valixhe" },
      { label: "Orë & Bizhuteri", tag: "Orë & Bizhuteri" },
      { label: "Bizhuteri & Aksesore", tag: "Bizhuteri & Aksesore" },
      { label: "Dorëza & Shalle", tag: "Dorëza & Shalle" },
    ],
  },
];

// Promo row shown at bottom of desktop nav
export const PROMO_LINK = { label: "Last Chance — deri 50%", href: "/koleksion/oferta" };
export const ALL_PRODUCTS_LINK = { label: "Shiko të gjitha", href: "/koleksion/te-gjitha" };

export function buildCategoryHref(category: NavCategory): string {
  return `/koleksion/${category.slug}`;
}

export function buildSubcategoryHref(category: NavCategory, child: NavChild): string {
  if (child.href) return child.href;
  if (!child.tag) return buildCategoryHref(category);
  return `/koleksion/${category.slug}?tag=${encodeURIComponent(child.tag)}`;
}
