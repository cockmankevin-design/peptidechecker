import Link from "next/link";

import { Container, DemoNotice, PageHeader, Section, StatusChip } from "@/components/site/ui";
import { DEMO_REGISTRY, GATE_NAMES, GATE_SHORT } from "@/lib/demo-registry";

/* Compare sources: every vendor against the same seven checks, side by side.
   The comparison is the evidence, not price or score. Desktop gets a real
   table; phones get one card per vendor. */

const CELL = {
  pass: { mark: "✓", label: "Passed", cls: "text-verified" },
  fail: { mark: "✕", label: "Failed", cls: "text-delisted" },
  open: { mark: "–", label: "Not reached", cls: "text-dim" },
} as const;

export default function ComparePage() {
  const rows = DEMO_REGISTRY;

  return (
    <>
      <PageHeader
        eyebrow="Compare sources"
        title="Every vendor, the same seven checks."
        lede="No price, no purity, no score. Just whether each vendor's certificate loads, names its laboratory, is confirmed by that lab, was issued to that vendor, names the lot, matches the product page, and is recent."
      />
      <Section className="!pt-10 sm:!pt-14">
        <Container>
          <DemoNotice />

          <div
            className="mt-8 hidden overflow-x-auto rounded-lg border border-line md:block"
            role="region"
            aria-label="Vendor comparison, scrollable"
            tabIndex={0}
          >
            <table className="w-full min-w-[980px] border-collapse text-left">
              <caption className="sr-only">
                Each vendor in the registry against the seven certificate checks, with its status.
              </caption>
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th scope="col" className="px-5 py-3 font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">
                    Vendor
                  </th>
                  {GATE_NAMES.map((g, i) => (
                    <th
                      key={g}
                      scope="col"
                      title={g}
                      className="px-4 py-3 text-center font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim"
                    >
                      {GATE_SHORT[i]}
                    </th>
                  ))}
                  <th scope="col" className="px-5 py-3 font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.slug} className="border-b border-line last:border-b-0">
                    <th scope="row" className="px-5 py-4 text-left font-normal">
                      <Link
                        href={`/vendors/${r.slug}`}
                        className={
                          r.status === "delisted"
                            ? "text-dim line-through decoration-delisted/50 hover:text-accent"
                            : "font-medium text-text hover:text-accent"
                        }
                      >
                        {r.vendor}
                      </Link>
                    </th>
                    {r.gates.map((g, i) => (
                      <td key={i} className={`px-4 py-4 text-center font-mono text-[13px] ${CELL[g].cls}`}>
                        <span aria-hidden="true">{CELL[g].mark}</span>
                        <span className="sr-only">{CELL[g].label}</span>
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <StatusChip status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-8 space-y-3 md:hidden">
            {rows.map((r) => (
              <li key={r.slug} className="rounded-lg border border-line bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <Link href={`/vendors/${r.slug}`} className="font-medium text-text hover:text-accent">
                    {r.vendor}
                  </Link>
                  <StatusChip status={r.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
                  {r.gates.map((g, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <dt className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-dim">{GATE_SHORT[i]}</dt>
                      <dd className={`font-mono text-[11px] uppercase ${CELL[g].cls}`}>{CELL[g].label}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>

          <p className="mt-6 font-mono text-[11.5px] leading-relaxed text-dim">
            ✓ passed · ✕ failed · – not reached. A failed check ends the run, so the checks after it are
            never reached.
          </p>
        </Container>
      </Section>
    </>
  );
}
