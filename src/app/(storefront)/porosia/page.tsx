import Link from "next/link";
import { CheckoutForm } from "./checkout-form";

export const metadata = {
  title: "Porosia — BLINI HOME",
};

export default function CheckoutPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-text flex items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
        </Link>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary/50">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className="text-text">Porosia</span>
      </nav>

      <h1 className="text-4xl font-extrabold tracking-tight mb-8">Porosia</h1>

      <CheckoutForm />
    </div>
  );
}
