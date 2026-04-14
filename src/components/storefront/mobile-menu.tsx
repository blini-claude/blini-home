"use client";

import Link from "next/link";
import { useEffect } from "react";

const MENU_ITEMS = [
  { label: "Kryefaqja", href: "/" },
  { label: "Të reja", href: "/koleksion/te-rejat" },
  { label: "Më të shitura", href: "/koleksion/me-te-shitura" },
  { label: "Shtëpi & Kuzhinë", href: "/koleksion/shtepi-kuzhine" },
  { label: "Teknologji", href: "/koleksion/teknologji" },
  { label: "Fëmijë & Lodra", href: "/koleksion/femije-lodra" },
  { label: "Bukuri & Kujdes", href: "/koleksion/bukuri-kujdes" },
  { label: "Sporte", href: "/koleksion/sporte-aktivitete" },
  { label: "Veshje & Aksesore", href: "/koleksion/veshje-aksesore" },
  { label: "Nën €10 — Oferta!", href: "/koleksion/nen-10", isPromo: true },
  { divider: true },
  { label: "Rreth nesh", href: "/rreth-nesh" },
  { label: "Dërgimi", href: "/dergimi" },
  { label: "Kthimi i produkteve", href: "/kthimi" },
  { label: "Pyetje të shpeshta", href: "/pyetje" },
];

export function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-white overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-lg font-semibold">Menu</span>
          <button onClick={onClose} className="p-1" aria-label="Mbyll">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="py-2">
          {MENU_ITEMS.map((item, i) =>
            "divider" in item ? (
              <div key={i} className="my-2 border-t border-border" />
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                onClick={onClose}
                className={`block px-6 py-3 text-[15px] font-medium ${
                  item.isPromo ? "text-sale" : "text-text"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </div>
  );
}
