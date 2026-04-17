"use client";

import Link from "next/link";
import { StaggerContainer, StaggerItem } from "./motion";

interface PromoCard {
  title: string;
  subtitle: string;
  href: string;
  bgColor: string;
  imageUrl?: string;
  textColor?: string;
}

export function PromoCards({ cards }: { cards: PromoCard[] }) {
  return (
    <section>
      <div className="px-5 mx-auto" style={{ maxWidth: 1440 }}>
        <StaggerContainer className={`grid gap-4 ${cards.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
          {cards.map((card) => (
            <StaggerItem key={card.href}>
            <Link
              href={card.href}
              className="relative flex overflow-hidden group rounded-[16px]"
              style={{ backgroundColor: card.bgColor, minHeight: 340 }}
            >
              {/* Text side */}
              <div className="flex-1 flex flex-col justify-center p-7 md:p-9 z-10">
                <h3
                  className="text-[18px] md:text-[22px] font-bold tracking-[-0.5px] leading-tight"
                  style={{ color: card.textColor || "#062F35" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-[13px] md:text-[14px] mt-2 leading-relaxed max-w-[240px]"
                  style={{ color: card.textColor ? `${card.textColor}cc` : "rgba(18,18,18,0.6)" }}
                >
                  {card.subtitle}
                </p>
                <span
                  className="mt-5 inline-flex items-center gap-1.5 self-start px-5 py-2 text-[13px] font-bold rounded-[8px] transition-colors bg-[#062F35] text-white group-hover:bg-transparent group-hover:text-[#062F35] border border-[#062F35]"
                >
                  Blej tani
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>

              {/* Image side */}
              {card.imageUrl && (
                <div className="w-[45%] md:w-[50%] relative flex-shrink-0">
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
              )}
            </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
