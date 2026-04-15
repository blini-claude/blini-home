import Link from "next/link";

export const metadata = { title: "Llogaria — BLINI HOME" };

export default function AccountPage() {
  return (
    <div className="px-5 mx-auto py-16 text-center" style={{ maxWidth: 500 }}>
      <div className="w-[64px] h-[64px] rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
        </svg>
      </div>
      <h1 className="text-[24px] font-bold text-[#062F35] tracking-[-0.5px] mb-3">
        Llogaria ime
      </h1>
      <p className="text-[14px] text-[rgba(18,18,18,0.55)] mb-6 leading-relaxed">
        Funksioni i llogarisë do të jetë i disponueshëm së shpejti. Ndërkaq, mund të porosisni si vizitor.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-[#062F35] text-white text-[14px] font-bold px-6 py-2.5 rounded-[8px] border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors"
      >
        Vazhdo blerjen
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
