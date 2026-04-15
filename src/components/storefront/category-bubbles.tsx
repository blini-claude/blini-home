"use client";

import Link from "next/link";
import { FadeIn, StaggerContainer, StaggerItem } from "./motion";

const CATEGORIES = [
  {
    label: "Shtëpi & Kuzhinë",
    slug: "shtepi-kuzhine",
    color: "#E8F0E4",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=460&q=80&auto=format&fit=crop",
  },
  {
    label: "Teknologji",
    slug: "teknologji",
    color: "#E0EBF5",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=460&q=80&auto=format&fit=crop",
  },
  {
    label: "Fëmijë & Lodra",
    slug: "femije-lodra",
    color: "#FFF0E0",
    imageUrl: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=460&q=80&auto=format&fit=crop",
  },
  {
    label: "Bukuri & Kujdes",
    slug: "bukuri-kujdes",
    color: "#F5E0EA",
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=460&q=80&auto=format&fit=crop",
  },
  {
    label: "Sporte",
    slug: "sporte-aktivitete",
    color: "#E0F0E8",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=460&q=80&auto=format&fit=crop",
  },
  {
    label: "Veshje & Aksesorë",
    slug: "veshje-aksesore",
    color: "#EDE0F5",
    imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=460&q=80&auto=format&fit=crop",
  },
];

export function CategoryBubbles() {
  return (
    <FadeIn>
    <section>
      <div className="px-5 mx-auto" style={{ maxWidth: 1440 }}>
        <h2 className="text-[28px] md:text-[36px] font-bold text-[#062F35] tracking-[-1.6px] mb-[20px]">
          Blej sipas kategorisë
        </h2>
        <StaggerContainer className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4" staggerDelay={0.1}>
          {CATEGORIES.map((cat) => (
            <StaggerItem key={cat.slug}>
              <Link
                href={`/koleksion/${cat.slug}`}
                className="flex flex-col items-center gap-2.5 group"
              >
                <div
                  className="w-full aspect-square rounded-[8px] overflow-hidden group-hover:scale-105 transition-transform duration-200"
                  style={{ backgroundColor: cat.color }}
                >
                  <img
                    src={cat.imageUrl}
                    alt={cat.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[13px] md:text-[14px] font-bold text-[#062F35] text-center leading-tight">
                  {cat.label}
                </span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
    </FadeIn>
  );
}
