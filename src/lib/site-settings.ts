import { db } from "./db";
import { Prisma } from "@prisma/client";

const DEFAULT_SETTINGS = {
  id: "main",
  heroSlides: [] as unknown,
  announcementText: "Dërgim falas për porosi mbi €30",
  welcomeMessage: "Mirësevini në BLINI HOME!",
  whatsappNumber: "+38344000000",
  whatsappEnabled: true,
  iziPostApiKey: null,
  iziPostApiUrl: "https://api.izis-post.com",
  footerText: "Produkte cilësore për shtëpinë",
  freeShippingThreshold: new Prisma.Decimal(30),
  maxOrdersPerPhonePerDay: 3,
  newsletterPopupEnabled: true,
  newsletterDiscountPct: 5,
  updatedAt: new Date(),
};

export async function getSiteSettings() {
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: "main" } });
    if (settings) return settings;
    try {
      return await db.siteSettings.create({ data: { id: "main" } });
    } catch {
      const retry = await db.siteSettings.findUnique({ where: { id: "main" } });
      if (retry) return retry;
    }
  } catch {
    // DB not reachable during build — return defaults
  }
  return DEFAULT_SETTINGS;
}
