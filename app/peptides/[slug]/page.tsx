import Link from "next/link";
import { notFound } from "next/navigation";

import { Container, DemoNotice, Eyebrow, PageHeader, Section, StatusChip } from "@/components/site/ui";
import { getProducts } from "@/lib/content";
import { DEMO_REGISTRY } from "@/lib/demo-registry";

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

const ORDER = { verified: 0, review: 1, delisted: 2 } as const;

export default async function PeptidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProducts().find((p) => p.slug === slug);
  if (!product) notFound();

  const rows = DEMO_REGISTRY.filter((r) => r.products.includes(product.slug)).sort(
    (a, b) => ORDER[a.status] - ORDER[b.status],
  );

  return (
    <>
      <PageHeader eyebrow={product.category} title={product.name} lede={product.description}>
        {product.commonUses?.length > 0 && (
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">Studied for</p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {product.commonUses.map((u) => (
                <li key={u} className="rounded-full border border-line-strong px-3 py-1 text-[13px] text-muted">
                  {u}
                </li>
              ))}
            </ul>
          </div>
        )}
      </PageHeader>

      <Section className="!pt-10 sm:!pt-14">
        <Container>
          <DemoNotice />
          <Eyebrow className="mt-10">Vendors in the registry for {product.name}</Eyebrow>
          {rows.length ? (
            <ul className="mt-5 divide-y divide-line rounded-lg border border-line">
              {rows.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/vendors/${r.slug}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-surface"
                  >
                    <span
                      className={
                        r.status === "delisted"
                          ? "text-dim line-through decoration-delisted/50"
                          : "font-medium text-text"
                      }
                    >
                      {r.vendor}
                    </span>
                    <span className="flex items-center gap-4">
                      <span className="hidden font-mono text-[12px] text-muted sm:inline">
                        Lot {r.lot ?? "not published"}
                      </span>
                      <StatusChip status={r.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-muted">
              No vendor in the registry has a checked certificate for this compound yet.
            </p>
          )}
          <p className="mt-8 max-w-[62ch] text-[14px] leading-relaxed text-dim">
            PeptideChecker sells nothing and gives no medical advice. A verified certificate means the
            document is real and belongs to the lot on sale. It says nothing about whether a compound is
            safe or legal for you to use.
          </p>
        </Container>
      </Section>
    </>
  );
}
