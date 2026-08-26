import Link from "next/link";
import { notFound } from "next/navigation";
import SampleDataBadge from "@/components/SampleDataBadge";
import { getTestResults, getVendors, getProducts } from "@/lib/content";

export async function generateStaticParams() {
  const results = getTestResults();
  return results.map((r) => ({ slug: r.slug }));
}

export default async function TestResultDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = getTestResults().find((r) => r.slug === slug);
  if (!result) notFound();

  // vendorSlug / peptideSlug can point at a vendor below the trust threshold or a product
  // that has no content file. Only link when the target actually resolves through the
  // same filtered helpers every other page uses, so this never renders a broken link.
  const vendor = getVendors().find((v) => v.slug === result.vendorSlug);
  const product = getProducts().find((p) => p.slug === result.peptideSlug);

  const purityColor =
    result.hplcPurity >= 99 ? "text-brand-safe" : result.hplcPurity >= 95 ? "text-brand-warn" : "text-brand-fail";

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {result.sampleData && (
          <div className="mb-8 bg-brand-warn/10 border border-brand-warn/40 rounded-xl p-4 flex items-start gap-3">
            <SampleDataBadge className="shrink-0" />
            <p className="text-sm text-brand-warn">
              This report is placeholder sample data seeded during development. It does not represent an actual
              lab result and must not be treated as genuine.
            </p>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">Lab Report</p>
            <h1 className="font-heading text-4xl font-bold text-brand-text-heading">
              {result.peptide}{result.sampleData ? "*" : ""}
            </h1>
            <p className="mt-2 text-brand-text-secondary">
              {vendor ? (
                <Link href={`/vendors/${vendor.slug}`} className="text-brand-accent hover:underline">
                  {result.vendor}
                </Link>
              ) : (
                result.vendor
              )}
              {" "}· {result.lab}
            </p>
          </div>
          <span
            className={`shrink-0 text-xs font-bold uppercase px-3 py-1.5 rounded ${
              result.passed ? "bg-brand-safe/15 text-brand-safe" : "bg-brand-fail/15 text-brand-fail"
            }`}
          >
            {result.passed ? "Pass" : "Fail"}
          </span>
        </div>

        <div className="mt-10 bg-brand-surface border border-brand-border rounded-xl p-8 text-center">
          <p className="text-xs text-brand-text-secondary uppercase tracking-wider">HPLC Purity</p>
          <p className={`mt-2 font-heading text-6xl font-bold ${purityColor}`}>
            {result.hplcPurity}%{result.sampleData ? "*" : ""}
          </p>
          {result.sampleData && (
            <p className="mt-2 text-[11px] text-brand-warn">*Illustrative sample data — not a verified lab result</p>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
            <p className="text-xs text-brand-text-secondary uppercase tracking-wider">Mass Spec Confirmation</p>
            <p className={`mt-1 font-semibold ${result.massSpecConfirmed ? "text-brand-safe" : "text-brand-fail"}`}>
              {result.massSpecConfirmed ? "Confirmed" : "Not confirmed"}
            </p>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
            <p className="text-xs text-brand-text-secondary uppercase tracking-wider">Endotoxin Tested</p>
            <p className={`mt-1 font-semibold ${result.endotoxinTested ? "text-brand-safe" : "text-brand-text"}`}>
              {result.endotoxinTested ? "Tested" : "Not tested"}
            </p>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
            <p className="text-xs text-brand-text-secondary uppercase tracking-wider">Lot Number</p>
            <p className="mt-1 font-semibold text-brand-text">{result.lotNumber}</p>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
            <p className="text-xs text-brand-text-secondary uppercase tracking-wider">Date Tested</p>
            <p className="mt-1 font-semibold text-brand-text">{result.dateTested}</p>
          </div>
        </div>

        {product && (
          <div className="mt-8">
            <Link
              href={`/peptides/${product.slug}`}
              className="inline-block text-sm bg-brand-accent-dim text-brand-accent px-4 py-2 rounded-full font-medium hover:bg-brand-accent/20 transition-colors"
            >
              View {product.name} vendors
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
