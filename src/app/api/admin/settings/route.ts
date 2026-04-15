import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const settings = await db.siteSettings.upsert({
    where: { id: "main" },
    create: { id: "main" },
    update: {},
  });
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.heroSlides !== undefined) data.heroSlides = body.heroSlides;
  if (body.announcementText !== undefined) data.announcementText = body.announcementText;
  if (body.welcomeMessage !== undefined) data.welcomeMessage = body.welcomeMessage;
  if (body.whatsappNumber !== undefined) data.whatsappNumber = body.whatsappNumber;
  if (body.whatsappEnabled !== undefined) data.whatsappEnabled = body.whatsappEnabled;
  if (body.iziPostApiKey !== undefined) data.iziPostApiKey = body.iziPostApiKey;
  if (body.iziPostApiUrl !== undefined) data.iziPostApiUrl = body.iziPostApiUrl;
  if (body.footerText !== undefined) data.footerText = body.footerText;

  const settings = await db.siteSettings.upsert({
    where: { id: "main" },
    create: { id: "main", ...data },
    update: data,
  });

  return NextResponse.json(settings);
}
