import Image from "next/image";
import Link from "next/link";

import { asset } from "@/lib/basePath";

/* The big editorial statement below the fold.

   The photography is stock (Unsplash, free for commercial use), used as category illustration
   only. It is never captioned or framed as our facility, our equipment or our testing - the
   same standard that forced the vendor data to be anonymised. Credits are in the footer. */

const categories = [
  { label: "Recovery & repair", href: "/peptides" },
  { label: "Metabolic", href: "/peptides" },
  { label: "Fat loss", href: "/peptides" },
];

export default function Statement() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">About us</p>

      <h2 className="mt-6 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight max-w-4xl">
        <span className="text-brand-text-heading">PeptideChecker exists because </span>
        <span className="text-brand-text-secondary">a certificate of analysis nobody ever checks is
        just a claim with a logo on it. </span>
        <span className="text-brand-text-heading">We read them, and only list what holds up.</span>
      </h2>

      <div className="mt-14 grid md:grid-cols-5 gap-6">
        {/* Stock laboratory photography, deliberately generic. It illustrates the category, it
            is NOT presented as our facility or our testing - the same line that forced the
            vendor anonymisation. The caption text never claims otherwise. */}
        <div className="md:col-span-3 relative overflow-hidden rounded-2xl border border-brand-border bg-brand-surface min-h-[340px] flex items-end p-8">
          <Image
            src={asset("/images/lab-analysis.jpg")}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
            priority={false}
          />
          {/* Scrim: the headline sits on top of the photo and needs guaranteed contrast at any
              crop, so this is a gradient rather than a flat tint. */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/75 to-brand-bg/25" />
          <div className="relative">
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-brand-text-heading">
              Trust, transparency, results
            </h3>
            <p className="mt-2 text-sm text-brand-text-secondary max-w-md">
              Purity, batch consistency, COA transparency, price and shipping, weighted into one
              score. The formula is published, not proprietary.
            </p>
            <Link
              href="/methodology"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
            >
              Read the methodology
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H9m8 0v8" />
              </svg>
            </Link>
          </div>
        </div>

        {/* category card */}
        <div className="md:col-span-2 relative overflow-hidden rounded-2xl border border-brand-border bg-brand-surface p-8 flex flex-col">
          <Image
            src={asset("/images/microscope.jpg")}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-surface/70 to-brand-surface" />
          <h3 className="relative font-heading text-2xl font-bold text-brand-text-heading">Browse by goal</h3>
          <p className="relative mt-2 text-sm text-brand-text-secondary">
            Every listing carries its trust score and the lab report behind it.
          </p>
          <div className="relative mt-auto pt-8 space-y-3">
            {categories.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="group flex items-center justify-between gap-3 rounded-full border border-brand-border px-5 py-3 text-sm text-brand-text hover:border-brand-accent hover:text-brand-accent transition-colors"
              >
                {c.label}
                <svg
                  className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H9m8 0v8" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
