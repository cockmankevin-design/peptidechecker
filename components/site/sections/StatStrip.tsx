"use client";

import { Container, Reveal } from "@/components/site/ui";
import { APPROVED_DRUGS, APPROVED_LAST_CHECKED, PIPELINE_DRUGS } from "@/lib/fda-registry";

/* Stat strip, directly under the hero (2026-09-24 pivot build).

   Numbers are derived from lib/fda-registry.ts, never hardcoded, so they
   cannot drift from the rows printed on /approved and /pipeline. The
   discontinued-drug count is the site's best single proof of care: lists
   people copy from each other still carry a drug that's gone. */

export default function StatStrip() {
  const approvedCount = APPROVED_DRUGS.filter((d) => d.status === "approved" && d.isPeptide).length;
  const discontinuedCount = APPROVED_DRUGS.filter((d) => d.status === "discontinued").length;
  const pendingCount = PIPELINE_DRUGS.length;

  const stats = [
    { value: approvedCount, label: "approved peptide medicines" },
    { value: pendingCount, label: "awaiting an FDA decision" },
    { value: discontinuedCount, label: "discontinued, still listed elsewhere as approved" },
  ];

  return (
    <div className="border-y border-line bg-surface/40">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 py-6">
            {stats.map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <span className="font-mono text-[1.5rem] font-semibold tabular text-text">{s.value}</span>
                <span className="text-[13.5px] text-muted">{s.label}</span>
              </div>
            ))}
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">
              Last checked {APPROVED_LAST_CHECKED} against Drugs@FDA
            </span>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
