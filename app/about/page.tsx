import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-3">About</p>
        <h1 className="font-heading text-4xl font-bold text-brand-text-heading">Why PeptideChecker Exists</h1>

        <div className="mt-8 space-y-6 text-brand-text-secondary leading-relaxed">
          <p>
            PeptideChecker started with a bad batch and a scared phone call. A close friend ordered BPC-157 from a
            vendor he&apos;d found through a forum recommendation — no COA, no third-party testing, just a product
            page and a checkout button. Two weeks in, he was in urgent care with symptoms his doctor couldn&apos;t
            immediately explain. When we finally had the batch independently tested, it wasn&apos;t what the label
            said it was.
          </p>
          <p>
            That was the moment &ldquo;just check the reviews&rdquo; stopped being good enough for me. The peptide
            research supply market has no FDA oversight, no standardized testing requirement, and no central
            authority separating vendors who actually verify their product from vendors who just say they do.
            Anyone can put &ldquo;third-party tested&rdquo; on a product page. Almost nobody links to the actual lab
            report.
          </p>
          <p>
            So I built the resource I wish had existed before that phone call: one place that gathers the
            sellers who publish real, named-lab testing — HPLC purity, mass spec confirmation, endotoxin
            screening — checks those certificates actually hold up, and ranks what is left.
          </p>

          <h2 className="font-heading text-2xl font-bold text-brand-text-heading pt-4">Our Mission</h2>
          <p>
            PeptideChecker doesn&apos;t sell peptides and doesn&apos;t run a lab. We read the lab reports sellers
            publish, check they are real and lot-specific, and score what survives against price and shipping.
            Every listing sits at 7 or higher out of 10 — no seller can pay for placement, and a listing whose
            evidence stops checking out is removed. Our job is to make it obvious, at a glance, which sources
            have evidence behind them and which just have claims.
          </p>

          <p>
            Curious exactly how a vendor earns a trust score, or which labs we work with? Read our{" "}
            <Link href="/methodology" className="text-brand-accent hover:underline">
              Methodology
            </Link>{" "}
            page for the full breakdown.
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
