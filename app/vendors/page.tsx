import Link from "next/link";
import TrustScoreBadge from "@/components/TrustScoreBadge";
import SampleDataBadge from "@/components/SampleDataBadge";
import { getVendors } from "@/lib/content";

export default function VendorsPage() {
  const vendors = getVendors();

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-3">Vendors</p>
          <h1 className="font-heading text-4xl font-bold text-brand-text-heading">Verified Vendors</h1>
          <p className="mt-3 text-brand-text-secondary">Only vendors scoring 7+ are listed. Every score is built from lab reports the vendor publishes, checked against a named lab and a specific lot.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <Link key={vendor.slug} href={`/vendors/${vendor.slug}`} className="group">
              <div className="bg-brand-surface border border-brand-border rounded-xl p-6 hover:border-brand-accent/30 transition-colors h-full relative">
                {vendor.sampleData && <SampleDataBadge />}
                <div className="flex items-center justify-between mb-3 pr-20">
                  <h3 className="font-heading font-bold text-brand-text-heading group-hover:text-brand-accent transition-colors">{vendor.name}</h3>
                  <TrustScoreBadge score={vendor.trustScore} />
                </div>
                <p className="text-sm text-brand-text-secondary mb-4 line-clamp-2">{vendor.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-brand-text-secondary">Avg Price:</span> <span className="text-brand-text font-medium">{vendor.avgPrice}</span></div>
                  <div><span className="text-brand-text-secondary">Shipping:</span> <span className="text-brand-text font-medium">{vendor.shippingSpeed}</span></div>
                  <div className="col-span-2"><span className="text-brand-text-secondary">Testing:</span> <span className="text-brand-text font-medium">{vendor.testingMethod}</span></div>
                </div>
                {vendor.sampleData && (
                  <p className="mt-3 text-[11px] text-brand-warn">
                    *Illustrative sample data — not a verified vendor record
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
