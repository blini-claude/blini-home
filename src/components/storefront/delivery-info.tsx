export function DeliveryInfo() {
  return (
    <section className="bg-delivery-bg py-8 mt-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <h3 className="text-[15px] font-semibold">Dërgim i shpejtë</h3>
            <p className="text-sm text-text-secondary">1-3 ditë pune në të gjithë Kosovën</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
            <h3 className="text-[15px] font-semibold">Paguaj me para në dorë</h3>
            <p className="text-sm text-text-secondary">Paguani kur ta merrni produktin</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <h3 className="text-[15px] font-semibold">Kthim falas</h3>
            <p className="text-sm text-text-secondary">14 ditë për kthimin e produkteve</p>
          </div>
        </div>
      </div>
    </section>
  );
}
