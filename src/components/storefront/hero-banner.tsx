import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="relative bg-card-bg" style={{ height: "400px" }}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#303061] to-[#6767A7]" />
      <div className="relative h-full max-w-[1400px] mx-auto px-4 flex flex-col items-center justify-center text-center">
        <p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-3">
          Koleksioni i ri
        </p>
        <h1 className="text-white text-[42px] font-semibold leading-tight tracking-tight max-w-lg">
          Gjithçka për shtëpinë tuaj
        </h1>
        <p className="text-white/70 text-lg mt-3 max-w-md">
          Zbulo produkte nga markat më të mira — me çmime të përballueshme
        </p>
        <Link
          href="/koleksion/te-rejat"
          className="mt-6 bg-hero-btn text-hero-btn-text px-8 py-3 rounded-full text-[15px] font-semibold hover:opacity-90 transition-opacity"
        >
          Zbulo tani
        </Link>
      </div>
    </section>
  );
}
