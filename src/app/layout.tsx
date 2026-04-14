import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BLINI HOME — Gjithçka për Shtëpinë",
  description:
    "Gjithçka që ju nevojitet për shtëpinë, familjen dhe veten — me çmimet më të mira në Kosovë.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sq" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
