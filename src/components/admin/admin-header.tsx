"use client";

import { useRouter } from "next/navigation";

export function AdminHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("sq-AL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="h-[72px] bg-white border-b border-[#E8E8E8] flex items-center justify-between px-6 md:px-8 sticky top-0 z-20">
      <div>
        <h1 className="text-[20px] font-bold text-[#062F35] tracking-[-0.5px]">{title}</h1>
        {subtitle ? (
          <p className="text-[12px] text-[rgba(18,18,18,0.45)] mt-0.5">{subtitle}</p>
        ) : (
          <p className="text-[12px] text-[rgba(18,18,18,0.4)] mt-0.5 capitalize">{dateStr}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[13px] text-[rgba(18,18,18,0.45)] hover:text-[#062F35] transition-colors cursor-pointer px-3 py-2 rounded-[8px] hover:bg-[#F5F5F5]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Dil
        </button>
      </div>
    </header>
  );
}
