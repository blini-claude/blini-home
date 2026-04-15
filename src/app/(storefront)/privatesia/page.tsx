export const metadata = { title: "Privatësia — BLINI HOME" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Politika e privatësisë</h1>
      <div className="space-y-6 text-[16px] leading-[1.8] text-text-secondary">
        <p>BLINI HOME respekton privatësinë tuaj. Kjo politikë shpjegon se si i mbledhim, përdorim dhe mbrojmë të dhënat tuaja personale.</p>
        <div>
          <h2 className="text-xl font-bold text-text mb-2">Të dhënat që mbledhim</h2>
          <p>Kur bëni një porosi, mbledhim: emrin, numrin e telefonit, adresën e dërgimit, dhe email-in (opsional).</p>
        </div>
        <div>
          <h2 className="text-xl font-bold text-text mb-2">Si i përdorim</h2>
          <p>Të dhënat përdoren vetëm për përpunimin e porosive dhe dërgimin e produkteve. Nuk i ndajmë të dhënat me palë të treta.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold text-text mb-2">Kontakti</h2>
          <p>Për çdo pyetje rreth privatësisë, na kontaktoni në info@blini.world.</p>
        </div>
      </div>
    </div>
  );
}
