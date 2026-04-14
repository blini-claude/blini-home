// Maps source store categories to BLINI-HOME categories
const CATEGORY_MAP: Record<string, string> = {
  // Shporta categories
  "shtepiake": "Shtëpi",
  "shelves & wardrobes": "Shtëpi",
  "sanitari": "Shtëpi",
  "tables & furniture": "Shtëpi",
  "organizers": "Shtëpi",
  "kitchen": "Kuzhinë",
  "cleaning": "Shtëpi",
  "kujdesi personal": "Bukuri",
  "elektroshtepiake": "Shtëpi",
  "teknologji": "Teknologji",
  "vegla pune": "Shtëpi",
  "elektronike": "Teknologji",
  "automobile": "Teknologji",
  "lodra & femije": "Fëmijë",
  "video baby monitor": "Fëmijë",
  "fitnes": "Sporte",
  "aksesore": "Aksesore",

  // Tregu categories
  "femije/bebe": "Fëmijë",
  "shendet/bukuri": "Bukuri",
  "sporte/aktivitete": "Sporte",
  "veshmbathje": "Veshje",
  "ushqime/pije": "Ushqime",
  "shtepi/oborr": "Shtëpi",

  // Benny categories
  "personal care": "Bukuri",
  "grooming": "Bukuri",
  "phone accessories": "Teknologji",
  "gaming": "Teknologji",
  "security cameras": "Teknologji",
  "drones": "Teknologji",
  "audio": "Teknologji",
  "electric scooters": "Teknologji",
  "household": "Shtëpi",
  "tablets": "Teknologji",
  "phones": "Teknologji",
  "smartwatches": "Teknologji",
  "baby monitors": "Fëmijë",
  "cameras": "Teknologji",
  "tv boxes": "Teknologji",
  "projectors": "Teknologji",
};

const BLINI_CATEGORIES = [
  "Shtëpi", "Kuzhinë", "Teknologji", "Fëmijë",
  "Bukuri", "Sporte", "Veshje", "Aksesore", "Ushqime", "Të përgjithshme",
];

export function mapCategory(sourceCategory: string): string {
  const normalized = sourceCategory.toLowerCase().trim();

  if (!normalized) return "Të përgjithshme";

  // Direct match
  if (CATEGORY_MAP[normalized]) {
    return CATEGORY_MAP[normalized];
  }

  // Partial match
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  // Check if it's already a BLINI category
  for (const cat of BLINI_CATEGORIES) {
    if (normalized.includes(cat.toLowerCase())) {
      return cat;
    }
  }

  return "Të përgjithshme";
}

export function getCollectionSlugs(product: {
  price: number;
  category: string;
  isFeatured?: boolean;
}): string[] {
  const slugs: string[] = [];

  // Price-based collections
  if (product.price <= 10) slugs.push("nen-10");

  // Category-based collections
  const catMap: Record<string, string> = {
    "Shtëpi": "shtepi-kuzhine",
    "Kuzhinë": "shtepi-kuzhine",
    "Teknologji": "teknologji",
    "Fëmijë": "femije-lodra",
    "Bukuri": "bukuri-kujdes",
    "Sporte": "sporte-aktivitete",
    "Veshje": "veshje-aksesore",
    "Aksesore": "veshje-aksesore",
  };

  if (catMap[product.category]) {
    slugs.push(catMap[product.category]);
  }

  return slugs;
}
