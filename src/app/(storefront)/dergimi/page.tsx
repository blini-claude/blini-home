export const metadata = { title: "Dërgimi — BLINI HOME" };

export default function DeliveryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Dërgimi</h1>
      <div className="space-y-6 text-[16px] leading-[1.8] text-text-secondary">
        <div>
          <h2 className="text-xl font-bold text-text mb-2">Koha e dërgimit</h2>
          <p>Dërgimi bëhet brenda 1-3 ditëve pune pas konfirmimit të porosisë.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold text-text mb-2">Çmimi i dërgimit</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Porosi mbi €30:</strong> Dërgim FALAS</li>
            <li><strong>Porosi nën €30:</strong> €2.50</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-bold text-text mb-2">Zonat e dërgimit</h2>
          <p>Dërgojmë në të gjitha qytetet e Kosovës: Prishtinë, Prizren, Pejë, Mitrovicë, Gjilan, Ferizaj, Gjakovë dhe qytetet tjera.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold text-text mb-2">Pagesa</h2>
          <p>Pagesa bëhet me para në dorë (COD) kur ta merrni produktin nga korieri.</p>
        </div>
      </div>
    </div>
  );
}
