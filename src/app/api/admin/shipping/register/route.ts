import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { orderId } = await req.json();

  const settings = await db.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings?.iziPostApiKey) {
    return NextResponse.json(
      { error: "API key e Izi Post nuk është konfiguruar" },
      { status: 400 }
    );
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Porosia nuk u gjet" }, { status: 404 });
  }

  // TODO: Actual Izi Post API call
  // const response = await fetch(`${settings.iziPostApiUrl}/shipments`, {
  //   method: "POST",
  //   headers: {
  //     "Authorization": `Bearer ${settings.iziPostApiKey}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     recipient_name: order.customerName,
  //     recipient_phone: order.customerPhone,
  //     recipient_city: order.city,
  //     recipient_address: order.address,
  //     cod_amount: Number(order.total),
  //     items: order.items.map(i => ({
  //       name: i.product.title,
  //       quantity: i.quantity,
  //     })),
  //   }),
  // });

  // For now, update order status to delivering
  await db.order.update({
    where: { id: orderId },
    data: { status: "delivering" },
  });

  return NextResponse.json({ ok: true, message: "Porosia u regjistrua për dërgesë" });
}
