export const metadata = { title: "Kushtet e përdorimit — BLINI HOME" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Kushtet e përdorimit</h1>
      <div className="space-y-6 text-[16px] leading-[1.8] text-text-secondary">
        <p>Duke përdorur faqen BLINI HOME, ju pranoni këto kushte.</p>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Porositë</h2>
          <p>Të gjitha porositë janë të vlefshme pasi të konfirmohen nga ekipi ynë. Çmimet mund të ndryshojnë pa njoftim paraprak.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Pagesa</h2>
          <p>Pagesa bëhet vetëm me para në dorë (COD) kur ta merrni produktin. Nuk pranojmë pagesa online.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Produktet</h2>
          <p>Ne jemi agregator — produktet vijnë nga furnizues të ndryshëm. Bëjmë përpjekje për saktësinë e informacionit por nuk garantojmë disponueshmërinë.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text mb-2">Përgjegjësia</h2>
          <p>BLINI HOME nuk mban përgjegjësi për vonesa të shkaktuara nga furnizuesit ose shërbimet e dërgimit.</p>
        </div>
      </div>
    </div>
  );
}
