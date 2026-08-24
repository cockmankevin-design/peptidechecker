import Link from "next/link";
import TrustScoreBadge from "./TrustScoreBadge";
import type { ProductVendor } from "@/lib/types";

export default function VendorCard({
  vendor,
  sampleData,
}: {
  vendor: ProductVendor;
  sampleData?: boolean;
}) {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-brand-accent/30 transition-colors relative">
      {sampleData && (
        <span className="absolute top-3 right-3 bg-brand-warn/20 text-brand-warn text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded">
          Sample data
        </span>
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <Link href={`/vendors/${vendor.vendorSlug}`} className="font-heading font-bold text-brand-text-heading hover:text-brand-accent transition-colors">
            {vendor.vendorName}
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <TrustScoreBadge score={vendor.trustScore} />
            <span className="text-sm font-semibold text-brand-safe">
              {vendor.purity}% purity{sampleData ? "*" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-brand-text-secondary uppercase tracking-wider">Price</p>
          <p className="text-lg font-bold text-brand-text-heading">{vendor.price}</p>
        </div>
        <div>
          <p className="text-xs text-brand-text-secondary uppercase tracking-wider">Shipping</p>
          <p className="text-sm font-medium text-brand-text">{vendor.shippingDays}</p>
        </div>
      </div>

      <div className="flex gap-3">
        {vendor.testSlug && (
          <Link
            href={`/results/${vendor.testSlug}`}
            className="flex-1 text-center border border-brand-accent text-brand-accent text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-accent-dim transition-colors"
          >
            View Lab Report
          </Link>
        )}
        <a
          href={vendor.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center bg-brand-accent text-brand-bg text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-accent-hover transition-colors"
        >
          Buy Now
        </a>
      </div>

      {sampleData && (
        <p className="mt-3 text-[11px] text-brand-warn">
          *Illustrative sample data — not a verified lab result
        </p>
      )}
    </div>
  );
}
