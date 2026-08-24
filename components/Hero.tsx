import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-bg via-brand-surface to-brand-bg" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-2xl">
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-brand-text-heading leading-[1.1]">
            Verified
            <br />
            <span className="text-brand-accent">Peptides</span>
          </h1>
          <p className="mt-6 text-lg text-brand-text-secondary max-w-md">
            Explore independently tested peptide sources. Every vendor verified by third-party labs — trusted by researchers worldwide.
          </p>
          <Link
            href="/peptides"
            className="mt-8 inline-flex items-center gap-2 bg-brand-accent text-brand-bg font-semibold px-6 py-3 rounded-full hover:bg-brand-accent-hover transition-colors"
          >
            Browse Products
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="absolute bottom-8 right-8 hidden lg:flex items-center gap-3 bg-white/95 text-gray-900 rounded-lg px-4 py-3 shadow-lg max-w-sm">
          <div className="w-8 h-8 shrink-0 bg-brand-accent/20 rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm">View Lab Reports</p>
            <p className="text-xs text-gray-500">All products undergo rigorous third-party lab testing for purity, potency, and safety.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
