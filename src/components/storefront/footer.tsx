"use client";

import Link from "next/link";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-footer-bg text-text mt-16">
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        {/* Top row: Logo + social icons */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/">
            <span className="text-xl font-bold tracking-tight">BLINI HOME</span>
          </Link>
          <div className="flex items-center gap-4">
            {/* Instagram */}
            <a
              href="https://instagram.com/blini.home"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text hover:text-text-secondary transition-colors"
              aria-label="Instagram"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </a>
            {/* Facebook */}
            <a
              href="https://facebook.com/blini.home"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text hover:text-text-secondary transition-colors"
              aria-label="Facebook"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Main grid: 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand description */}
          <div>
            <p className="text-sm text-text-secondary leading-relaxed">
              BLINI HOME sjell produkte cilësore për shtëpinë, familjen dhe veten tuaj
              me çmimet më të mira në Kosovë. Porositni online dhe paguani me para
              në dorë kur t&apos;ju vijë porosia.
            </p>
          </div>

          {/* Col 2: About us */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Rreth nesh</h4>
            <nav className="space-y-2.5">
              <Link href="/rreth-nesh" className="block text-sm text-text-secondary hover:text-text hover:underline transition-colors">
                Kush jemi
              </Link>
              <Link href="/kontakt" className="block text-sm text-text-secondary hover:text-text hover:underline transition-colors">
                Na kontaktoni
              </Link>
              <Link href="/puna" className="block text-sm text-text-secondary hover:text-text hover:underline transition-colors">
                Punë
              </Link>
            </nav>
          </div>

          {/* Col 3: Help & information */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Ndihmë & informata</h4>
            <nav className="space-y-2.5">
              <Link href="/dergimi" className="block text-sm text-text-secondary hover:text-text hover:underline transition-colors">
                Dërgimi
              </Link>
              <Link href="/kthimi" className="block text-sm text-text-secondary hover:text-text hover:underline transition-colors">
                Kthimi i produkteve
              </Link>
              <Link href="/pyetje" className="block text-sm text-text-secondary hover:text-text hover:underline transition-colors">
                Pyetje të shpeshta
              </Link>
              <Link href="/privatesia" className="block text-sm text-text-secondary hover:text-text hover:underline transition-colors">
                Privatësia
              </Link>
              <Link href="/kushtet" className="block text-sm text-text-secondary hover:text-text hover:underline transition-colors">
                Kushtet e përdorimit
              </Link>
            </nav>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Regjistrohu për newsletter!
            </h4>
            <p className="text-sm text-text-secondary mb-3">
              Merr ofertat më të mira direkt në email.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEmail("");
              }}
              className="flex"
            >
              <input
                type="email"
                placeholder="Email adresa juaj"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-10 px-3 text-sm bg-white border border-border outline-none focus:border-text rounded-l-[5px]"
              />
              <button
                type="submit"
                className="h-10 px-4 bg-accent text-white text-sm font-medium rounded-r-[5px] hover:opacity-90 transition-opacity"
              >
                Regjistrohu
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary">
            &copy; 2026 BLINI HOME. Të gjitha të drejtat e rezervuara.
          </p>
          <div className="flex items-center gap-3 text-xs text-text-secondary">
            <span>Para në dorë (COD)</span>
            <span>&middot;</span>
            <span>Transfertë bankare</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
