import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Container,
  DataField,
  DemoNotice,
  Eyebrow,
  GateList,
  PageHeader,
  Section,
  StatusChip,
} from "@/components/site/ui";
import { DEMO_REGISTRY, GATE_NAMES, registryRow } from "@/lib/demo-registry";
import { getProducts } from "@/lib/content";

export function generateStaticParams() {
  return DEMO_REGISTRY.map((r) => ({ slug: r.slug }));
}

/* One vendor's record: status, the certificate that was checked, the four
   gates in order, and - for a delisting - the reason, kept permanently. */

export default async function VendorRecordPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = registryRow(slug);
  if (!row) notFound();

  const products = getProducts().filter((p) => row.products.includes(p.slug));

  return (
    <>
      <PageHeader
        eyebrow="Registry record"
        title={
          <span className={row.status === "delisted" ? "text-muted line-through decoration-delisted/50 decoration-2" : ""}>
            {row.vendor}
          </span>
        }
      >
        <div className="flex flex-wrap items-center gap-4">
          <StatusChip status={row.status} />
          <span className="font-mono text-[11.5px] text-dim">
            Last reviewed <time dateTime={row.lastReviewed}>{row.lastReviewed}</time>
          </span>
        </div>
      </PageHeader>

      <Section className="!pt-10 sm:!pt-14">
        <Container>
          <DemoNotice />

          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div>
              <Eyebrow>Certificate checked</Eyebrow>
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 rounded-lg border border-line bg-surface p-5">
                <DataField label="Lot" value={row.lot ?? <span className="text-dim">Not published</span>} />
                <DataField label="Laboratory" value={row.lab ?? <span className="text-dim">Not named</span>} />
                <DataField label="Reviewed" value={<time dateTime={row.lastReviewed}>{row.lastReviewed}</time>} />
                <div className="col-span-2">
                  <DataField
                    label="Tests reported"
                    mono={false}
                    value={row.tests.length ? row.tests.join(" · ") : <span className="text-dim">None readable</span>}
                  />
                </div>
                <DataField
                  label="Products covered"
                  mono={false}
                  value={
                    products.length ? (
                      <span className="flex flex-wrap gap-x-3 gap-y-1">
                        {products.map((p) => (
                          <Link key={p.slug} href={`/peptides/${p.slug}`} className="text-accent hover:underline">
                            {p.name}
                          </Link>
                        ))}
                      </span>
                    ) : (
                      <span className="text-dim">None on file</span>
                    )
                  }
                />
              </dl>

              {row.url && (
                <p className="mt-6 text-[14px] text-muted">
                  <a href={row.url} target="_blank" rel="sponsored noopener noreferrer" className="text-accent hover:underline">
                    Visit {row.vendor}
                  </a>{" "}
                  <span className="font-mono text-[11px] text-dim">Affiliate link</span>
                </p>
              )}
            </div>

            <div>
              <Eyebrow>The seven checks, in order</Eyebrow>
              <div className="mt-5">
                <GateList names={GATE_NAMES} gates={row.gates} />
              </div>

              {row.reason && (
                <div className="mt-6 border-l-2 border-delisted/40 pl-4">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">Reason for removal</p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{row.reason}</p>
                </div>
              )}
              {row.note && (
                <div className="mt-6 border-l-2 border-review/40 pl-4">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">Open question</p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{row.note}</p>
                </div>
              )}
              <p className="mt-6 text-[14px] leading-relaxed text-dim">
                A failed check ends the run, so the checks after it are not reached. See the{" "}
                <Link href="/methodology" className="text-accent hover:underline">methodology</Link>.
              </p>
            </div>
          </div>

          <p className="mt-14">
            <Link href="/vendors" className="font-mono text-[12px] uppercase tracking-[0.12em] text-dim hover:text-accent">
              ← Back to the registry
            </Link>
          </p>
        </Container>
      </Section>
    </>
  );
}
