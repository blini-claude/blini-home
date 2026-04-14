"use client";

import { useRouter } from "next/navigation";

export function AdminHeader({ title }: { title: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="h-14 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-[#121212]">{title}</h1>
      <button
        onClick={handleLogout}
        className="text-sm text-[#707070] hover:text-[#121212]"
      >
        Sign out
      </button>
    </header>
  );
}
