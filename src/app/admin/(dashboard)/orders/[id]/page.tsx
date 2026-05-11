import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusChanger } from "@/components/admin/order-status-changer";

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, title: true, slug: true, thumbnail: true, sourceStore: true },
          },
        },
      },
      customer: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Also count prior orders from this phone so the operator can see returning vs new.
  const priorOrderCount = await db.order.count({
    where: {
      customerPhone: order.customerPhone,
      id: { not: order.id },
    },
  });

  const subtotal = Number(order.subtotal);
  const deliveryFee = Number(order.deliveryFee);
  const total = Number(order.total);
  const itemsCount = order.items.reduce((sum, it) => sum + it.quantity, 0);

  const phoneDigits = order.customerPhone.replace(/\D/g, "");
  const waLink = `https://wa.me/${phoneDigits}`;
  const telLink = `tel:${order.customerPhone}`;

  const backHref = from ? `/admin/orders?page=${encodeURIComponent(from)}` : "/admin/orders";

  const placedAt = new Date(order.createdAt);
  const updatedAt = new Date(order.updatedAt);

  return (
    <>
      <AdminHeader title={`Porosia #${order.orderNumber}`} subtitle={placedAt.toLocaleString("sq-AL")} />
      <div className="p-6 md:p-8 space-y-5">
        {/* Back + status */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link
            href={backHref}
            className="flex items-center gap-2 text-[12px] font-bold text-[rgba(18,18,18,0.5)] hover:text-[#062F35] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Kthehu te porositë
          </Link>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left — items + summary */}
          <div className="lg:col-span-2 space-y-5">
            {/* Items */}
            <section className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
              <div className="px-5 py-3 border-b border-[#F0F0F0] flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
                  Artikujt ({itemsCount})
                </h3>
              </div>
              <ul>
                {order.items.map((it) => {
                  const lineTotal = Number(it.price) * it.quantity;
                  return (
                    <li
                      key={it.id}
                      className="flex items-center gap-4 px-5 py-3 border-b border-[#F8F8F8] last:border-b-0"
                    >
                      <Link
                        href={`/admin/products/${it.product.id}/edit`}
                        className="w-[52px] h-[52px] bg-[#F5F5F5] rounded-[8px] overflow-hidden relative flex-shrink-0"
                      >
                        {it.product.thumbnail ? (
                          <Image src={it.product.thumbnail} alt="" fill sizes="52px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[rgba(18,18,18,0.2)] text-[10px]">
                            —
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/admin/products/${it.product.id}/edit`}
                          className="block text-[13px] font-semibold text-[#062F35] hover:text-[#FFC334] truncate"
                        >
                          {it.product.title}
                        </Link>
                        <p className="text-[11px] text-[rgba(18,18,18,0.4)] capitalize mt-0.5">
                          {it.product.sourceStore} · {it.quantity} × €{Number(it.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-[14px] font-bold text-[#062F35] flex-shrink-0">
                        €{lineTotal.toFixed(2)}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Totals */}
              <div className="px-5 py-4 bg-[#FAFBFC] border-t border-[#F0F0F0] space-y-1.5">
                <div className="flex justify-between text-[12px] text-[rgba(18,18,18,0.6)]">
                  <span>Nën-total</span>
                  <span className="font-semibold">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[12px] text-[rgba(18,18,18,0.6)]">
                  <span>Transporti</span>
                  <span className="font-semibold">€{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[14px] font-bold text-[#062F35] pt-1.5 border-t border-[#E8E8E8] mt-1.5">
                  <span>Totali</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[rgba(18,18,18,0.5)] pt-1.5">
                  <span>Metoda e pagesës</span>
                  <span className="font-bold uppercase">{order.paymentMethod}</span>
                </div>
              </div>
            </section>

            {/* Notes */}
            {order.notes && (
              <section className="bg-[#FFF8E1] border border-[#FFE082] rounded-[12px] p-5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#B8860B] mb-2">
                  Shënime nga klienti
                </h3>
                <p className="text-[13px] text-[#062F35] whitespace-pre-wrap leading-relaxed">{order.notes}</p>
              </section>
            )}
          </div>

          {/* Right — status + customer */}
          <div className="space-y-5">
            {/* Status changer */}
            <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
                Statusi
              </h3>
              <OrderStatusChanger orderId={order.id} currentStatus={order.status} />
              <p className="text-[10px] text-[rgba(18,18,18,0.4)] pt-2 border-t border-[#F0F0F0]">
                Përditësuar: {updatedAt.toLocaleString("sq-AL")}
              </p>
            </section>

            {/* Customer */}
            <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
                  Klienti
                </h3>
                {priorOrderCount > 0 ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#F0F7F8] text-[#062F35]">
                    Klient i kthyer (+{priorOrderCount})
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#FFF8E1] text-[#B8860B]">
                    I ri
                  </span>
                )}
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#062F35]">{order.customerName}</p>
                {order.customer && (
                  <Link
                    href={`/admin/customers/${order.customer.id}`}
                    className="text-[11px] text-[rgba(18,18,18,0.5)] hover:text-[#062F35] underline"
                  >
                    Shiko profilin →
                  </Link>
                )}
              </div>
              <div className="space-y-1.5">
                <a href={telLink} className="block text-[12px] font-semibold text-[#062F35] hover:text-[#FFC334]">
                  📞 {order.customerPhone}
                </a>
                {order.customerEmail && (
                  <a
                    href={`mailto:${order.customerEmail}`}
                    className="block text-[12px] text-[rgba(18,18,18,0.6)] hover:text-[#062F35] truncate"
                  >
                    ✉ {order.customerEmail}
                  </a>
                )}
              </div>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-[#25D366] text-white text-[12px] font-bold py-2.5 rounded-[8px] hover:bg-[#1FAE54] transition-colors"
              >
                Shkruaj në WhatsApp
              </a>
            </section>

            {/* Address */}
            <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
                Adresa
              </h3>
              <p className="text-[13px] text-[#062F35] font-semibold">{order.city}</p>
              <p className="text-[12px] text-[rgba(18,18,18,0.6)] whitespace-pre-wrap">{order.address}</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
