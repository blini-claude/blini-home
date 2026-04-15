export function AnnouncementBar({ text }: { text?: string }) {
  return (
    <div className="w-full h-[34px] bg-[#062F35] flex items-center justify-center gap-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AFE8D7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
      <p className="text-[12px] text-[#AFE8D7] font-bold tracking-wide">
        {text || "Dërgim falas për porosi mbi €30"}
      </p>
    </div>
  );
}
