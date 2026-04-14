import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="relative h-[400px] md:h-[500px] overflow-hidden">
      {/* Warm Scandinavian gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E8E0D4] via-[#D4C5B0] to-[#C9B99A]" />

      {/* Content */}
      <div className="relative h-full max-w-[1400px] mx-auto px-4 flex flex-col items-center justify-center text-center">
        <p className="text-text/60 text-sm font-medium uppercase tracking-widest mb-3">
          KOLEKSIONI I RI
        </p>
        <h1 className="text-text text-[36px] md:text-[48px] font-bold leading-tight tracking-tight max-w-lg">
          Gjithçka për shtëpinë tuaj
        </h1>
        <p className="text-text/60 text-base md:text-lg mt-3 max-w-md">
          Zbulo produkte nga markat më të mira — me çmime të përballueshme
        </p>
        <Link
          href="/koleksion/te-rejat"
          className="mt-7 bg-text text-white px-8 py-3.5 rounded-[5px] text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Zbulo tani
        </Link>
      </div>
    </section>
  );
}
