import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="mb-6">
        <svg className="mx-auto text-green-500" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-2">Faleminderit!</h1>
      <p className="text-text-secondary text-lg mb-1">Porosia juaj u dërgua me sukses.</p>
      <p className="text-sm text-text-secondary mb-8">
        Numri i porosisë: <strong className="text-text">{order.orderNumber}</strong>
      </p>

      <div className="bg-card-bg p-6 text-left mb-8">
        <h2 className="text-lg font-bold mb-4">Detajet e porosisë</h2>

        <div className="space-y-2 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.product.title} × {item.quantity}</span>
              <span className="font-bold">€{(Number(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-4 pt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Nëntotali</span>
            <span>€{Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Dërgimi</span>
            <span>{Number(order.deliveryFee) === 0 ? "FALAS" : `€${Number(order.deliveryFee).toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-extrabold text-base pt-2 border-t border-border">
            <span>Totali</span>
            <span>€{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-card-bg p-6 text-left mb-8">
        <h2 className="text-lg font-bold mb-3">Çfarë ndodh tani?</h2>
        <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
          <li>Do të kontaktoheni me telefon për konfirmimin e porosisë</li>
          <li>Porosia dërgohet brenda 1-3 ditëve pune</li>
          <li>Paguani me para në dorë kur ta merrni produktin</li>
        </ol>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Dërgimi tek: {order.customerName}, {order.address}, {order.city}
        </p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-block bg-[#062F35] text-white px-8 py-3 rounded-[8px] text-[15px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors"
        >
          Vazhdo blerjen
        </Link>
        <Link
          href={`/ndiq-porosine?order=${order.orderNumber}`}
          className="inline-block bg-transparent text-[#062F35] px-8 py-3 rounded-[8px] text-[15px] font-bold border-2 border-[#062F35] hover:bg-[#062F35] hover:text-white transition-colors"
        >
          Ndiq porosinë
        </Link>
      </div>
    </div>
  );
}
