import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading-src", // consumed by --font-heading in globals.css @theme
  weight: ["600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body-src", // consumed by --font-body in globals.css @theme
});

export const metadata: Metadata = {
  title: "PeptideChecker — Independently Verified Peptide Sources",
  description:
    "Independently verified peptide vendors. Third-party lab tested. No vendor funding. Safety first.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="font-body">
        <Header />
        <div className="pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
