import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Email i pavlefshëm" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db.subscriber.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    if (!existing.isActive) {
      await db.subscriber.update({
        where: { id: existing.id },
        data: { isActive: true },
      });
    }
    return NextResponse.json({ ok: true, message: "Jeni regjistruar me sukses!" });
  }

  await db.subscriber.create({
    data: { email: normalizedEmail },
  });

  return NextResponse.json({ ok: true, message: "Jeni regjistruar me sukses!" });
}
