import Link from "next/link";

/* Footer.

   Carries the three disclosures that are load-bearing for this business rather
   than boilerplate: that it sells nothing, that it runs no laboratory, and how
   it earns. A verification company that buries its revenue model has the same
   problem as a vendor that buries its lot number. */

const COLUMNS = [
  {
    heading: "Registry",
    links: [
      { href: "/vendors", label: "Vendor registry" },
      { href: "/results", label: "Certificates" },
      { href: "/compare", label: "Compare sources" },
    ],
  },
  {
    heading: "How it works",
    links: [
      { href: "/methodology", label: "Verification method" },
      { href: "/faq", label: "FAQ" },
      { href: "/blog", label: "Writing" },
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
    <footer className="border-t border-line bg-surface/40">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <p className="text-[15px] font-semibold tracking-tight text-text">PeptideChecker</p>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">
              An independent verification layer. We check that a certificate of analysis is real,
              names its laboratory, and belongs to the lot being sold.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">
                {col.heading}
              </p>
              <ul className="mt-4 space-y-2.5">
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

        <div className="mt-14 border-t border-line pt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="font-mono text-[11px] text-dim">
              © {new Date().getFullYear()} PeptideChecker
            </p>
            <p className="font-mono text-[11px] text-dim">
              Research use only · Not for human consumption
            </p>
          </div>

          <p className="mt-5 max-w-3xl text-[12.5px] leading-relaxed text-dim">
            PeptideChecker does not sell, manufacture or ship peptides, operates no laboratory, and
            commissions no testing — it verifies evidence that already exists. We earn affiliate
            commission on referrals to listed vendors; commission never affects a verification
            outcome, and a vendor whose evidence fails is removed regardless of revenue. Nothing
            here is medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
