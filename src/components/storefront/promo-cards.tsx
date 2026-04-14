import Link from "next/link";

interface PromoCard {
  title: string;
  subtitle: string;
  href: string;
  gradient: string;
}

export function PromoCards({ cards }: { cards: [PromoCard, PromoCard] }) {
  return (
    <section className="py-4">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="relative block overflow-hidden"
              style={{ aspectRatio: "4/3" }}
            >
              <div className={`absolute inset-0 ${card.gradient}`} />
              <div className="relative h-full flex flex-col justify-end p-6">
                <h3 className="text-white text-2xl font-semibold tracking-tight">{card.title}</h3>
                <p className="text-white/80 text-sm mt-1">{card.subtitle}</p>
                <span className="mt-3 inline-flex w-fit bg-white text-text px-5 py-2 rounded-full text-sm font-semibold">
                  Zbulo
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
