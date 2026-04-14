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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <h1 className="text-lg font-semibold text-text">{title}</h1>
      <button
        onClick={handleLogout}
        className="text-sm text-text-secondary hover:text-text transition-colors cursor-pointer"
      >
        Sign out
      </button>
    </header>
  );
}
