import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-text text-white mt-16">
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-semibold mb-3">BLINI HOME</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Gjithçka që ju nevojitet për shtëpinë, familjen dhe veten — me çmimet më të mira në Kosovë.
            </p>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Rreth nesh</h4>
            <nav className="space-y-2">
              <Link href="/rreth-nesh" className="block text-sm text-gray-400 hover:text-white">Kush jemi</Link>
              <Link href="/dergimi" className="block text-sm text-gray-400 hover:text-white">Dërgimi</Link>
              <Link href="/kthimi" className="block text-sm text-gray-400 hover:text-white">Kthimi i produkteve</Link>
            </nav>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Ndihmë</h4>
            <nav className="space-y-2">
              <Link href="/pyetje" className="block text-sm text-gray-400 hover:text-white">Pyetje të shpeshta</Link>
              <Link href="/privatesia" className="block text-sm text-gray-400 hover:text-white">Privatësia</Link>
              <Link href="/kushtet" className="block text-sm text-gray-400 hover:text-white">Kushtet e përdorimit</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Kontakti</h4>
            <p className="text-sm text-gray-400">info@blini.world</p>
            <p className="text-sm text-gray-400 mt-1">+383 44 000 000</p>
            <div className="flex gap-3 mt-4">
              <span className="text-gray-400 text-sm">Instagram</span>
              <span className="text-gray-400 text-sm">Facebook</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-center">
          <p className="text-xs text-gray-500">© 2026 BLINI HOME. Të gjitha të drejtat e rezervuara.</p>
        </div>
      </div>
    </footer>
  );
}
