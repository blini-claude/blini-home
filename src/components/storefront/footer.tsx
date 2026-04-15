"use client";

import Link from "next/link";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  return (
    <footer className="bg-white" style={{ padding: "48px 0 20px", borderTop: "1px solid rgba(18,18,18,0.06)" }}>
      <div className="px-5 mx-auto" style={{ maxWidth: 1440 }}>
        {/* Main columns */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5 lg:gap-6">
          {/* Col 1: Logo + Social */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <img src="/logo.svg" alt="BLINI HOME" className="h-[55px] w-auto" />
            </Link>
            <div className="flex items-center gap-1 mt-3">
              <a href="https://instagram.com/blini.home" target="_blank" rel="noopener noreferrer" className="w-[34px] h-[34px] flex items-center justify-center rounded-full hover:bg-[#F5F5F5] text-[rgba(18,18,18,0.6)] hover:text-[#062F35] transition-colors" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>
              </a>
              <a href="https://facebook.com/blini.home" target="_blank" rel="noopener noreferrer" className="w-[34px] h-[34px] flex items-center justify-center rounded-full hover:bg-[#F5F5F5] text-[rgba(18,18,18,0.6)] hover:text-[#062F35] transition-colors" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
              <a href="https://tiktok.com/@blini.home" target="_blank" rel="noopener noreferrer" className="w-[34px] h-[34px] flex items-center justify-center rounded-full hover:bg-[#F5F5F5] text-[rgba(18,18,18,0.6)] hover:text-[#062F35] transition-colors" aria-label="TikTok">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
              </a>
            </div>
          </div>

          {/* Col 2: BLINI HOME — brand description */}
          <div>
            <h4 className="text-[15px] font-bold text-[#062F35] mb-3 tracking-[-0.3px]">BLINI HOME</h4>
            <p className="text-[13px] text-[rgba(18,18,18,0.5)] leading-[19px]">
              Produkte cilësore për shtëpinë, familjen dhe veten tuaj me çmimet më të mira në Kosovë. Gjithçka që ju nevojitet në një vend.
            </p>
          </div>

          {/* Col 3: Rreth nesh */}
          <div>
            <h4 className="text-[15px] font-bold text-[#062F35] mb-3 tracking-[-0.3px]">Rreth nesh</h4>
            <nav className="space-y-1.5">
              <Link href="/rreth-nesh" className="block text-[13px] text-[rgba(18,18,18,0.5)] leading-[19px] hover:text-[#062F35] transition-colors">Kush jemi</Link>
              <Link href="/kontakt" className="block text-[13px] text-[rgba(18,18,18,0.5)] leading-[19px] hover:text-[#062F35] transition-colors">Na kontaktoni</Link>
              <Link href="/koleksion/te-gjitha" className="block text-[13px] text-[rgba(18,18,18,0.5)] leading-[19px] hover:text-[#062F35] transition-colors">Dyqani online</Link>
              <Link href="/koleksion/te-rejat" className="block text-[13px] text-[rgba(18,18,18,0.5)] leading-[19px] hover:text-[#062F35] transition-colors">Të rejat</Link>
              <Link href="/koleksion/oferta" className="block text-[13px] text-[rgba(18,18,18,0.5)] leading-[19px] hover:text-[#062F35] transition-colors">Oferta & zbritje</Link>
            </nav>
          </div>

          {/* Col 4: Ndihme & informata */}
          <div>
            <h4 className="text-[15px] font-bold text-[#062F35] mb-3 tracking-[-0.3px]">Ndihme & informata</h4>
            <nav className="space-y-1.5">
              <Link href="/dergimi" className="block text-[13px] text-[rgba(18,18,18,0.5)] leading-[19px] hover:text-[#062F35] transition-colors">Informata për dërgimin</Link>
              <Link href="/kthimi" className="block text-[13px] text-[rgba(18,18,18,0.5)] leading-[19px] hover:text-[#062F35] transition-colors">Kthimi i produkteve</Link>
              <Link href="/pyetje" className="block text-[13px] text-[rgba(18,18,18,0.5)] leading-[19px] hover:text-[#062F35] transition-colors">Pyetje të shpeshta</Link>
              <Link href="/privatesia" className="block text-[13px] text-[rgba(18,18,18,0.5)] leading-[19px] hover:text-[#062F35] transition-colors">Privatesia</Link>
              <Link href="/kushtet" className="block text-[13px] text-[rgba(18,18,18,0.5)] leading-[19px] hover:text-[#062F35] transition-colors">Kushtet e përdorimit</Link>
            </nav>
          </div>

          {/* Col 5: Newsletter */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="text-[15px] font-bold text-[#062F35] mb-3 tracking-[-0.3px]">Abonohu për ofertat</h4>
            <p className="text-[13px] text-[rgba(18,18,18,0.5)] leading-[19px] mb-3">
              Shkruaj emailin tend për të marrë 10% zbritje në porosinë e parë.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSubscribeStatus("loading");
                try {
                  const res = await fetch("/api/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                  if (res.ok) {
                    setSubscribeStatus("success");
                    setEmail("");
                    setTimeout(() => setSubscribeStatus("idle"), 4000);
                  } else {
                    setSubscribeStatus("error");
                  }
                } catch {
                  setSubscribeStatus("error");
                }
              }}
              className="flex max-w-[320px]"
            >
              <input
                type="email"
                placeholder="Email juaj"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-[40px] px-3.5 text-[13px] bg-[#F5F5F5] border border-[rgba(18,18,18,0.08)] outline-none focus:border-[rgba(18,18,18,0.2)] rounded-l-[14px]"
              />
              <button
                type="submit"
                disabled={subscribeStatus === "loading"}
                className="h-[40px] px-5 bg-[#062F35] text-white text-[13px] font-bold rounded-r-[14px] border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {subscribeStatus === "loading" ? "..." : "Regjistrohu"}
              </button>
            </form>
            {subscribeStatus === "success" && (
              <p className="text-[12px] text-[#2E7D32] font-bold mt-2">
                Faleminderit! Jeni regjistruar me sukses.
              </p>
            )}
            {subscribeStatus === "error" && (
              <p className="text-[12px] text-[#C62828] font-bold mt-2">
                Diçka shkoi gabim. Provoni përsëri.
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 mb-5 border-t border-[rgba(18,18,18,0.06)]" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Copyright */}
          <p className="text-[13px] text-[rgba(18,18,18,0.35)] order-3 md:order-1">
            &copy; 2026 BLINI HOME
          </p>

          {/* Delivery partner */}
          <div className="flex items-center gap-3 order-1 md:order-2">
            <span className="text-[12px] text-[rgba(18,18,18,0.35)]">Partneri i dërgimit:</span>
            <a
              href="https://izis-post.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-[8px] hover:bg-[#EBEBEB] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
              <span className="text-[12px] font-bold text-[#062F35]">Posta Izi</span>
            </a>
          </div>

          {/* Payment */}
          <div className="flex items-center gap-2 order-2 md:order-3">
            <span className="text-[12px] text-[rgba(18,18,18,0.35)]">Pagesa:</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-[8px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <circle cx="12" cy="12" r="3.5" />
              </svg>
              <span className="text-[12px] font-bold text-[#062F35]">Para në dorë (COD)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
