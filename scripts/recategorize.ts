/**
 * Re-categorize products based on title keywords.
 * Fixes the 91% "Të përgjithshme" problem by scanning product titles.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

// Keywords → category mapping (Albanian + English, case-insensitive)
const KEYWORD_RULES: { keywords: string[]; category: string }[] = [
  // Teknologji
  {
    keywords: [
      "smart watch", "smartwatch", "telefon", "phone", "tablet", "laptop",
      "kamer", "camera", "drone", "speaker", "bluetooth", "wireless", "wifi",
      "usb", "charger", "karikues", "power bank", "bateri", "battery",
      "led tv", "tv box", "projector", "projektor", "gaming", "ps5", "ps4",
      "xbox", "nintendo", "joystick", "controller", "tastier", "keyboard",
      "mouse", "monitor", "printer", "scanner", "router", "modem",
      "adapter", "converter", "hdmi", "cable", "kabell", "earphone",
      "headphone", "kufje", "mikrofon", "microphone", "gopro", "tripod",
      "gimbal", "ring light", "otg", "gpu", "cpu", "ram", "ssd", "hdd",
      "scooter elektrik", "hoverboard", "segway", "electric scooter",
      "dashcam", "gps", "walkie", "radio", "antenna", "solar panel",
      "inverter", "zmadhues", "karaoke", "ndr-", "redragon",
    ],
    category: "Teknologji",
  },
  // Fëmijë
  {
    keywords: [
      "fëmij", "femij", "bebe", "bebë", "lodër", "lodra", "loder",
      "baby", "stroller", "karrocë", "karroc", "dubak", "shtrat fëmij",
      "biberon", "pelena", "diaper", "pacifier", "gize", "neonate",
      "shezlong", "karrige fëmij", "karrige femij", "ushqim.*bebe",
      "tavolinë ushqimi", "baby monitor",
    ],
    category: "Fëmijë",
  },
  // Shtëpi
  {
    keywords: [
      "shtëpi", "shtepi", "kuzhin", "tenxhere", "tigan", "thik",
      "lugë", "pirun", "pjat", "gotë", "filxhan", "çajnik",
      "tost", "mikser", "blender", "furrë", "furre", "aspirator",
      "hekur", "pastrim", "detergjent", "sapun", "mopp", "fshes",
      "jastëk", "jastek", "dyshek", "çarçaf", "peshqir",
      "perde", "rafë", "raft", "dollap", "tavolinë", "karrige",
      "dritë", "drite", "llambë", "llamb", "led.*lamp",
      "vazo", "lule", "oborr", "kopsht", "bast", "gate",
      "shirit ngjit", "tape", "ngjitës", "shkallë", "shkall",
      "çelës", "celes", "kaçavid", "kacavid", "trapan",
      "sharrë", "sharre", "gërsherë", "gershere", "kapëse", "kapese",
      "pincë", "spirale", "vegla", "vegël", "mjete",
      "çekiç", "cekic", "nivel", "metër", "meter",
      "komplet veglash", "set.*copë", "torx", "allen",
      "prizë", "prize", "çelës.*kombini", "unazor",
      "hidrofor", "pompe", "valvul", "tub", "rubinet",
      "sanitari", "wc", "lavaman", "dush", "bateria",
      "klithmë", "klithme", "alarm", "bravë", "brave",
      "dry", "kuti", "organizues", "mbajtës", "mbajtes",
      "rivetim", "shkrepse", "hekurosje",
    ],
    category: "Shtëpi",
  },
  // Bukuri
  {
    keywords: [
      "bukuri", "krem", "parfum", "shampo", "balzam",
      "make.?up", "makeup", "ruj", "maskara", "fondatinë",
      "tharese", "dredhues", "flok", "hair", "depilim",
      "manikyr", "thonj", "nail", "skincare", "serum",
      "locion", "kujdes.*lëkur", "kujdes.*fytyr", "brush.*makeup",
      "epilator", "trimmer", "grooming", "beauty", "personal care",
      "sheglam", "iparah",
    ],
    category: "Bukuri",
  },
  // Sporte
  {
    keywords: [
      "sport", "fitnes", "fitness", "gym", "palestr",
      "biçiklet", "biciklet", "bicycle", "trotinet",
      "top.*futbol", "top.*basket", "top.*volejbol",
      "reketa", "tenis", "ping.?pong", "not", "pishin",
      "kamp", "tent", "çantë.*shpin", "hiking",
      "yoga", "pilates", "dumbbell", "pesha",
      "masazh", "ultragun", "pistoleta masazh",
    ],
    category: "Sporte",
  },
  // Veshje
  {
    keywords: [
      "veshje", "këpuc", "kepuc", "çizm", "cizm",
      "pantallona", "xhinse", "bluze", "jakne", "jakë",
      "pallto", "fustane", "fund", "shirt", "t-shirt",
      "këmish", "kemish", "çorap", "corap",
      "sigurie.*würth", "sigurie.*wurth", "këpucë sigurie",
    ],
    category: "Veshje",
  },
  // Aksesore
  {
    keywords: [
      "aksesore", "orë", "ore", "syze", "çantë", "cante",
      "rrup", "kravat", "shall", "kapele", "kapelë",
      "unazë", "byzylyk", "vath", "gjerdan", "stolis",
      "mbajtes.*telefon", "mbajtës.*celular", "magnetik",
    ],
    category: "Aksesore",
  },
];

function categorizeByTitle(title: string): string | null {
  const lower = title.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    for (const keyword of rule.keywords) {
      try {
        if (keyword.includes(".*") || keyword.includes(".?") || keyword.includes("[")) {
          if (new RegExp(keyword, "i").test(lower)) return rule.category;
        } else {
          if (lower.includes(keyword)) return rule.category;
        }
      } catch {
        if (lower.includes(keyword)) return rule.category;
      }
    }
  }
  return null;
}

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  const products = await db.product.findMany({
    where: { category: "Të përgjithshme" },
    select: { id: true, title: true, category: true },
  });

  console.log(`Found ${products.length} uncategorized products`);

  const counts: Record<string, number> = {};
  let updated = 0;

  for (const product of products) {
    const newCategory = categorizeByTitle(product.title);
    if (newCategory) {
      await db.product.update({
        where: { id: product.id },
        data: { category: newCategory },
      });
      counts[newCategory] = (counts[newCategory] || 0) + 1;
      updated++;
    }
  }

  console.log(`\nRecategorized ${updated}/${products.length} products:`);
  for (const [cat, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log(`  Still uncategorized: ${products.length - updated}`);

  // Now fix collection assignments for recategorized products
  console.log("\nUpdating collection assignments...");
  const collections = await db.collection.findMany();
  const collectionMap = new Map(collections.map((c) => [c.slug, c.id]));

  const CATEGORY_TO_COLLECTION: Record<string, string[]> = {
    "Shtëpi": ["shtepi-kuzhine"],
    "Kuzhinë": ["shtepi-kuzhine"],
    "Teknologji": ["teknologji"],
    "Fëmijë": ["femije-lodra"],
    "Bukuri": ["bukuri-kujdes"],
    "Sporte": ["sporte-aktivitete"],
    "Veshje": ["veshje-aksesore"],
    "Aksesore": ["veshje-aksesore"],
  };

  let assigned = 0;
  const recategorized = await db.product.findMany({
    where: { category: { not: "Të përgjithshme" }, isActive: true },
    select: { id: true, category: true, price: true },
  });

  for (const product of recategorized) {
    const slugs = CATEGORY_TO_COLLECTION[product.category] || [];
    if (Number(product.price) <= 10) slugs.push("nen-10");

    for (const slug of slugs) {
      const collectionId = collectionMap.get(slug);
      if (!collectionId) continue;
      try {
        await db.productCollection.create({
          data: { productId: product.id, collectionId },
        });
        assigned++;
      } catch {
        // Already assigned
      }
    }
  }

  console.log(`Created ${assigned} new collection assignments`);

  // Print final counts
  for (const col of collections) {
    const count = await db.productCollection.count({ where: { collectionId: col.id } });
    console.log(`  ${col.slug}: ${count} products`);
  }

  await db.$disconnect();
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
