import Link from "next/link";

const NAV_ITEMS = [
  { label: "Të reja", href: "/koleksion/te-rejat" },
  { label: "Bestseller", href: "/koleksion/me-te-shitura" },
  { label: "Shtëpi", href: "/koleksion/shtepi-kuzhine" },
  { label: "Dhurata", href: "/koleksion/dhurata" },
  { label: "Lodra & Lojëra", href: "/koleksion/femije-lodra" },
  { label: "Teknologji", href: "/koleksion/teknologji" },
  { label: "Fëmijë", href: "/koleksion/femije" },
  { label: "Bukuri", href: "/koleksion/bukuri-kujdes" },
  { label: "Aksesore", href: "/koleksion/veshje-aksesore" },
  { label: "Shiko të gjitha", href: "/koleksion/te-gjitha" },
  { label: "Oferta - deri 50%", href: "/koleksion/oferta", isPromo: true },
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
              className={`whitespace-nowrap px-3 py-2.5 text-[14px] font-medium transition-colors hover:underline ${
                item.isPromo
                  ? "text-[#E31B23] font-semibold"
                  : "text-text hover:text-text"
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
