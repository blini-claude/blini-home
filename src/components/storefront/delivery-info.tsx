export function DeliveryInfo() {
  return (
    <section className="bg-card-bg py-10 mt-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Fast delivery */}
          <div className="flex flex-col items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <h3 className="text-sm font-semibold">Dërgim i shpejtë</h3>
            <p className="text-sm text-text-secondary">1-3 ditë pune në të gjithë Kosovën</p>
          </div>

          {/* Cash on delivery */}
          <div className="flex flex-col items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <h3 className="text-sm font-semibold">Paguaj me para në dorë</h3>
            <p className="text-sm text-text-secondary">Paguani kur ta merrni produktin</p>
          </div>

          {/* Free returns */}
          <div className="flex flex-col items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <h3 className="text-sm font-semibold">Kthim falas</h3>
            <p className="text-sm text-text-secondary">14 ditë për kthimin e produkteve</p>
          </div>
        </div>
      </div>
    </section>
  );
}
