export const metadata = { title: "Kthimi i produkteve — BLINI HOME" };

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Kthimi i produkteve</h1>
      <div className="space-y-6 text-[16px] leading-[1.8] text-text-secondary">
        <p>Keni 14 ditë nga dita e marrjes së produktit për ta kthyer atë.</p>
        <div>
          <h2 className="text-xl font-bold text-text mb-2">Kushtet e kthimit</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Produkti duhet të jetë i papërdorur dhe në paketimin origjinal</li>
            <li>Duhet të ruani faturën ose konfirmimin e porosisë</li>
            <li>Kthimi është falas — ne e mbulojmë koston e dërgimit</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-bold text-text mb-2">Si të ktheni një produkt</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Na kontaktoni në info@blini.world ose +383 44 000 000</li>
            <li>Përshkruani arsyen e kthimit</li>
            <li>Do t&apos;ju dërgojmë kodin për kthim</li>
            <li>Rimbursimi bëhet brenda 5-7 ditëve pune</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
