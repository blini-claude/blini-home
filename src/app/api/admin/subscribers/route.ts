import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 30;
  const offset = (page - 1) * limit;
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.email = { contains: search, mode: "insensitive" };
  }

  const [subscribers, total] = await Promise.all([
    db.subscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    db.subscriber.count({ where }),
  ]);

  return NextResponse.json({ subscribers, total, page, totalPages: Math.ceil(total / limit) });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.subscriber.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
