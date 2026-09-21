import Link from "next/link";

import { Container, DemoNotice, PageHeader, Section } from "@/components/site/ui";
import { getProducts } from "@/lib/content";
import { DEMO_REGISTRY } from "@/lib/demo-registry";

/* Peptides, by compound. Each card counts the registry vendors whose audited
   certificate covers it - no prices, no purity figures, no ranking by sales. */

export default function PeptidesPage() {
  const products = getProducts();

  return (
    <>
      <PageHeader
        eyebrow="Peptides"
        title="Look up a compound, see whose certificate holds up."
        lede="For each compound, the vendors in the registry whose certificate for it was checked, and how that check ended."
      />
      <Section className="!pt-10 sm:!pt-14">
        <Container>
          <DemoNotice />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => {
              const rows = DEMO_REGISTRY.filter((r) => r.products.includes(p.slug));
              const verified = rows.filter((r) => r.status === "verified").length;
              return (
                <li key={p.slug}>
                  <Link
                    href={`/peptides/${p.slug}`}
                    className="group flex h-full flex-col rounded-lg border border-line bg-surface p-5 transition-colors hover:border-accent/40"
                  >
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">{p.category}</p>
                    <p className="mt-2 text-[1.35rem] font-semibold tracking-[-0.01em] text-text group-hover:text-accent">
                      {p.name}
                    </p>
                    <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-muted">{p.description}</p>
                    <p className="mt-auto pt-5 font-mono text-[11.5px]">
                      <span className="text-verified">{verified} verified</span>
                      <span className="text-dim"> of {rows.length} in the registry</span>
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>
    </>
  );
}
