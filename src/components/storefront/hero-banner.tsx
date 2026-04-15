"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type HeroSlide = {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
};

const DEFAULT_SLIDE: HeroSlide = {
  title: "Gjithçka për shtëpinë tuaj",
  subtitle: "Zbulo produkte të reja për shtëpi, kuzhinë dhe familje",
  buttonText: "Blej tani",
  buttonLink: "/koleksion/te-rejat",
  image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80&auto=format&fit=crop",
};

export function HeroBanner({ slides }: { slides?: HeroSlide[] }) {
  const slide =
    slides && slides.length > 0 && slides[0].title
      ? slides[0]
      : DEFAULT_SLIDE;

  const bgImage =
    slide.image ||
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80&auto=format&fit=crop";

  return (
    <section className="relative w-full h-[280px] md:h-[380px] overflow-hidden rounded-b-[20px]">
      {/* Background */}
      <motion.img
        src={bgImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative h-full w-full flex flex-col items-center justify-center text-center px-5">
        <motion.h1
          className="text-white text-[26px] md:text-[36px] font-bold leading-[1.15] tracking-[-1px] max-w-[520px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          {slide.title}
        </motion.h1>
        <motion.p
          className="text-white/85 text-[14px] md:text-[16px] font-semibold mt-2.5 max-w-[400px]"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          {slide.subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
        >
          <Link
            href={slide.buttonLink}
            className="mt-5 inline-flex items-center justify-center gap-2 bg-white text-[#062F35] text-[15px] font-bold rounded-[8px] px-7 py-2.5 hover:bg-[#F5F5F5] transition-colors shadow-sm"
          >
            {slide.buttonText}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
