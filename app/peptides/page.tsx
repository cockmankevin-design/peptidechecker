import ProductCard from "@/components/ProductCard";
import { getProducts, sortVendorOffers } from "@/lib/content";

export default function PeptidesPage() {
  const products = getProducts();

  // Safety > Price > Shipping — same ordering rule as every other listing on the site,
  // applied here at the product level via each product's own featured (best) offer.
  const sorted = [...products].sort(
    (a, b) =>
      (sortVendorOffers(b.vendors ?? [])[0]?.trustScore ?? 0) -
      (sortVendorOffers(a.vendors ?? [])[0]?.trustScore ?? 0),
  );

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">All Products</p>
          <h1 className="font-heading text-4xl font-bold text-brand-text-heading">Verified Peptides</h1>
          <p className="mt-3 text-brand-text-secondary max-w-xl">
            Every product listed has been independently tested by a named third-party lab. Sorted by safety score.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sorted.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
