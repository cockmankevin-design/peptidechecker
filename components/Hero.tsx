import Link from "next/link";
import Vial from "./Vial";

export default function Hero() {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden">
      {/* ground: a near-black wash with a single cyan pool behind the vial, so the glassware
          looks lit from within the page rather than sitting on a flat colour */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_10%,#151a21_0%,#0a0c0f_58%)]" />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-brand-accent/10 blur-[120px]" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* headline */}
          <div className="lg:col-span-5">
            <h1
              className="pc-reveal font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-brand-text-heading leading-[1.05] tracking-tight"
              style={{ animationDelay: "0.05s" }}
            >
              Independently
              <br />
              <span className="text-brand-accent">Verified</span>
              <br />
              Peptides
            </h1>
            <div
              className="pc-reveal mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.25s" }}
            >
              <Link
                href="/peptides"
                className="group inline-flex items-center gap-2 bg-brand-accent text-brand-bg font-semibold pl-6 pr-2 py-2.5 rounded-full hover:bg-brand-accent-hover transition-colors"
              >
                Browse products
                <span className="grid place-items-center w-8 h-8 rounded-full bg-brand-bg/15 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H9m8 0v8" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/results"
                className="inline-flex items-center gap-2 border border-brand-border text-brand-text px-6 py-3 rounded-full hover:border-brand-accent hover:text-brand-accent transition-colors"
              >
                View lab reports
              </Link>
            </div>
          </div>

          {/* vial */}
          <div className="lg:col-span-4 order-first lg:order-none">
            <Vial className="pc-reveal mx-auto w-[220px] sm:w-[280px] lg:w-full max-w-[340px]" />
          </div>

          {/* supporting copy */}
          <div className="lg:col-span-3">
            <p
              className="pc-reveal text-brand-text-secondary leading-relaxed"
              style={{ animationDelay: "0.4s" }}
            >
              Every vendor here is scored from independent third-party lab testing &mdash; purity,
              batch consistency, and COA transparency. Anything below 7 out of 10 is not listed.
            </p>
            <div
              className="pc-reveal mt-8 flex items-center gap-6"
              style={{ animationDelay: "0.5s" }}
            >
              <div>
                <p className="font-heading text-3xl font-bold text-brand-text-heading">7.0+</p>
                <p className="text-xs uppercase tracking-widest text-brand-gold mt-1">Minimum score</p>
              </div>
              <div className="w-px h-12 bg-brand-border" />
              <div>
                <p className="font-heading text-3xl font-bold text-brand-text-heading">0</p>
                <p className="text-xs uppercase tracking-widest text-brand-gold mt-1">Paid placements</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="pc-reveal mt-14 lg:mt-20 flex items-center gap-3 border border-brand-border bg-brand-surface/60 backdrop-blur rounded-xl px-4 py-3 max-w-xl"
          style={{ animationDelay: "0.6s" }}
        >
          <span className="grid place-items-center w-9 h-9 shrink-0 rounded-lg bg-brand-accent-dim">
            <svg className="w-5 h-5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <p className="text-sm text-brand-text-secondary">
            Figures shown across this site are placeholder sample data until the first real lab
            results are published. Every one is marked.
          </p>
        </div>
      </div>
    </section>
  );
}
