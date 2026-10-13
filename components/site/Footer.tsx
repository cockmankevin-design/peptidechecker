import Link from "next/link";

/* Footer.

   Carries the three disclosures that are load-bearing for this business rather
   than boilerplate: that it sells nothing, that it runs no laboratory, and how
   it earns. A verification company that buries its revenue model has the same
   problem as a vendor that buries its lot number. */

const COLUMNS = [
  {
    heading: "Directory",
    links: [
      { href: "/approved", label: "Approved medicines" },
      { href: "/pipeline", label: "Coming soon" },
      { href: "/get-started", label: "How to get one" },
      { href: "/cost", label: "Cost" },
    ],
  },
  {
    heading: "How it works",
    links: [
      { href: "/methodology", label: "Vendor verification method" },
      { href: "/vendors", label: "Vendor evidence" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/methodology#funding", label: "How we make money" },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="site-footer" className="relative z-[1] border-t border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-8 sm:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="col-span-2 max-w-xs sm:col-span-1">
            <p className="text-[15px] font-semibold tracking-tight text-text">PeptideChecker</p>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">
              An independent reference for FDA-approved peptide medicines and the legal routes to
              get one, plus an evidence layer on the unregulated sellers people search for instead.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">
                {col.heading}
              </p>
              <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-[14px] text-muted transition-colors hover:text-text"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-8 border-t border-line pt-6 sm:mt-14 sm:pt-8">
          <div className="flex flex-col gap-1.5 sm:gap-3 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="font-mono text-[11px] text-dim">
              © {new Date().getFullYear()} PeptideChecker
            </p>
            <p className="font-mono text-[11px] text-dim">
              Not medical advice · Talk to a clinician about treatment
            </p>
          </div>

          <p className="mt-4 max-w-3xl text-[12.5px] sm:mt-5 leading-relaxed text-dim">
            PeptideChecker publishes regulatory information. It is not medical advice, and it is
            not a pharmacy — we do not sell, prescribe, test or handle any medicine. We intend to
            earn affiliate commission when a reader signs up with a licensed telehealth provider. No
            provider pays us yet, and any paid link will be marked; commission never changes a
            price, a fact, or an evidence
            outcome on the unregulated-seller pages, which carry no affiliate or purchase links at
            all.
          </p>
        </div>
      </div>
    </footer>
  );
}
