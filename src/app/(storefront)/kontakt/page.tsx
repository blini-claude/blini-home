import Link from "next/link";

export const metadata = { title: "Na kontaktoni — BLINI HOME" };

export default function ContactPage() {
  return (
    <div className="px-5 mx-auto py-10 md:py-16" style={{ maxWidth: 800 }}>
      <h1 className="text-[28px] md:text-[36px] font-bold text-[#062F35] tracking-[-1.5px] leading-tight mb-6">
        Na kontaktoni
      </h1>

      <div className="space-y-6 text-[15px] text-[rgba(18,18,18,0.7)] leading-[1.8]">
        <p>
          Keni pyetje rreth porosisë, produkteve apo dërgimit? Na kontaktoni dhe do t&apos;ju
          përgjigjemi sa më shpejt.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-4 p-5 rounded-[8px] bg-[#E8F0E4]">
            <div className="w-[42px] h-[42px] rounded-full bg-white/70 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#062F35] mb-1">Email</p>
              <a href="mailto:info@blini.world" className="text-[14px] text-[rgba(18,18,18,0.6)] hover:text-[#062F35] transition-colors">
                info@blini.world
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-[8px] bg-[#FFF0E0]">
            <div className="w-[42px] h-[42px] rounded-full bg-white/70 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#062F35] mb-1">WhatsApp</p>
              <a href="https://wa.me/38344123456" className="text-[14px] text-[rgba(18,18,18,0.6)] hover:text-[#062F35] transition-colors">
                +383 44 123 456
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-[8px] bg-[#E0EBF5]">
            <div className="w-[42px] h-[42px] rounded-full bg-white/70 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="#062F35" stroke="none" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#062F35] mb-1">Instagram</p>
              <a href="https://instagram.com/blini.home" target="_blank" rel="noopener noreferrer" className="text-[14px] text-[rgba(18,18,18,0.6)] hover:text-[#062F35] transition-colors">
                @blini.home
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-[8px] bg-[#F5E0EA]">
            <div className="w-[42px] h-[42px] rounded-full bg-white/70 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#062F35] mb-1">Orari</p>
              <p className="text-[14px] text-[rgba(18,18,18,0.6)]">
                E Hënë - E Shtunë: 09:00 - 18:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
