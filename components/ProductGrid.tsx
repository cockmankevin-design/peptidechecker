import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

export default function ProductGrid({ products }: { products: Product[] }) {
  const hasSampleData = products.some((p) => p.sampleData);

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* section mark */}
      <span
        className="pointer-events-none absolute left-4 lg:left-8 top-10 font-heading text-7xl leading-none text-brand-gold/70 select-none"
        aria-hidden="true"
      >
        &lowast;
      </span>

      <div className="text-center mb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-3">Products</p>
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-text-heading tracking-tight">
          Verified Purity &amp; Potency
        </h2>
        {hasSampleData && (
          <p className="mt-4 text-xs text-brand-warn max-w-xl mx-auto leading-relaxed">
            Products marked &ldquo;Sample data&rdquo; below use placeholder vendor and purity figures
            seeded during development &mdash; not verified lab results.
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
