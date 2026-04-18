"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "./motion";

const STORAGE_KEY = "blini-home-newsletter-popup";
const DISMISS_DAYS = 14;
const SHOW_AFTER_MS = 25_000;

type Phase = "hidden" | "form" | "success" | "error";

export function NewsletterPopup({ discountPct = 5 }: { discountPct?: number }) {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored) as { dismissedAt?: number; submittedAt?: number };
        const dismissed = data.dismissedAt && Date.now() - data.dismissedAt < DISMISS_DAYS * 86400_000;
        if (data.submittedAt || dismissed) return;
      } catch {
        // ignore corrupt entry
      }
    }

    let opened = false;
    const openIfHidden = () => {
      if (opened) return;
      opened = true;
      setPhase("form");
    };

    const timer = window.setTimeout(openIfHidden, SHOW_AFTER_MS);
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) openIfHidden();
    };
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  function close() {
    setPhase("hidden");
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const data = existing ? JSON.parse(existing) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, dismissedAt: Date.now() }));
    } catch {}
  }

  function markSubmitted() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ submittedAt: Date.now() }),
      );
    } catch {}
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!email.includes("@")) {
      setErrorMessage("Ju lutem shkruani një email të vlefshëm");
      setPhase("error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "popup" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gabim");
      setDiscountCode(data.discountCode ?? null);
      markSubmitted();
      setPhase("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gabim");
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {phase !== "hidden" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="relative bg-white rounded-[16px] w-full max-w-[440px] p-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25 }}
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 p-1.5 text-[rgba(18,18,18,0.55)] hover:text-[#062F35] cursor-pointer"
              aria-label="Mbyll"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {phase === "form" && (
              <>
                <div className="text-center mb-6">
                  <div className="text-[44px] mb-2">🎁</div>
                  <h2 className="text-[22px] font-bold text-[#062F35] mb-2">
                    {discountPct}% ZBRITJE PËR POROSINË E PARË
                  </h2>
                  <p className="text-[14px] text-[rgba(18,18,18,0.7)]">
                    Regjistrohu për lajmet e reja, ofertat speciale dhe merr kodin tënd të zbritjes menjëherë në email.
                  </p>
                </div>
                <form onSubmit={onSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Emaili juaj"
                    required
                    className="w-full px-4 py-3 border border-[#E8E8E8] rounded-[8px] text-[14px] focus:outline-none focus:border-[#062F35]"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#062F35] text-white py-3.5 rounded-[8px] text-[14px] font-bold hover:bg-[#0a4049] transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {submitting ? "Duke regjistruar..." : `Merr ${discountPct}% zbritje`}
                  </button>
                </form>
                <p className="text-[11px] text-[rgba(18,18,18,0.5)] text-center mt-3">
                  Mund të çabonoheni në çdo kohë. Nuk spamohemi.
                </p>
              </>
            )}

            {phase === "success" && (
              <div className="text-center py-4">
                <div className="text-[44px] mb-3">✓</div>
                <h2 className="text-[20px] font-bold text-[#062F35] mb-3">Faleminderit!</h2>
                <p className="text-[14px] text-[rgba(18,18,18,0.7)] mb-5">
                  Kodi juaj i zbritjes është:
                </p>
                {discountCode && (
                  <div className="bg-[#F7F7F7] border-2 border-dashed border-[#062F35] rounded-[8px] px-4 py-3 mb-5">
                    <code className="text-[20px] font-bold text-[#062F35] tracking-wider">{discountCode}</code>
                  </div>
                )}
                <p className="text-[12px] text-[rgba(18,18,18,0.55)] mb-5">
                  Aplikoni kodin në arkë. Skadon pas 30 ditëve.
                </p>
                <button
                  onClick={close}
                  className="bg-[#062F35] text-white px-6 py-2.5 rounded-[8px] text-[13px] font-bold cursor-pointer hover:bg-[#0a4049] transition-colors"
                >
                  Vazhdo blerjen
                </button>
              </div>
            )}

            {phase === "error" && (
              <div className="text-center py-4">
                <div className="text-[44px] mb-3">⚠️</div>
                <h2 className="text-[18px] font-bold text-[#062F35] mb-2">Diçka shkoi keq</h2>
                <p className="text-[14px] text-[rgba(18,18,18,0.7)] mb-5">{errorMessage}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setPhase("form")}
                    className="bg-[#062F35] text-white px-6 py-2.5 rounded-[8px] text-[13px] font-bold cursor-pointer hover:bg-[#0a4049] transition-colors"
                  >
                    Provo përsëri
                  </button>
                  <button
                    onClick={close}
                    className="px-6 py-2.5 text-[13px] font-bold text-[#062F35] cursor-pointer hover:underline"
                  >
                    Mbyll
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
