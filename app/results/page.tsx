import Link from "next/link";
import SampleDataBadge from "@/components/SampleDataBadge";
import { getTestResults } from "@/lib/content";

export default function ResultsPage() {
  // getTestResults() already sorts newest-first by dateTested.
  const results = getTestResults();

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-3">Lab Reports</p>
          <h1 className="font-heading text-4xl font-bold text-brand-text-heading">Published Lab Reports</h1>
          <p className="mt-3 text-brand-text-secondary max-w-xl">
            Third-party lab reports published by the vendors we list, and checked by us. HPLC purity, mass spec confirmation, and lot traceability.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {results.map((result) => (
            <Link
              key={result.slug}
              href={`/results/${result.slug}`}
              className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-brand-accent/30 transition-colors relative block"
            >
              {result.sampleData && <SampleDataBadge />}
              <div className="pr-20">
                <p className="font-heading font-bold text-brand-text-heading">{result.peptide}</p>
                <p className="text-sm text-brand-text-secondary mt-1">{result.vendor} · {result.lab}</p>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <span
                  className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                    result.passed ? "bg-brand-safe/15 text-brand-safe" : "bg-brand-fail/15 text-brand-fail"
                  }`}
                >
                  {result.passed ? "Pass" : "Fail"}
                </span>
                <span className="text-sm text-brand-text font-medium">
                  {result.hplcPurity}% purity{result.sampleData ? "*" : ""}
                </span>
                <span className="text-xs text-brand-text-secondary ml-auto">{result.dateTested}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
