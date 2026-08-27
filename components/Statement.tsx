import Link from "next/link";

/* The big editorial statement below the fold. The reference layout carries lab photography
   here; there is none licensed for this site, so the left panel is built from a drawn
   molecular lattice instead of a stock photo standing in for a lab we do not have. */

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
        <span className="text-brand-text-secondary">a certificate of analysis from the seller
        is not evidence. </span>
        <span className="text-brand-text-heading">We buy the product ourselves and pay for the test.</span>
      </h2>

      <div className="mt-14 grid md:grid-cols-5 gap-6">
        {/* drawn lattice panel */}
        <div className="md:col-span-3 relative overflow-hidden rounded-2xl border border-brand-border bg-brand-surface min-h-[280px] flex items-end p-8">
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.22]"
            viewBox="0 0 600 320"
            fill="none"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="st-lattice" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#29c5f6" />
                <stop offset="100%" stopColor="#c2a15e" />
              </linearGradient>
            </defs>
            <g stroke="url(#st-lattice)" strokeWidth="1.2">
              <path d="M60 240l70-40 70 40 70-40 70 40 70-40 70 40" />
              <path d="M60 160l70-40 70 40 70-40 70 40 70-40 70 40" />
              <path d="M130 200v-80M270 200v-80M410 200v-80M200 240v-80M340 240v-80M480 240v-80" />
            </g>
            <g fill="url(#st-lattice)">
              {[60, 130, 200, 270, 340, 410, 480].map((x, i) => (
                <circle key={`a${x}`} cx={x} cy={i % 2 ? 200 : 240} r="5" />
              ))}
              {[60, 130, 200, 270, 340, 410, 480].map((x, i) => (
                <circle key={`b${x}`} cx={x} cy={i % 2 ? 120 : 160} r="5" />
              ))}
            </g>
          </svg>
          <div className="relative">
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-brand-text-heading">
              Trust, transparency, results
            </h3>
            <p className="mt-2 text-sm text-brand-text-secondary max-w-md">
              Purity, batch consistency and COA transparency, weighted into one score. The formula
              is published, not proprietary.
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
        <div className="md:col-span-2 rounded-2xl border border-brand-border bg-brand-surface p-8 flex flex-col">
          <h3 className="font-heading text-2xl font-bold text-brand-text-heading">Browse by goal</h3>
          <p className="mt-2 text-sm text-brand-text-secondary">
            Every listing carries its trust score and the lab report behind it.
          </p>
          <div className="mt-auto pt-8 space-y-3">
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
