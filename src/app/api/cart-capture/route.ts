import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public endpoint — called from the checkout form when a phone is typed
// but before the order is placed. Captures the cart state so the admin
// can follow up if the user bounces.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || !body.phone || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const phone = String(body.phone).trim();
  // Normalize like the order endpoint does — strip non-digits except leading +.
  const normalized = phone.startsWith("+")
    ? "+" + phone.slice(1).replace(/\D/g, "")
    : phone.replace(/\D/g, "");

  if (normalized.replace(/\D/g, "").length < 7) {
    // Not enough of a phone yet — silently ignore.
    return NextResponse.json({ skipped: true });
  }

  const items = body.items
    .filter(
      (i: unknown) =>
        typeof i === "object" &&
        i !== null &&
        typeof (i as { productId?: unknown }).productId === "string" &&
        typeof (i as { quantity?: unknown }).quantity === "number"
    )
    .map((i: { productId: string; quantity: number; price?: number; title?: string; thumbnail?: string | null }) => ({
      productId: i.productId,
      quantity: i.quantity,
      price: i.price ?? 0,
      title: i.title ?? "",
      thumbnail: i.thumbnail ?? null,
    }));

  if (items.length === 0) {
    return NextResponse.json({ error: "No valid items" }, { status: 400 });
  }

  const subtotal = items.reduce(
    (sum: number, i: { quantity: number; price: number }) => sum + i.quantity * i.price,
    0
  );

  // Update-or-create: if there's a non-recovered cart for this phone from the
  // last 6 hours, refresh it; otherwise create a new one. Prevents spam from
  // every keystroke creating a new row.
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const existing = await db.abandonedCart.findFirst({
    where: {
      phone: normalized,
      recovered: false,
      createdAt: { gte: sixHoursAgo },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    await db.abandonedCart.update({
      where: { id: existing.id },
      data: {
        customerName: body.customerName?.trim() || existing.customerName,
        customerEmail: body.customerEmail?.trim() || existing.customerEmail,
        city: body.city?.trim() || existing.city,
        items,
        subtotal,
      },
    });
    return NextResponse.json({ id: existing.id, updated: true });
  }

  const created = await db.abandonedCart.create({
    data: {
      phone: normalized,
      customerName: body.customerName?.trim() || null,
      customerEmail: body.customerEmail?.trim() || null,
      city: body.city?.trim() || null,
      items,
      subtotal,
    },
  });

  return NextResponse.json({ id: created.id, updated: false });
}
