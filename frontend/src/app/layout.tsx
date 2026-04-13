import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "PrimeTrade | Premium Signals & Market Analysis",
  description: "Experience the pinnacle of trading with PrimeTrade. Real-time NIFTY, BANKNIFTY, and SENSEX signals from elite sources. Luxury trading at your fingertips.",
  keywords: ["PrimeTrade Signals", "Premium Signals India", "BankNifty Elite Alerts", "Trading Tools"],
  openGraph: {
    title: "PrimeTrade | Premium Terminal",
    description: "Premium signals for the modern trader.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} ${outfit.variable} font-inter antialiased`}>
        <div className="bg-glow" aria-hidden="true" />
        <div className="particles" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
