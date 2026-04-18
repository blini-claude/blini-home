import { CartProvider } from "@/contexts/cart-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { WhatsAppWidget } from "@/components/storefront/whatsapp-widget";
import { NewsletterPopup } from "@/components/storefront/newsletter-popup";
import { InstallPrompt } from "@/components/storefront/install-prompt";
import { getSiteSettings } from "@/lib/site-settings";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const freeShippingThreshold = Number(settings.freeShippingThreshold);

  return (
    <WishlistProvider>
      <CartProvider>
        <AnnouncementBar text={settings.announcementText} />
        <Header freeShippingThreshold={freeShippingThreshold} />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppWidget
          number={settings.whatsappNumber}
          enabled={settings.whatsappEnabled}
        />
        {settings.newsletterPopupEnabled && (
          <NewsletterPopup discountPct={settings.newsletterDiscountPct} />
        )}
        <InstallPrompt />
      </CartProvider>
    </WishlistProvider>
  );
}
