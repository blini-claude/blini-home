export const metadata = { title: "Pyetje të shpeshta — BLINI HOME" };

const FAQS = [
  {
    q: "Si mund të porosisë?",
    a: "Zgjidhni produktin, shtojeni në shportë, plotësoni formularin e porosisë dhe konfirmoni. Do t'ju kontaktojmë me telefon.",
  },
  {
    q: "Si paguhet?",
    a: "Pagesa bëhet vetëm me para në dorë (Cash on Delivery). Paguani kur ta merrni produktin nga korieri.",
  },
  {
    q: "Sa zgjat dërgimi?",
    a: "Dërgimi bëhet brenda 1-3 ditëve pune në të gjithë Kosovën.",
  },
  {
    q: "A mund ta kthej produktin?",
    a: "Po, keni 14 ditë për kthimin e produkteve. Produkti duhet të jetë i papërdorur dhe në paketimin origjinal.",
  },
  {
    q: "A ka dërgim falas?",
    a: "Po! Dërgimi është falas për porosi mbi €30. Për porosi nën €30, dërgimi kushton €2.50.",
  },
  {
    q: "Si mund t'ju kontaktoj?",
    a: "Na shkruani në info@blini.world ose na thirrni në +383 44 000 000.",
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Pyetje të shpeshta</h1>
      <div className="space-y-6">
        {FAQS.map((faq, i) => (
          <div key={i} className="border-b border-border pb-6">
            <h2 className="text-[17px] font-bold mb-2">{faq.q}</h2>
            <p className="text-text-secondary text-[16px] leading-[1.8]">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
