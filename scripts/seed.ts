import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import crypto from "crypto";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://blini_home:BliniHome2026!@192.168.100.110:5432/blini_home",
});
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  await db.adminUser.upsert({
    where: { email: "admin@blinihome.com" },
    update: {},
    create: {
      email: "admin@blinihome.com",
      passwordHash: hashPassword("BliniHomeAdmin2026!"),
    },
  });
  console.log("Created admin user");

  // Create collections
  const collections = [
    { title: "Të rejat", slug: "te-rejat", description: "Produkte të reja", sortOrder: 1 },
    { title: "Më të shitura", slug: "me-te-shitura", description: "Produktet më të shitura", sortOrder: 2 },
    { title: "Nën €10", slug: "nen-10", description: "Gjithçka nën 10 euro", sortOrder: 3 },
    { title: "Ide për Dhurata", slug: "ide-per-dhurata", description: "Dhurata për çdo rast", sortOrder: 4 },
    { title: "Shtëpi & Kuzhinë", slug: "shtepi-kuzhine", description: "Produkte për shtëpinë dhe kuzhinën", sortOrder: 5 },
    { title: "Teknologji", slug: "teknologji", description: "Pajisje teknologjike", sortOrder: 6 },
    { title: "Fëmijë & Lodra", slug: "femije-lodra", description: "Për fëmijët tuaj", sortOrder: 7 },
    { title: "Bukuri & Kujdes", slug: "bukuri-kujdes", description: "Kujdes personal", sortOrder: 8 },
    { title: "Sporte & Aktivitete", slug: "sporte-aktivitete", description: "Pajisje sportive", sortOrder: 9 },
    { title: "Veshje & Aksesore", slug: "veshje-aksesore", description: "Modë dhe aksesore", sortOrder: 10 },
  ];

  for (const col of collections) {
    await db.collection.upsert({
      where: { slug: col.slug },
      update: {},
      create: col,
    });
  }
  console.log(`Created ${collections.length} collections`);

  // Create sample products
  const sampleProducts = [
    {
      sourceStore: "shporta",
      sourceId: "sample-1",
      sourceUrl: "https://shporta.shop/sample-1",
      title: "Llampë LED Desktop",
      slug: "llampe-led-desktop",
      description: "Llampë LED me ngjyra të ndryshme për tavolinën tuaj",
      price: 14.99,
      category: "Shtëpi",
      stock: 25,
      isFeatured: true,
    },
    {
      sourceStore: "tregu",
      sourceId: "sample-2",
      sourceUrl: "https://tregu.shop/sample-2",
      title: "Organizator Kuzhinë Bambu",
      slug: "organizator-kuzhine-bambu",
      description: "Organizator elegant prej druri bambu për kuzhinën",
      price: 8.99,
      compareAtPrice: 12.99,
      category: "Kuzhinë",
      stock: 40,
      isFeatured: true,
    },
    {
      sourceStore: "benny",
      sourceId: "sample-3",
      sourceUrl: "https://bennygroup.store/sample-3",
      title: "Kufje Bluetooth TWS Pro",
      slug: "kufje-bluetooth-tws-pro",
      description: "Kufje wireless me cilësi të lartë të zërit",
      price: 24.99,
      category: "Teknologji",
      stock: 15,
      isFeatured: true,
    },
    {
      sourceStore: "shporta",
      sourceId: "sample-4",
      sourceUrl: "https://shporta.shop/sample-4",
      title: "Tharëse Flokësh Profesionale",
      slug: "tharese-flokesh-profesionale",
      description: "Tharëse flokësh 2200W me ajër të ftohtë dhe nxehtë",
      price: 29.99,
      category: "Bukuri",
      stock: 20,
    },
    {
      sourceStore: "tregu",
      sourceId: "sample-5",
      sourceUrl: "https://tregu.shop/sample-5",
      title: "Kamerë Sigurie WiFi HD",
      slug: "kamere-sigurie-wifi-hd",
      description: "Kamerë sigurie me WiFi dhe pamje natës",
      price: 39.99,
      category: "Teknologji",
      stock: 10,
    },
  ];

  for (const product of sampleProducts) {
    await db.product.upsert({
      where: {
        sourceStore_sourceId: {
          sourceStore: product.sourceStore,
          sourceId: product.sourceId,
        },
      },
      update: {},
      create: {
        ...product,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? null,
        images: [],
        thumbnail: null,
      },
    });
  }
  console.log(`Created ${sampleProducts.length} sample products`);

  console.log("Seed complete!");
  await db.$disconnect();
  await pool.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
