/**
 * Meta Pixel event helper.
 *
 * `content_ids` MUST be Prisma product ids — the same value /api/meta-feed puts
 * in <g:id>. That match is the whole mechanism behind product cards in ads: a
 * sales campaign can only show the item someone looked at if the pixel event
 * named an id the catalog knows.
 */

type Fbq = (...args: unknown[]) => void;

export type PixelItem = { id: string; quantity: number; price: number };

function fbq(): Fbq | null {
  if (typeof window === "undefined") return null;
  const f = (window as unknown as { fbq?: Fbq }).fbq;
  return typeof f === "function" ? f : null;
}

export function metaTrack(event: string, params?: Record<string, unknown>) {
  fbq()?.("track", event, params);
}

export function metaViewContent(item: PixelItem & { title: string; category?: string }) {
  metaTrack("ViewContent", {
    content_ids: [item.id],
    content_type: "product",
    content_name: item.title,
    content_category: item.category,
    value: item.price,
    currency: "EUR",
  });
}

export function metaAddToCart(item: PixelItem & { title: string }) {
  metaTrack("AddToCart", {
    content_ids: [item.id],
    content_type: "product",
    content_name: item.title,
    value: item.price * item.quantity,
    currency: "EUR",
  });
}

export function metaInitiateCheckout(items: PixelItem[], value: number) {
  metaTrack("InitiateCheckout", {
    content_ids: items.map((i) => i.id),
    contents: items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
    content_type: "product",
    num_items: items.reduce((n, i) => n + i.quantity, 0),
    value,
    currency: "EUR",
  });
}

export function metaPurchase(orderNumber: string, items: PixelItem[], value: number) {
  metaTrack("Purchase", {
    content_ids: items.map((i) => i.id),
    contents: items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
    content_type: "product",
    num_items: items.reduce((n, i) => n + i.quantity, 0),
    value,
    currency: "EUR",
    order_id: orderNumber,
  });
}
