import Link from "next/link";

const NAV_ITEMS = [
  { label: "Te reja", href: "/koleksion/te-rejat" },
  { label: "Bestseller", href: "/koleksion/me-te-shitura" },
  { label: "Shtepi", href: "/koleksion/shtepi-kuzhine" },
  { label: "Dhurata", href: "/koleksion/dhurata" },
  { label: "Lodra & Lojera", href: "/koleksion/femije-lodra" },
  { label: "Teknologji", href: "/koleksion/teknologji" },
  { label: "Bukuri", href: "/koleksion/bukuri-kujdes" },
  { label: "Aksesore", href: "/koleksion/veshje-aksesore" },
  { label: "Last Chance - deri 50%", href: "/koleksion/oferta", isPromo: true },
  { label: "Shiko te gjitha", href: "/koleksion/te-gjitha" },
];

export function Navigation() {
  return (
    <nav className="w-full max-w-[1440px] mx-auto px-5">
      <div className="flex items-center h-[41px] gap-[43px] overflow-x-auto hide-scrollbar">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap text-[16px] text-[#062F35] font-semibold hover:opacity-60 transition-opacity"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
