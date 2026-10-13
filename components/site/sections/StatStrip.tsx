"use client";

import { GlassPanel, Pill, Reveal, StatTile, StopSection } from "@/components/site/ui";
import { APPROVED_DRUGS, APPROVED_LAST_CHECKED, PIPELINE_DRUGS } from "@/lib/fda-registry";

/* Stat strip, directly under the hero (2026-09-24 pivot build).

   Numbers are derived from lib/fda-registry.ts, never hardcoded, so they
   cannot drift from the rows printed on /approved and /pipeline. The
   discontinued-drug count is the site's best single proof of care: lists
   people copy from each other still carry a drug that's gone.

   Rendered as three KPI tiles (2026-09-24 restyle) rather than inline
   numbers, matching the dashboard-tile pattern used site-wide. */

export default function StatStrip() {
  const approvedCount = APPROVED_DRUGS.filter((d) => d.status === "approved" && d.isPeptide).length;
  const discontinuedCount = APPROVED_DRUGS.filter((d) => d.status === "discontinued").length;
  const pendingCount = PIPELINE_DRUGS.length;

  const stats = [
    {
      value: approvedCount,
      label: "approved peptide medicines",
      pill: <Pill tone="verified">Approved</Pill>,
    },
    {
      value: pendingCount,
      label: "awaiting an FDA decision",
      pill: <Pill tone="review">Pipeline</Pill>,
    },
    {
      value: discontinuedCount,
      label: "discontinued, still listed elsewhere as approved",
      pill: <Pill tone="delisted">Discontinued</Pill>,
    },
  ];

  return (
    <StopSection side="right">
      <Reveal className="w-full max-w-[720px]">
        <GlassPanel>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <StatTile key={s.label} value={s.value} label={s.label} pill={s.pill} />
            ))}
          </div>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
            Last checked {APPROVED_LAST_CHECKED} against Drugs@FDA
          </p>
        </GlassPanel>
      </Reveal>
    </StopSection>
  );
}
