import Link from "next/link";
import SampleDataBadge from "./SampleDataBadge";
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
          <div className="w-24 h-32 bg-gradient-to-b from-gray-300 to-gray-400 rounded-lg shadow-lg relative">
            <div className="absolute inset-x-2 top-2 bottom-4 bg-white/90 rounded-sm flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-600 text-center leading-tight px-1">{product.name}</span>
            </div>
            <div className="absolute bottom-1 inset-x-2 h-2 bg-brand-accent/30 rounded-sm" />
          </div>
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
