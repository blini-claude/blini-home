"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Hyrja dështoi");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Diçka shkoi gabim");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[480px] bg-[#062F35] flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FFC334] rounded-full opacity-[0.06] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#FFC334] rounded-full opacity-[0.04] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-[44px] h-[44px] rounded-[12px] bg-[#FFC334] flex items-center justify-center">
              <span className="text-[18px] font-black text-[#062F35] italic">B</span>
            </div>
            <div>
              <span className="text-[20px] font-bold tracking-[-0.3px] text-white italic">
                BLINI HOME
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-[32px] font-bold text-white tracking-[-1.5px] leading-tight">
            Menaxho dyqanin tënd,
            <br />
            <span className="text-[#FFC334]">lehtë dhe shpejt.</span>
          </h2>
          <p className="text-[14px] text-[rgba(255,255,255,0.5)] mt-4 leading-relaxed max-w-[340px]">
            Paneli admin për menaxhimin e produkteve, porosive, klientëve dhe
            cilësimeve të dyqanit.
          </p>
        </div>

        <p className="text-[11px] text-[rgba(255,255,255,0.2)] relative z-10">
          BLINI HOME &copy; 2026 · Të gjitha të drejtat e rezervuara
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-[#FAFBFC] px-5">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-3">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-[#FFC334] flex items-center justify-center">
                <span className="text-[16px] font-black text-[#062F35] italic">B</span>
              </div>
              <span className="text-[18px] font-bold tracking-[-0.3px] text-[#062F35] italic">
                BLINI HOME
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-[26px] font-bold tracking-[-1px] text-[#062F35]">
              Mirësevini përsëri
            </h1>
            <p className="text-[14px] text-[rgba(18,18,18,0.45)] mt-1.5">
              Hyni në panelin tuaj admin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-[12px] font-bold text-[#062F35] mb-2 uppercase tracking-wider"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoFocus
                className="w-full h-[50px] px-4 border-2 border-[#E8E8E8] rounded-[10px] text-[14px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors bg-white"
                placeholder="admin@blinihome.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[12px] font-bold text-[#062F35] mb-2 uppercase tracking-wider"
              >
                Fjalëkalimi
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full h-[50px] px-4 border-2 border-[#E8E8E8] rounded-[10px] text-[14px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors bg-white"
                placeholder="Shkruaj fjalëkalimin"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[13px] text-[#C62828] bg-[#FFEBEE] border border-[#FFCDD2] rounded-[10px] px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] bg-[#062F35] text-white rounded-[10px] text-[14px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] disabled:opacity-50 disabled:hover:bg-[#062F35] disabled:hover:text-white transition-colors cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Po hyhet...
                </span>
              ) : (
                "Hyr në panel"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
