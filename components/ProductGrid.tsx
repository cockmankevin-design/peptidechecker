import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

export default function ProductGrid({ products }: { products: Product[] }) {
  const hasSampleData = products.some((p) => p.sampleData);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">Products</p>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-text-heading">
          Verified Purity & Potency
        </h2>
        {hasSampleData && (
          <p className="mt-3 text-xs text-brand-warn max-w-xl mx-auto">
            Products marked &ldquo;Sample data&rdquo; below use placeholder vendor and purity figures seeded during development — not verified lab results.
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
