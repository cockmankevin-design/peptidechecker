import Link from "next/link";
import { notFound } from "next/navigation";
import TrustScoreBadge from "@/components/TrustScoreBadge";
import SampleDataBadge from "@/components/SampleDataBadge";
import { getVendors, getTestResults, getProducts } from "@/lib/content";

export async function generateStaticParams() {
  const vendors = getVendors();
  return vendors.map((v) => ({ slug: v.slug }));
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // getVendors() applies the site-wide 7+ trust filter, so a vendor that has fallen
  // below the threshold can't be reached here even if seed data changes later.
  const vendor = getVendors().find((v) => v.slug === slug);
  if (!vendor) notFound();

  const testHistory = getTestResults().filter((t) => t.vendorSlug === vendor.slug);

  // productsCarried can reference a product slug that has no content/products/*.mdx file
  // (e.g. vendor-b lists "pt-141", which doesn't exist yet). Only link to products
  // that actually resolve, so the profile never renders a broken link.
  const allProducts = getProducts();
  const carriedProducts = (vendor.productsCarried ?? [])
    .map((productSlug) => allProducts.find((p) => p.slug === productSlug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {vendor.sampleData && (
          <div className="mb-6 flex items-center gap-2">
            <SampleDataBadge className="" />
            <p className="text-xs text-brand-warn">
              Illustrative sample data seeded during development — not a verified vendor record.
            </p>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-3">Vendor Profile</p>
            <h1 className="font-heading text-4xl font-bold text-brand-text-heading">{vendor.name}</h1>
            <p className="mt-4 text-brand-text-secondary max-w-xl leading-relaxed">{vendor.description}</p>
          </div>
          <TrustScoreBadge score={vendor.trustScore} />
        </div>

        <a
          href={vendor.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 bg-brand-accent text-brand-bg text-sm font-semibold px-6 py-3 rounded-lg hover:bg-brand-accent-hover transition-colors"
        >
          Visit {vendor.name}
        </a>

        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold text-brand-text-heading mb-6">Trust Score Breakdown</h2>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-brand-text-secondary uppercase tracking-wider">Overall Trust Score</p>
              <p className="mt-1 text-2xl font-bold text-brand-text-heading">{vendor.trustScore.toFixed(1)}<span className="text-sm text-brand-text-secondary">/10</span></p>
            </div>
            <div>
              <p className="text-xs text-brand-text-secondary uppercase tracking-wider">COA Status</p>
              <p className="mt-1 text-brand-text font-medium">{vendor.coaStatus}</p>
            </div>
            <div>
              <p className="text-xs text-brand-text-secondary uppercase tracking-wider">Testing Method</p>
              <p className="mt-1 text-brand-text font-medium">{vendor.testingMethod}</p>
            </div>
            <div>
              <p className="text-xs text-brand-text-secondary uppercase tracking-wider">Shipping Speed</p>
              <p className="mt-1 text-brand-text font-medium">{vendor.shippingSpeed}</p>
            </div>
            <div>
              <p className="text-xs text-brand-text-secondary uppercase tracking-wider">Average Price</p>
              <p className="mt-1 text-brand-text font-medium">{vendor.avgPrice}</p>
            </div>
            <div>
              <p className="text-xs text-brand-text-secondary uppercase tracking-wider">Founded / Location</p>
              <p className="mt-1 text-brand-text font-medium">{vendor.founded} · {vendor.location}</p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold text-brand-text-heading mb-6">
            Test History ({testHistory.length})
          </h2>
          {testHistory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testHistory.map((test) => (
                <Link
                  key={test.slug}
                  href={`/results/${test.slug}`}
                  className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-brand-accent/30 transition-colors relative block"
                >
                  {test.sampleData && <SampleDataBadge />}
                  <p className="font-heading font-bold text-brand-text-heading pr-20">{test.peptide}</p>
                  <p className="text-sm text-brand-text-secondary mt-1">{test.lab}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span
                      className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                        test.passed ? "bg-brand-safe/15 text-brand-safe" : "bg-brand-fail/15 text-brand-fail"
                      }`}
                    >
                      {test.passed ? "Pass" : "Fail"}
                    </span>
                    <span className="text-sm text-brand-text font-medium">
                      {test.hplcPurity}% purity{test.sampleData ? "*" : ""}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-brand-text-secondary">No independent lab reports on file for this vendor yet.</p>
          )}
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold text-brand-text-heading mb-6">
            Products Carried ({carriedProducts.length})
          </h2>
          {carriedProducts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {carriedProducts.map((product) => (
                <Link
                  key={product.slug}
                  href={`/peptides/${product.slug}`}
                  className="text-sm bg-brand-accent-dim text-brand-accent px-4 py-2 rounded-full font-medium hover:bg-brand-accent/20 transition-colors"
                >
                  {product.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-brand-text-secondary">No product listings on file for this vendor yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
