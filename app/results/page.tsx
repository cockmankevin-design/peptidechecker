import Link from "next/link";

import { Container, DemoNotice, PageHeader, Section, StatusChip } from "@/components/site/ui";
import { DEMO_REGISTRY, GATE_NAMES } from "@/lib/demo-registry";

/* Certificates. We run no laboratory, so this is not a page of lab results -
   it is the audit of each vendor's own published certificate: how far it got
   through the seven checks. Newest review first. */

export default function CertificatesPage() {
  const rows = [...DEMO_REGISTRY].sort((a, b) => b.lastReviewed.localeCompare(a.lastReviewed));

  return (
    <>
      <PageHeader
        eyebrow="Certificates"
        title="The certificates, and how far each one got."
        lede="Every vendor publishes its own certificate of analysis. We do not test anything; we check whether that document loads, names its laboratory, is confirmed by that lab, was issued to that vendor, names the lot, matches the product page, and is recent. This is the result of that check for every record."
      />
      <Section className="!pt-10 sm:!pt-14">
        <Container>
          <DemoNotice />
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {rows.map((r) => {
              const passed = r.gates.filter((g) => g === "pass").length;
              const failedAt = r.gates.indexOf("fail");
              return (
                <li key={r.slug}>
                  <Link
                    href={`/vendors/${r.slug}`}
                    className="group block h-full rounded-lg border border-line bg-surface p-5 transition-colors hover:border-accent/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="text-[15px] font-medium text-text group-hover:text-accent">{r.vendor}</p>
                      <StatusChip status={r.status} />
                    </div>
                    <p className="mt-3 font-mono text-[12px] text-muted">
                      Lot {r.lot ?? <span className="text-dim">not published</span>}
                      <span className="text-dim"> · </span>
                      {r.lab ?? <span className="text-dim">no laboratory named</span>}
                    </p>
                    {/* One cell per check, in order. */}
                    <div className="mt-4 flex gap-1" aria-hidden="true">
                      {r.gates.map((g, i) => (
                        <span
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            g === "pass" ? "bg-verified" : g === "fail" ? "bg-delisted" : "bg-line-strong"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="mt-2.5 flex flex-wrap justify-between gap-2 font-mono text-[11px] text-dim">
                      <span>
                        {passed} of 7 checks passed
                        {failedAt >= 0 && <> · stopped at &ldquo;{GATE_NAMES[failedAt]}&rdquo;</>}
                      </span>
                      <time dateTime={r.lastReviewed}>{r.lastReviewed}</time>
                    </div>
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
