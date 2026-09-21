import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";

import "./globals.css";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";

/* Instrument Sans over the usual grotesques: it has genuinely tight, precise
   forms at display sizes without the neutrality of Inter, which suits a company
   whose whole claim is precision. JetBrains Mono carries every machine record -
   lot numbers, COA references, statuses, dates - so evidence is recognisable by
   its shape before it is read. */
const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans-src",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-src",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PeptideChecker — Independent COA Verification",
  description:
    "A certificate is not proof. PeptideChecker checks that a vendor's certificate of analysis is real, names its lab, and belongs to the lot actually being sold — and publishes the ones that fail.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        {/* Keyboard users should reach content without tabbing the whole nav. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
