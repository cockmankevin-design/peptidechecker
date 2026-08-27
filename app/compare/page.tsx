import CompareTable from "@/components/CompareTable";
import SampleDataBadge from "@/components/SampleDataBadge";
import { getVendors, getProducts } from "@/lib/content";

export default function ComparePage() {
  // getVendors() already applies the site-wide 7+ trust filter and sorts best-first, so the
  // table only ever needs to worry about display order, not eligibility.
  const vendors = getVendors();
  const hasSampleData = vendors.some((v) => v.sampleData);

  // A vendor's productsCarried can reference a product slug with no content/products/*.mdx
  // file (e.g. vendor-b lists "pt-141", which doesn't exist). app/vendors/[slug]/page.tsx
  // already guards against this for its "Products Carried (N)" count; passing the same set of
  // real slugs down to the table lets it apply the identical guard, so the two pages can't
  // disagree about the same vendor's count.
  const validProductSlugs = getProducts().map((p) => p.slug);

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-3">Compare</p>
          <h1 className="font-heading text-4xl font-bold text-brand-text-heading">Compare Vendors</h1>
          <p className="mt-3 text-brand-text-secondary max-w-2xl">
            Every vendor below scored 7+ on our independent trust score — no vendor pays for placement. Sorted by
            trust score by default: safety first, then price, then shipping. Click any column to re-sort.
          </p>
        </div>

        {hasSampleData && (
          <div className="mb-8 bg-brand-warn/10 border border-brand-warn/40 rounded-xl p-4 flex items-start gap-3">
            <SampleDataBadge className="shrink-0" />
            <p className="text-sm text-brand-warn">
              This entire table — every vendor, every column — is currently placeholder sample data seeded during
              development. Trust score, COA status, pricing, shipping, and product count shown below are all
              invented figures. None of it, asterisked or not, represents a verified vendor record.
            </p>
          </div>
        )}

        <CompareTable vendors={vendors} validProductSlugs={validProductSlugs} />
      </div>
    </main>
  );
}
