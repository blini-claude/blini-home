import Link from "next/link";
import { CheckoutForm } from "./checkout-form";

export const metadata = {
  title: "Porosia — BLINI HOME",
};

export default function CheckoutPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <nav className="text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-text">Kryefaqja</Link>
        <span className="mx-2">/</span>
        <span className="text-text">Porosia</span>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight mb-8">Porosia</h1>

      <CheckoutForm />
    </div>
  );
}
