"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STORAGE_KEY = "blini-home-install-prompt";
const DISMISS_DAYS = 30;
const SHOW_AFTER_MS = 45_000;

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored) as { dismissedAt?: number; installedAt?: number };
        if (data.installedAt) return;
        if (data.dismissedAt && Date.now() - data.dismissedAt < DISMISS_DAYS * 86400_000) {
          return;
        }
      } catch {
        // ignore
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ installedAt: Date.now() }));
      } catch {}
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!deferred) return;
    const t = window.setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(t);
  }, [deferred]);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissedAt: Date.now() }));
    } catch {}
  }

  async function install() {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ installedAt: Date.now() }));
        } catch {}
      } else {
        dismiss();
      }
    } finally {
      setDeferred(null);
      setVisible(false);
    }
  }

  if (!visible || !deferred) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[360px] z-[55] bg-white rounded-[14px] shadow-2xl border border-[#E8E8E8] p-4">
      <div className="flex items-start gap-3">
        <img src="/logo.svg" alt="BLINI HOME" className="w-10 h-10 rounded-[8px] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[#062F35] leading-tight">
            Instalo BLINI HOME
          </p>
          <p className="text-[11px] text-[rgba(18,18,18,0.55)] mt-0.5 leading-snug">
            Shtoje si aplikacion në ekranin kryesor për akses më të shpejtë.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={install}
              className="bg-[#062F35] text-white text-[12px] font-bold px-3 py-1.5 rounded-[6px] hover:bg-[#0a4049] transition-colors cursor-pointer"
            >
              Instalo
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="text-[12px] font-semibold text-[rgba(18,18,18,0.5)] hover:text-[#062F35] transition-colors"
            >
              Jo tani
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Mbyll"
          className="p-1 text-[rgba(18,18,18,0.4)] hover:text-[#062F35]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
