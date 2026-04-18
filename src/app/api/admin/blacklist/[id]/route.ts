import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.blacklist.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { reason, notes } = body as { reason?: string; notes?: string };

  const entry = await db.blacklist.update({
    where: { id },
    data: {
      reason: reason?.trim() || null,
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json({ entry });
}
