import FaqAccordion from "@/components/FaqAccordion";

export default function FaqPage() {
  return (
    <main className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">FAQ</p>
          <h1 className="font-heading text-4xl font-bold text-brand-text-heading">Frequently Asked Questions</h1>
          <p className="mt-3 text-brand-text-secondary max-w-xl">
            Everything you need to know about how PeptideChecker verifies vendors and what to expect when you order.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-1">
            <div className="md:sticky md:top-24 bg-brand-surface border border-brand-border rounded-xl p-6">
              <h2 className="font-heading text-xl font-bold text-brand-text-heading">Still need help?</h2>
              <p className="mt-3 text-sm text-brand-text-secondary leading-relaxed">
                Can&apos;t find the answer you&apos;re looking for? Reach out and we&apos;ll get back to you.
              </p>
              <a
                href="mailto:info@peptidechecker.com"
                className="inline-block mt-6 bg-brand-accent text-brand-bg text-sm font-semibold px-6 py-3 rounded-lg hover:bg-brand-accent-hover transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <FaqAccordion />
          </div>
        </div>
      </div>
    </main>
  );
}
