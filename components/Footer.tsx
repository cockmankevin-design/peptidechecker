import Link from "next/link";

const menuLinks = [
  { href: "/", label: "Home" },
  { href: "/peptides", label: "Products" },
  { href: "/vendors", label: "Vendors" },
  { href: "/results", label: "Lab Results" },
  { href: "/faq", label: "FAQ" },
];

const quickLinks = [
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/compare", label: "Compare Vendors" },
  { href: "/blog", label: "Blog" },
];

export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-surface mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="font-heading text-lg font-bold text-brand-text-heading">
              Peptide<span className="text-brand-accent">Checker</span>
            </span>
            <p className="mt-3 text-sm text-brand-text-secondary leading-relaxed">
              Independent peptide verification. We don&apos;t sell peptides — we verify who does. We earn affiliate commission from vendors we list; it never affects a score.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-text-secondary mb-4">Menu</h3>
            <ul className="space-y-2">
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-text-secondary hover:text-brand-text transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-text-secondary mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-text-secondary hover:text-brand-text transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-text-secondary mb-4">Contact</h3>
            <p className="text-sm text-brand-text-secondary">info@peptidechecker.com</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-brand-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-brand-text-secondary">
            &copy; {new Date().getFullYear()} PeptideChecker. All rights reserved.
          </p>
          <p className="text-xs text-brand-text-secondary">
            For research purposes only. Not for human consumption.
          </p>
        </div>

        {/* Unsplash's licence does not require attribution, but crediting the photographers is
            the decent thing and costs a line. Also states plainly that the photography is
            illustrative, so no reader mistakes it for our own facility. */}
        <p className="mt-4 text-[11px] leading-relaxed text-brand-text-secondary/70">
          Laboratory photography is illustrative stock imagery, not a depiction of our own
          facilities or testing. Photographs by ThisisEngineering, Ousa Chea and the CDC via
          Unsplash.
        </p>
      </div>
    </footer>
  );
}
