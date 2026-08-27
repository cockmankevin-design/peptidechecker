import Link from "next/link";

const recognisedLabs = [
  {
    name: "Independent Lab A",
    description:
      "Analytical lab specialising in HPLC purity testing and mass spectrometry for the peptide research community, and one of the most widely cited in the space.",
  },
  {
    name: "Independent Lab B",
    description:
      "Offers HPLC and LC-MS testing with public certificate lookup by lot number, so a buyer can confirm a specific batch before ordering.",
  },
  {
    name: "Independent Lab C",
    description:
      "Contract lab providing mass spectrometry and purity analysis for research compounds, including endotoxin and sterility screening.",
  },
];

const formula = [
  {
    label: "Purity (HPLC / LC-MS)",
    weight: "40%",
    description: "The measured purity of the actual compound against what the label claims.",
  },
  {
    label: "COA Transparency",
    weight: "20%",
    description: "Whether certificates of analysis are published, lot-specific, and independently verifiable.",
  },
  {
    label: "Batch-to-Batch Consistency",
    weight: "20%",
    description: "How closely published results for the same product agree across different lots and dates.",
  },
  {
    label: "Pricing",
    weight: "10%",
    description: "Cost relative to the category average, so a seller isn't rewarded purely for being expensive.",
  },
  {
    label: "Shipping Reliability",
    weight: "10%",
    description: "Whether quoted delivery times hold up against what buyers actually report.",
  },
];

export default function MethodologyPage() {
  return (
    <main className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-3">Methodology</p>
        <h1 className="font-heading text-4xl font-bold text-brand-text-heading">How We Verify &amp; Score Sources</h1>
        <p className="mt-4 text-brand-text-secondary leading-relaxed">
          Every source on PeptideChecker is scored the same way, whether it&apos;s a five-year incumbent or a
          listing added last week. No seller pays for placement, and no seller sees or influences its own score
          before it&apos;s published.
        </p>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-brand-text-heading">
            What We Do &mdash; And What We Don&apos;t
          </h2>
          <p className="mt-3 text-brand-text-secondary leading-relaxed">
            Stating this plainly, because it is the difference between a useful score and a marketing one:{" "}
            <strong className="text-brand-text-heading">
              PeptideChecker does not operate a laboratory and does not commission its own testing.
            </strong>{" "}
            We do not buy samples, we do not send them anywhere, and no number on this site comes from a test we
            paid for.
          </p>
          <p className="mt-4 text-brand-text-secondary leading-relaxed">
            What we do is check the evidence that already exists. Anyone can print &ldquo;third-party
            tested&rdquo; on a product page. Far fewer publish the actual report, and fewer still publish one tied
            to the lot you would receive. That gap is the entire job.
          </p>
          <p className="mt-4 text-brand-text-secondary leading-relaxed">
            For a listing to qualify, its certificate of analysis has to survive four checks: the document must
            actually exist and be reachable, not merely referenced; it must name the laboratory that produced it;
            it must identify a specific lot or batch rather than being one generic PDF reused across every
            product; and its results must match what the seller claims on the product page. A certificate that
            fails any of these counts as no certificate at all.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recognisedLabs.map((lab) => (
              <div key={lab.name} className="bg-brand-surface border border-brand-border rounded-xl p-5">
                <p className="font-heading font-bold text-brand-text-heading">{lab.name}</p>
                <p className="mt-2 text-sm text-brand-text-secondary leading-relaxed">{lab.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-brand-text-heading">The Trust Score Formula</h2>
          <p className="mt-3 text-brand-text-secondary leading-relaxed">
            Every trust score out of 10 is a weighted average of five factors:
          </p>
          <div className="mt-6 space-y-3">
            {formula.map((f) => (
              <div
                key={f.label}
                className="bg-brand-surface border border-brand-border rounded-xl p-5 flex items-center gap-4"
              >
                <span className="shrink-0 w-16 text-center font-heading text-lg font-bold text-brand-accent">
                  {f.weight}
                </span>
                <div>
                  <p className="font-semibold text-brand-text-heading">{f.label}</p>
                  <p className="text-sm text-brand-text-secondary mt-1">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-brand-text-heading">How This Site Makes Money</h2>
          <p className="mt-3 text-brand-text-secondary leading-relaxed">
            Stating this plainly, because an independence claim is worth nothing without it:
            PeptideChecker earns affiliate commission when a reader buys from a vendor listed here
            &mdash; the same vendors this site scores. That is our only revenue. No vendor pays for
            placement, for a listing, or for a review.
          </p>
          <p className="mt-4 text-brand-text-secondary leading-relaxed">
            Three rules keep the commission away from the scoring. Every input is a published
            document or a listed figure you can open and check yourself, so no score rests on our word
            alone. No seller sees or reviews a score before it publishes. And the commission rate is
            never an input &mdash; a higher-paying seller and a lower-paying one with identical evidence
            receive identical scores.
          </p>
          <p className="mt-4 text-brand-text-secondary leading-relaxed">
            If a seller we earn commission from has its evidence stop checking out, it is removed.
            That has a direct revenue cost, and it is the point: a verification site that cannot afford
            to delist its own earners is not a verification site.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-brand-text-heading">The 7+ Rule</h2>
          <p className="mt-3 text-brand-text-secondary leading-relaxed">
            A source needs a trust score of 7.0 or higher to appear anywhere on PeptideChecker — in the
            directory, on a product page, or in the comparison table. There is no exception and no paid placement.
            If a score drops below 7 — a certificate withdrawn, a report that no longer matches the lot on sale
            — the listing is removed immediately, not grandfathered in.
          </p>
          <p className="mt-4 text-brand-text-secondary leading-relaxed">
            Want to see the scores for yourself? Browse every{" "}
            <Link href="/vendors" className="text-brand-accent hover:underline">
              verified vendor
            </Link>{" "}
            or check the{" "}
            <Link href="/results" className="text-brand-accent hover:underline">
              underlying lab reports
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
