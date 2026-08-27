import Link from "next/link";

/* No origin story here on purpose.

   This page previously opened with an invented anecdote about a friend hospitalised by a bad
   batch. It was fiction presented as the founder's own experience, which is the same problem
   as the fabricated lab data and the "we test the products ourselves" copy - a claim the site
   cannot stand behind. The market argument below is true on its own and needs no victim. */

export default function AboutPage() {
  return (
    <main className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-3">About</p>
        <h1 className="font-heading text-4xl font-bold text-brand-text-heading">Why PeptideChecker Exists</h1>

        <div className="mt-8 space-y-6 text-brand-text-secondary leading-relaxed">
          <p>
            The research peptide market has no FDA oversight, no standardised testing requirement, and no
            central authority separating sellers who genuinely verify their product from sellers who simply
            say they do. Anyone can print &ldquo;third-party tested&rdquo; on a product page. Far fewer publish
            the actual report, and fewer still publish one tied to the specific lot you would receive.
          </p>
          <p>
            That gap is the whole reason this site exists. Checking it properly means opening every
            certificate, confirming it names a real laboratory, and confirming it refers to the batch on sale
            rather than being one generic PDF reused across every product. It is tedious, and almost nobody
            buying does it.
          </p>
          <p>
            So PeptideChecker does it once, in one place, and publishes what survives &mdash; alongside the
            price and the shipping, because the safest option is not much use if it is unaffordable or never
            arrives.
          </p>

          <h2 className="font-heading text-2xl font-bold text-brand-text-heading pt-4">Our Mission</h2>
          <p>
            PeptideChecker doesn&apos;t sell peptides and doesn&apos;t run a lab. We read the lab reports
            sellers publish, check they are real and lot-specific, and score what survives against price and
            shipping. Every listing sits at 7 or higher out of 10 &mdash; no seller can pay for placement, and
            a listing whose evidence stops checking out is removed. Our job is to make it obvious, at a glance,
            which sources have evidence behind them and which just have claims.
          </p>
          <p>
            We earn affiliate commission when you buy through a link here. It is our only revenue, it never
            moves a score, and the{" "}
            <Link href="/methodology" className="text-brand-accent hover:underline">
              Methodology
            </Link>{" "}
            page sets out exactly how a score is calculated and what keeps the commission away from it.
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-brand-border">
          <p className="text-xs text-brand-text-secondary">
            PeptideChecker does not sell peptides and does not provide medical advice.
          </p>
        </div>
      </div>
    </main>
  );
}
