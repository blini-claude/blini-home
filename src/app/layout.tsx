import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://home.blini.world";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "BLINI HOME — Gjithçka për Shtëpinë",
  description:
    "Gjithçka që ju nevojitet për shtëpinë, familjen dhe veten — me çmimet më të mira në Kosovë.",
  ...(process.env.GSC_SITE_VERIFICATION
    ? { verification: { google: process.env.GSC_SITE_VERIFICATION } }
    : {}),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BLINI HOME",
  },
};

export const viewport = {
  themeColor: "#062F35",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sq" className={dmSans.variable}>
      <body className="font-sans">
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
