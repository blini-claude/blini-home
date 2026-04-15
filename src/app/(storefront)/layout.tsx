import { CartProvider } from "@/contexts/cart-context";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { WhatsAppWidget } from "@/components/storefront/whatsapp-widget";
import { getSiteSettings } from "@/lib/site-settings";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <CartProvider>
      <AnnouncementBar text={settings.announcementText} />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppWidget
        number={settings.whatsappNumber}
        enabled={settings.whatsappEnabled}
      />
    </CartProvider>
  );
}
