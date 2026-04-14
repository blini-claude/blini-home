import Link from "next/link";

const NAV_ITEMS = [
  { label: "Të reja", href: "/koleksion/te-rejat" },
  { label: "Më të shitura", href: "/koleksion/me-te-shitura" },
  { label: "Shtëpi & Kuzhinë", href: "/koleksion/shtepi-kuzhine" },
  { label: "Teknologji", href: "/koleksion/teknologji" },
  { label: "Fëmijë & Lodra", href: "/koleksion/femije-lodra" },
  { label: "Bukuri & Kujdes", href: "/koleksion/bukuri-kujdes" },
  { label: "Sporte", href: "/koleksion/sporte-aktivitete" },
  { label: "Veshje & Aksesore", href: "/koleksion/veshje-aksesore" },
  { label: "Nën €10 — Oferta!", href: "/koleksion/nen-10", isPromo: true },
];

export function Navigation() {
  return (
    <nav className="border-b border-border bg-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex overflow-x-auto hide-scrollbar px-4 gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap px-3 py-2.5 text-[15px] font-medium transition-colors hover:text-accent ${
                item.isPromo ? "text-sale font-semibold" : "text-text"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
