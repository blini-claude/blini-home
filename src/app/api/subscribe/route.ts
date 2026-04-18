import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-settings";

function generateCode(prefix: string) {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}${random}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body.email;
  const source = body.source as string | undefined;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Email i pavlefshëm" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db.subscriber.findUnique({
    where: { email: normalizedEmail },
  });

  if (!existing) {
    await db.subscriber.create({ data: { email: normalizedEmail } });
  } else if (!existing.isActive) {
    await db.subscriber.update({
      where: { id: existing.id },
      data: { isActive: true },
    });
  }

  if (source === "popup") {
    const settings = await getSiteSettings();
    const existingDiscount = await db.newsletterDiscount.findFirst({
      where: { email: normalizedEmail, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    const code = existingDiscount?.code ?? generateCode("MIRESE");
    if (!existingDiscount) {
      await db.newsletterDiscount.create({
        data: {
          code,
          email: normalizedEmail,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return NextResponse.json({
      ok: true,
      message: `Zbritje ${settings.newsletterDiscountPct}% aktivizuar!`,
      discountCode: code,
      discountPct: settings.newsletterDiscountPct,
    });
  }

  return NextResponse.json({ ok: true, message: "Jeni regjistruar me sukses!" });
}
