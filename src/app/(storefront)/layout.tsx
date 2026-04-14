import { CartProvider } from "@/contexts/cart-context";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { Header } from "@/components/storefront/header";
import { Navigation } from "@/components/storefront/navigation";
import { Footer } from "@/components/storefront/footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <AnnouncementBar />
      <Header />
      <Navigation />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </CartProvider>
  );
}
