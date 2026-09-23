import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono } from "next/font/google";

import "./globals.css";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";

/* Geist over Instrument Sans: sharper, less neutral, and not the default a
   template generator reaches for. IBM Plex Mono over JetBrains Mono for the
   same reason on the evidence voice - it carries real type-design pedigree
   rather than reading as "the default code-editor font." Every machine
   record - lot numbers, COA references, statuses, dates - is set in it, so
   evidence is recognisable by its shape before it is read. */
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans-src",
  display: "swap",
});

const mono = IBM_Plex_Mono({
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
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-bg"
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
