import { getProducts, sortVendorOffers } from "@/lib/content";
import VendorCard from "@/components/VendorCard";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const products = getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function PeptideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // getProducts() already applies the site-wide 7+ trust filter to each product's
  // vendors[], so no sub-7 offer can surface here even if seed data changes later.
  const product = getProducts().find((p) => p.slug === slug);
  if (!product) notFound();

  // Safety > Price > Shipping — same ordering rule as every other listing on the site.
  const vendors = sortVendorOffers(product.vendors ?? []);

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-3">
          {product.category}
        </p>
        <h1 className="font-heading text-4xl font-bold text-brand-text-heading">
          {product.name}
        </h1>
        <p className="mt-4 text-brand-text-secondary max-w-xl leading-relaxed">
          {product.description}
        </p>

        {product.commonUses && product.commonUses.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {product.commonUses.map((use) => (
              <span key={use} className="text-xs bg-brand-accent-dim text-brand-accent px-3 py-1 rounded-full font-medium">
                {use}
              </span>
            ))}
          </div>
        )}

        {product.sampleData && (
          <p className="mt-4 text-xs text-brand-warn">
            *Illustrative sample data — vendor offers below are placeholder figures, not verified lab results.
          </p>
        )}

        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold text-brand-text-heading mb-6">
            Verified Vendors ({vendors.length})
          </h2>
          {vendors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendors.map((vendor) => (
                <VendorCard key={vendor.vendorSlug} vendor={vendor} sampleData={product.sampleData} />
              ))}
            </div>
          ) : (
            <p className="text-brand-text-secondary">No vendors currently meet our trust threshold for this product.</p>
          )}
        </section>
      </div>
    </main>
  );
}
