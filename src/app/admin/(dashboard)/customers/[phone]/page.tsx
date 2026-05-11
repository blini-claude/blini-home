import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  const { phone: rawPhone } = await params;
  const phone = decodeURIComponent(rawPhone);

  const orders = await db.order.findMany({
    where: { customerPhone: phone },
    include: {
      items: {
        include: {
          product: { select: { id: true, title: true, thumbnail: true, sourceStore: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    notFound();
  }

  // Aggregate stats
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalItems = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const avgOrder = totalSpent / orders.length;
  const lastOrder = orders[0];
  const firstOrder = orders[orders.length - 1];

  const blacklistEntry = await db.blacklist
    .findFirst({ where: { phone } })
    .catch(() => null);

  const phoneDigits = phone.replace(/\D/g, "");
  const waLink = `https://wa.me/${phoneDigits}`;

  // Top products this customer has ordered (by quantity)
  const productCount = new Map<string, { id: string; title: string; thumbnail: string | null; qty: number; spent: number }>();
  for (const order of orders) {
    for (const it of order.items) {
      const existing = productCount.get(it.product.id);
      if (existing) {
        existing.qty += it.quantity;
        existing.spent += Number(it.price) * it.quantity;
      } else {
        productCount.set(it.product.id, {
          id: it.product.id,
          title: it.product.title,
          thumbnail: it.product.thumbnail,
          qty: it.quantity,
          spent: Number(it.price) * it.quantity,
        });
      }
    }
  }
  const topProducts = Array.from(productCount.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <>
      <AdminHeader title={lastOrder.customerName} subtitle={phone} />
      <div className="p-6 md:p-8 space-y-5">
        {/* Back + actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/admin/customers"
            className="flex items-center gap-2 text-[12px] font-bold text-[rgba(18,18,18,0.5)] hover:text-[#062F35] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Kthehu te klientët
          </Link>
          <div className="flex gap-3">
            <a
              href={`tel:${phone}`}
              className="h-[40px] px-4 flex items-center border-2 border-[#E8E8E8] rounded-[8px] text-[12px] font-bold text-[#062F35] hover:bg-[#F5F5F5] transition-colors"
            >
              📞 Telefono
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="h-[40px] px-4 flex items-center bg-[#25D366] text-white rounded-[8px] text-[12px] font-bold hover:bg-[#1FAE54] transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5">
            <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
              Porosi
            </p>
            <p className="text-[28px] font-bold text-[#062F35] mt-1 tracking-[-1px]">
              {orders.length}
            </p>
          </div>
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5">
            <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
              Shpenzuar
            </p>
            <p className="text-[28px] font-bold text-[#062F35] mt-1 tracking-[-1px]">
              €{totalSpent.toFixed(0)}
            </p>
          </div>
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5">
            <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
              Mesatarja
            </p>
            <p className="text-[28px] font-bold text-[#062F35] mt-1 tracking-[-1px]">
              €{avgOrder.toFixed(0)}
            </p>
          </div>
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5">
            <p className="text-[11px] text-[rgba(18,18,18,0.45)] font-semibold uppercase tracking-wider">
              Artikuj
            </p>
            <p className="text-[28px] font-bold text-[#062F35] mt-1 tracking-[-1px]">
              {totalItems}
            </p>
          </div>
        </div>

        {/* Blacklist warning */}
        {blacklistEntry && (
          <div className="bg-[#FFEBEE] border border-[#EF5350] rounded-[12px] p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-bold text-[#C62828]">⚠ Klient në listën e zezë</p>
              {blacklistEntry.reason && (
                <p className="text-[12px] text-[#C62828] mt-1">Arsyeja: {blacklistEntry.reason}</p>
              )}
            </div>
            <Link
              href="/admin/blacklist"
              className="text-[11px] font-bold text-[#C62828] hover:underline"
            >
              Menaxho →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Orders timeline */}
          <div className="lg:col-span-2">
            <section className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
              <div className="px-5 py-3 border-b border-[#F0F0F0]">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
                  Porositë ({orders.length})
                </h3>
              </div>
              <ul>
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="px-5 py-3 border-b border-[#F8F8F8] last:border-b-0 hover:bg-[#FAFBFC] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-[13px] font-bold text-[#062F35] hover:text-[#FFC334] font-mono"
                        >
                          {order.orderNumber}
                        </Link>
                        <span className="text-[11px] text-[rgba(18,18,18,0.45)]">
                          {new Date(order.createdAt).toLocaleDateString("sq-AL", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="text-[13px] font-bold text-[#062F35]">
                        €{Number(order.total).toFixed(2)}
                      </div>
                    </div>
                    <p className="text-[11px] text-[rgba(18,18,18,0.5)] mt-1 truncate">
                      {order.items.map((it) => `${it.quantity}× ${it.product.title}`).join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar — contact / address / top products */}
          <div className="space-y-5">
            <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
                Kontakti
              </h3>
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-[#062F35]">{lastOrder.customerName}</p>
                <a
                  href={`tel:${phone}`}
                  className="block text-[12px] text-[#062F35] hover:text-[#FFC334]"
                >
                  {phone}
                </a>
                {lastOrder.customerEmail && (
                  <a
                    href={`mailto:${lastOrder.customerEmail}`}
                    className="block text-[12px] text-[rgba(18,18,18,0.6)] hover:text-[#062F35] truncate"
                  >
                    {lastOrder.customerEmail}
                  </a>
                )}
              </div>
            </section>

            <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
                Adresa e fundit
              </h3>
              <p className="text-[13px] font-semibold text-[#062F35]">{lastOrder.city}</p>
              <p className="text-[12px] text-[rgba(18,18,18,0.6)] whitespace-pre-wrap">
                {lastOrder.address}
              </p>
              <p className="text-[10px] text-[rgba(18,18,18,0.4)] pt-2 border-t border-[#F0F0F0]">
                Klient që nga {new Date(firstOrder.createdAt).toLocaleDateString("sq-AL", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </section>

            {topProducts.length > 0 && (
              <section className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#F0F0F0]">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)]">
                    Produktet e preferuara
                  </h3>
                </div>
                <ul>
                  {topProducts.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 px-5 py-2.5 border-b border-[#F8F8F8] last:border-b-0"
                    >
                      <div className="w-[32px] h-[32px] bg-[#F5F5F5] rounded-[6px] overflow-hidden flex-shrink-0">
                        {p.thumbnail && (
                          <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="block text-[12px] font-semibold text-[#062F35] hover:text-[#FFC334] truncate"
                        >
                          {p.title}
                        </Link>
                        <p className="text-[10px] text-[rgba(18,18,18,0.45)]">
                          {p.qty} herë · €{p.spent.toFixed(0)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
