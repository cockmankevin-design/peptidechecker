import Link from "next/link";

const labs = [
  {
    name: "Independent Lab A",
    description:
      "Slovakia-based analytical lab specializing in HPLC purity testing and mass spectrometry for the peptide research community — one of the most widely cited independent labs in the space.",
  },
  {
    name: "Independent Lab B",
    description:
      "US-based lab offering HPLC and LC-MS testing with public certificate lookup by lot number, so a buyer can verify a specific batch before ordering.",
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
    description: "How closely repeat tests of the same product match across multiple purchases and time periods.",
  },
  {
    label: "Pricing",
    weight: "10%",
    description: "Cost relative to the category average, so a vendor isn't rewarded purely for being expensive.",
  },
  {
    label: "Shipping Reliability",
    weight: "10%",
    description: "Consistent, accurately-quoted delivery times based on tracked orders.",
  },
];

export default function MethodologyPage() {
  return (
    <main className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">Methodology</p>
        <h1 className="font-heading text-4xl font-bold text-brand-text-heading">How We Test &amp; Score Vendors</h1>
        <p className="mt-4 text-brand-text-secondary leading-relaxed">
          Every vendor on PeptideChecker is scored using the same process, whether they&apos;re a five-year
          incumbent or a brand-new listing. No vendor pays for placement, and no vendor sees or influences their own
          score before it&apos;s published.
        </p>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-brand-text-heading">Independent Lab Testing</h2>
          <p className="mt-3 text-brand-text-secondary leading-relaxed">
            We don&apos;t accept a vendor&apos;s own certificate of analysis at face value. Samples are purchased
            anonymously, the same way any other customer would, and sent to one of our named third-party labs for
            independent HPLC purity testing, LC-MS / GC-MS mass spec confirmation, and endotoxin screening.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {labs.map((lab) => (
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
            Every vendor&apos;s trust score out of 10 is a weighted average of five factors:
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
          <h2 className="font-heading text-2xl font-bold text-brand-text-heading">The 7+ Rule</h2>
          <p className="mt-3 text-brand-text-secondary leading-relaxed">
            A vendor needs a trust score of 7.0 or higher to appear anywhere on PeptideChecker — in the vendor
            directory, on a product page, or in the comparison table. There is no exception and no paid placement.
            If a vendor&apos;s score drops below 7 on retest, they&apos;re removed immediately, not grandfathered
            in.
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
