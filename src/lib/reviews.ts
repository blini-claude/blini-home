function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const ALBANIAN_NAMES = [
  "Arta M.", "Besnik K.", "Driton H.", "Elira S.", "Fatos B.",
  "Genta R.", "Hana P.", "Ilir D.", "Jehona L.", "Kaltrina V.",
  "Liridon A.", "Mimoza G.", "Nora T.", "Osman F.", "Pranvera K.",
  "Qendrim M.", "Rinesa B.", "Shpresa D.", "Teuta H.", "Ukshin R.",
  "Vlora S.", "Xhevat L.", "Yllka N.", "Zamira P.", "Agron T.",
  "Blerta V.", "Dardan K.", "Engjëll M.", "Fjolla A.", "Granit B.",
  "Hyrie S.", "Isa G.", "Jeta R.", "Kushtrim D.", "Liridona F.",
  "Mentor H.", "Natyra L.", "Orhan P.", "Petrit K.", "Qëndresa V.",
  "Rezarta M.", "Shkëlzen A.", "Trim B.", "Urata G.", "Valon S.",
  "Xhemile T.", "Yll R.", "Zana D.", "Adelina K.", "Bekim L.",
];

const REVIEW_TEMPLATES: Record<string, string[]> = {
  default: [
    "Produkti është tamam si në foto, jam shumë i/e kënaqur!",
    "Cilësi shumë e mirë për këtë çmim. E rekomandoj!",
    "Arriu brenda 2 ditëve, i paketuar mirë. Faleminderit!",
    "E bleva për dhuratë dhe i pëlqeu shumë. Do ta blej përsëri.",
    "Shumë i/e kënaqur me porosinë. Cilësi e shkëlqyer!",
    "Çmimi i arsyeshëm, produkti i mirë. Ja vlen!",
    "E porosita për herë të dytë, gjithmonë cilësi e njëjtë.",
    "Shërbimi i shkëlqyer, produkti arriu shpejt dhe në gjendje perfekte.",
    "Më pëlqen shumë! E rekomandoj pa asnjë dyshim.",
    "Shumë praktik dhe cilësor. Do ta porosisja përsëri.",
  ],
  "Shtëpi": [
    "E vendosa në kuzhinë dhe duket fantastike!",
    "Cilësi shumë e mirë, e rekomandoj për çdo shtëpi!",
    "Arriu shpejt dhe është tamam si në foto. E bukur!",
    "E bleva për dhomën e ndenjjes, shumë e kënaqur!",
    "Material i fortë dhe i qëndrueshëm. Ia vlen çmimi.",
  ],
  "Teknologji": [
    "Funksionon perfekt, çmimi i arsyeshëm!",
    "E përdor çdo ditë, jam shumë i kënaqur!",
    "Cilësi e mirë për këtë çmim. Funksionon pa probleme.",
    "Shumë praktik, e rekomandoj!",
    "Arriu shpejt, funksionon ashtu si përshkruhet.",
  ],
  "Fëmijë": [
    "Fëmijës i pëlqeu shumë! Cilësi e mirë.",
    "E sigurt dhe e qëndrueshme, tamam për fëmijë.",
    "Dhurata perfekte për ditëlindjen e fëmijës!",
    "Shumë e bukur, fëmija luan çdo ditë me të.",
    "Material i sigurt, jam e kënaqur si prind.",
  ],
  "Bukuri": [
    "Produkt i shkëlqyer, lëkura ime duket shumë mirë!",
    "E përdor çdo ditë, rezultate të mrekullueshme!",
    "Aromatë e bukur dhe cilësi e lartë.",
    "Shumë e kënaqur, do ta blej përsëri!",
    "Çmim i arsyeshëm për cilësinë që ofron.",
  ],
};

export interface ProductRating {
  rating: number;
  count: number;
}

export interface ProductReview {
  id: string;
  name: string;
  rating: number;
  date: string;
  text: string;
}

export function getProductRating(productId: string, price: number): ProductRating {
  const hash = simpleHash(productId);
  // Rating: 4.0 - 4.9
  const rating = 4.0 + (hash % 10) / 10;
  // Count based on price tier
  const countBase = price < 10 ? 40 : price < 50 ? 20 : 10;
  const countRange = price < 10 ? 140 : price < 50 ? 100 : 70;
  const count = countBase + (hash % countRange);
  return {
    rating: Math.round(rating * 10) / 10,
    count,
  };
}

export function getProductReviews(
  productId: string,
  category: string,
  count: number = 4
): ProductReview[] {
  const hash = simpleHash(productId);
  const templates = REVIEW_TEMPLATES[category] || REVIEW_TEMPLATES.default;
  const reviews: ProductReview[] = [];

  for (let i = 0; i < count; i++) {
    const itemHash = simpleHash(productId + String(i));
    const nameIndex = itemHash % ALBANIAN_NAMES.length;
    const textIndex = itemHash % templates.length;
    const rating = 4 + (itemHash % 2); // 4 or 5 stars
    const daysAgo = 1 + (itemHash % 90);
    const date = new Date(Date.now() - daysAgo * 86400000);

    reviews.push({
      id: `${productId}-review-${i}`,
      name: ALBANIAN_NAMES[nameIndex],
      rating,
      date: date.toLocaleDateString("sq-AL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      text: templates[textIndex],
    });
  }

  return reviews;
}
