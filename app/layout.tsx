import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DealHub - Find the Best Daily Deals Near You",
  description: "Discover amazing deals on restaurants, gas stations, grocery stores, and coffee shops. Find the best discounts closest to you, highest savings, and trending deals.",
  keywords: "deals, discounts, restaurants, gas stations, grocery, coffee, daily deals, savings, coupons",
  authors: [{ name: "DealHub" }],
  openGraph: {
    title: "DealHub - Find the Best Daily Deals Near You",
    description: "Discover amazing deals on restaurants, gas stations, grocery stores, and coffee shops.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DealHub - Find the Best Daily Deals Near You",
    description: "Discover amazing deals on restaurants, gas stations, grocery stores, and coffee shops.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

