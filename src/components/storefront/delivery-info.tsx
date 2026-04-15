"use client";

import { StaggerContainer, StaggerItem } from "./motion";

export function DeliveryInfo() {
  return (
    <section className="mt-4">
      <div className="px-5 py-8 mx-auto" style={{ maxWidth: 1440 }}>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StaggerItem>
          <div className="flex items-center gap-4 px-5 py-4 rounded-[8px] bg-[#E8F0E4]">
            <div className="w-[42px] h-[42px] rounded-full bg-white/70 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#062F35]">Dërgim i shpejtë</p>
              <p className="text-[12px] text-[rgba(18,18,18,0.5)]">1-3 ditë punë në të gjithë Kosovën</p>
            </div>
          </div>
          </StaggerItem>

          <StaggerItem>
          <div className="flex items-center gap-4 px-5 py-4 rounded-[8px] bg-[#FFF0E0]">
            <div className="w-[42px] h-[42px] rounded-full bg-white/70 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#062F35]">Para në dorë (COD)</p>
              <p className="text-[12px] text-[rgba(18,18,18,0.5)]">Paguani kur ta merrni produktin</p>
            </div>
          </div>
          </StaggerItem>

          <StaggerItem>
          <div className="flex items-center gap-4 px-5 py-4 rounded-[8px] bg-[#E0EBF5]">
            <div className="w-[42px] h-[42px] rounded-full bg-white/70 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#062F35]">Kthim falas</p>
              <p className="text-[12px] text-[rgba(18,18,18,0.5)]">14 ditë për kthimin e produkteve</p>
            </div>
          </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
