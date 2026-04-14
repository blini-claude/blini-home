import Link from "next/link";

const CATEGORIES = [
  { label: "Shtëpi & Kuzhinë", slug: "shtepi-kuzhine", emoji: "🏠" },
  { label: "Teknologji", slug: "teknologji", emoji: "📱" },
  { label: "Fëmijë & Lodra", slug: "femije-lodra", emoji: "🧸" },
  { label: "Bukuri & Kujdes", slug: "bukuri-kujdes", emoji: "✨" },
  { label: "Sporte", slug: "sporte-aktivitete", emoji: "⚽" },
  { label: "Veshje & Aksesore", slug: "veshje-aksesore", emoji: "👕" },
  { label: "Të reja", slug: "te-rejat", emoji: "🆕" },
  { label: "Nën €10", slug: "nen-10", emoji: "🏷️" },
];

export function CategoryBubbles() {
  return (
    <section className="py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <h2 className="text-2xl font-semibold tracking-tight mb-5">Blej sipas kategorisë</h2>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/koleksion/${cat.slug}`}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-full bg-card-bg flex items-center justify-center text-4xl hover:scale-105 transition-transform">
                {cat.emoji}
              </div>
              <span className="text-[13px] sm:text-[15px] font-semibold text-center whitespace-nowrap">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
