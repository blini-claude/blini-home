import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-()]/g, "");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 30;
  const offset = (page - 1) * limit;
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.phone = { contains: search };
  }

  const [entries, total] = await Promise.all([
    db.blacklist.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    db.blacklist.count({ where }),
  ]);

  return NextResponse.json({ entries, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { phone, reason, notes } = body as { phone: string; reason?: string; notes?: string };

  if (!phone?.trim()) {
    return NextResponse.json({ error: "Telefoni është i detyrueshëm" }, { status: 400 });
  }

  const normalizedPhone = normalizePhone(phone);

  const existing = await db.blacklist.findUnique({ where: { phone: normalizedPhone } });
  if (existing) {
    return NextResponse.json({ error: "Ky numër është tashmë në listë të zezë" }, { status: 409 });
  }

  const entry = await db.blacklist.create({
    data: {
      phone: normalizedPhone,
      reason: reason?.trim() || null,
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
