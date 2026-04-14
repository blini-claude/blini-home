import Link from "next/link";

const CATEGORIES = [
  { label: "Shtëpi & Kuzhinë", slug: "shtepi-kuzhine", emoji: "🏠", bg: "bg-[#FFF0E5]" },
  { label: "Teknologji", slug: "teknologji", emoji: "📱", bg: "bg-[#E8F0FE]" },
  { label: "Fëmijë & Lodra", slug: "femije-lodra", emoji: "🧸", bg: "bg-[#FFF3E0]" },
  { label: "Bukuri & Kujdes", slug: "bukuri-kujdes", emoji: "✨", bg: "bg-[#FCE4EC]" },
  { label: "Sporte", slug: "sporte-aktivitete", emoji: "⚽", bg: "bg-[#E8F5E9]" },
  { label: "Veshje & Aksesore", slug: "veshje-aksesore", emoji: "👕", bg: "bg-[#F3E5F5]" },
  { label: "Të reja", slug: "te-rejat", emoji: "🆕", bg: "bg-[#E0F7FA]" },
  { label: "Nën €10", slug: "nen-10", emoji: "🏷️", bg: "bg-[#FFF9C4]" },
];

export function CategoryBubbles() {
  return (
    <section className="py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <h2 className="text-2xl font-bold tracking-tight mb-5">Blej sipas kategorisë</h2>
        <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/koleksion/${cat.slug}`}
              className="flex flex-col items-center gap-2.5 flex-shrink-0"
            >
              <div
                className={`w-[100px] h-[100px] md:w-[130px] md:h-[130px] rounded-full ${cat.bg} flex items-center justify-center text-3xl md:text-4xl hover:scale-105 transition-transform`}
              >
                {cat.emoji}
              </div>
              <span className="text-sm font-medium text-center whitespace-nowrap">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
