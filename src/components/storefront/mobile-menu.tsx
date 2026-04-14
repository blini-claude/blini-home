"use client";

import Link from "next/link";
import { useEffect } from "react";

const NAV_ITEMS = [
  { label: "Të reja", href: "/koleksion/te-rejat" },
  { label: "Bestseller", href: "/koleksion/me-te-shitura" },
  { label: "Shtëpi", href: "/koleksion/shtepi-kuzhine" },
  { label: "Dhurata", href: "/koleksion/dhurata" },
  { label: "Lodra & Lojëra", href: "/koleksion/femije-lodra" },
  { label: "Teknologji", href: "/koleksion/teknologji" },
  { label: "Fëmijë", href: "/koleksion/femije" },
  { label: "Bukuri", href: "/koleksion/bukuri-kujdes" },
  { label: "Aksesore", href: "/koleksion/veshje-aksesore" },
  { label: "Shiko të gjitha", href: "/koleksion/te-gjitha" },
  { label: "Oferta - deri 50%", href: "/koleksion/oferta", isPromo: true },
];

const INFO_ITEMS = [
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
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel - slide in from left */}
      <div className="absolute left-0 top-0 bottom-0 w-[320px] bg-white overflow-y-auto shadow-xl">
        {/* Close button top-right */}
        <div className="flex items-center justify-end p-4">
          <button onClick={onClose} className="p-1" aria-label="Mbyll">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main nav items */}
        <nav className="py-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`block px-6 py-3 text-[15px] font-medium ${
                item.isPromo ? "text-[#E31B23] font-semibold" : "text-text"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="my-3 mx-6 border-t border-border" />

          {/* Info links */}
          {INFO_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="block px-6 py-3 text-[15px] font-medium text-text-secondary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
