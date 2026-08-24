import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import ProductGrid from "@/components/ProductGrid";
import HowItWorks from "@/components/HowItWorks";
import EmailSignup from "@/components/EmailSignup";
import { getProducts } from "@/lib/content";

export default function Home() {
  const products = getProducts();

  return (
    <main>
      <Hero />
      <TrustBadges />
      <ProductGrid products={products} />
      <HowItWorks />
      <EmailSignup />
    </main>
  );
}
