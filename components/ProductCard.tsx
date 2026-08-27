import Link from "next/link";
import SampleDataBadge from "./SampleDataBadge";
import PeptideVial, { VIAL_DOSE } from "./PeptideVial";
import { sortVendorOffers } from "@/lib/content";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  // Safety > Price > Shipping — same ordering rule as every other listing on the site.
  const topVendor = sortVendorOffers(product.vendors ?? [])[0];
  const purity = topVendor?.purity;

  return (
    <Link href={`/peptides/${product.slug}`} className="group">
      <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden hover:border-brand-accent/30 transition-all duration-300">
        <div className="aspect-square bg-gradient-to-br from-brand-surface-2 to-brand-surface flex items-center justify-center p-6 relative">
          {product.sampleData && <SampleDataBadge className="absolute top-3 left-3" />}
          <PeptideVial
            name={product.name}
            dose={VIAL_DOSE[product.slug]}
            uid={product.slug}
            className="h-full w-auto max-h-[220px] transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.03] drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
          />
          {purity && purity >= 99 && (
            <span className="absolute top-3 right-3 bg-brand-safe/20 text-brand-safe text-xs font-semibold px-2 py-1 rounded">
              {purity}% pure{product.sampleData ? "*" : ""}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-heading font-bold text-brand-text-heading group-hover:text-brand-accent transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-brand-text-secondary mt-1">{product.category}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-brand-text font-semibold">
              From {product.startingPrice}
            </span>
            {topVendor && (
              <span className="text-xs text-brand-text-secondary">
                {topVendor.shippingDays}
              </span>
            )}
          </div>
          {product.sampleData && (
            <p className="mt-2 text-[11px] text-brand-warn">
              *Illustrative sample data — not a verified lab result
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
