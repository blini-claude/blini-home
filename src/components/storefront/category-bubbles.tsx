import Link from "next/link";

const CATEGORIES = [
  { label: "Shtëpi & Kuzhinë", slug: "shtepi-kuzhine", icon: "🏠", bg: "#FFF0E5" },
  { label: "Teknologji", slug: "teknologji", icon: "📱", bg: "#E8F0FE" },
  { label: "Fëmijë & Lodra", slug: "femije-lodra", icon: "🧸", bg: "#FFF3E0" },
  { label: "Bukuri & Kujdes", slug: "bukuri-kujdes", icon: "💄", bg: "#FCE4EC" },
  { label: "Sporte", slug: "sporte-aktivitete", icon: "⚽", bg: "#E8F5E9" },
  { label: "Veshje & Aksesore", slug: "veshje-aksesore", icon: "👗", bg: "#F3E5F5" },
  { label: "Të reja", slug: "te-rejat", icon: "✨", bg: "#E0F7FA" },
  { label: "Nën €10", slug: "nen-10", icon: "💰", bg: "#FFF9C4" },
];

export function CategoryBubbles() {
  return (
    <section className="py-10">
      <div className="max-w-[1400px] mx-auto px-4">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Blej sipas kategorisë</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/koleksion/${cat.slug}`}
              className="flex flex-col items-center gap-2.5 group"
            >
              <div
                className="w-[80px] h-[80px] md:w-[110px] md:h-[110px] rounded-full flex items-center justify-center text-2xl md:text-3xl group-hover:scale-105 transition-transform"
                style={{ backgroundColor: cat.bg }}
              >
                <span role="img" aria-label={cat.label}>{cat.icon}</span>
              </div>
              <span className="text-xs md:text-sm font-medium text-center leading-tight">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
