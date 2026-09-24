import Link from "next/link";

import { Container, PageHeader, Prose, Section } from "@/components/site/ui";
import { PIPELINE_DRUGS } from "@/lib/fda-registry";

/* Coming soon - the pipeline tracker. Copy follows
   research/page-copy-pipeline-and-cost-2026-09-23.md closely: this is the
   brief's own "hook" page, meant to be the strongest one on the site. */

export const metadata = {
  title: "Peptide drugs awaiting FDA approval: status and dates",
  description:
    "CagriSema, retatrutide, survodutide and MariTide: where each one is in the FDA process, what the trials showed, and when a decision is expected.",
};

const STATUS_LABEL: Record<string, string> = {
  filed: "Filed",
  "phase-3": "In phase 3",
  "trials-complete": "Trials complete",
};

export default function PipelinePage() {
  return (
    <>
      <PageHeader
        eyebrow="Coming soon"
        title="Filed, in trials, or neither."
        lede="Four peptide drugs are moving toward an FDA decision. None of them can be sold in the United States today. This page tracks where each one actually is, using the company's own announcements and the FDA's own records, with the date we last checked."
      />

      <Section className="!pt-10 sm:!pt-14">
        <Container>
          {/* the standing warning, above the table per the brief */}
          <div className="rounded-lg border border-review/25 bg-review-dim p-5 sm:p-6">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-review">
              Read this before the table
            </p>
            <p className="mt-2.5 text-[15px] leading-relaxed text-text">
              A drug in trials cannot be sold legally. If a website is selling something under one
              of these names, it is not that drug, whatever the label or the certificate says. The
              FDA has sent warning letters through 2026 to sellers using the words &ldquo;research use
              only&rdquo; while the rest of the page makes clear it is meant for people.
            </p>
          </div>

          {/* ---- Desktop table ---- */}
          <div className="mt-8 hidden overflow-x-auto rounded-lg border border-line md:block">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <caption className="sr-only">
                Peptide drugs in the FDA approval pipeline, with status, trial results and sources.
              </caption>
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th scope="col" className="px-5 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">
                    Drug
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">
                    Company
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">
                    What the trials showed
                  </th>
                  <th scope="col" className="px-5 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">
                    Last checked
                  </th>
                </tr>
              </thead>
              <tbody>
                {PIPELINE_DRUGS.map((d, i) => (
                  <tr key={d.drug} className={i === PIPELINE_DRUGS.length - 1 ? "" : "border-b border-line"}>
                    <td className="px-5 py-4 align-top text-[14px] font-medium text-text">{d.drug}</td>
                    <td className="px-4 py-4 align-top text-[14px] text-muted">{d.company}</td>
                    <td className="px-4 py-4 align-top">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-dim px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-accent">
                        {STATUS_LABEL[d.status]}
                      </span>
                      <p className="mt-2 max-w-[32ch] text-[12.5px] leading-relaxed text-dim">
                        {d.statusDetail}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top max-w-[26ch] text-[13px] leading-relaxed text-muted">
                      {d.trialResult}
                      <span className="mt-1.5 block font-mono text-[10.5px] text-dim">{d.source}</span>
                    </td>
                    <td className="px-5 py-4 align-top font-mono text-[12px] tabular text-dim">
                      {d.lastChecked}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---- Mobile cards ---- */}
          <ul className="mt-8 space-y-3 md:hidden">
            {PIPELINE_DRUGS.map((d) => (
              <li key={d.drug} className="rounded-lg border border-line bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-[15px] font-medium text-text">{d.drug}</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-dim px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-accent">
                    {STATUS_LABEL[d.status]}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-muted">{d.company}</p>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">{d.statusDetail}</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-dim">{d.trialResult}</p>
                <p className="mt-2 font-mono text-[11px] text-dim">
                  {d.source} · checked {d.lastChecked}
                </p>
              </li>
            ))}
          </ul>

          <Prose className="mt-10">
            <h2>How to read this page</h2>
            <p>
              <strong>Filed</strong> means the company has submitted its application and the FDA is
              reviewing it. It does not mean approval is coming.
            </p>
            <p>
              <strong>In phase 3</strong> means the final round of trials is running. Most drugs
              that reach this stage still take years, and some never arrive.
            </p>
            <p>
              A decision window is not a date. Where a company says &ldquo;expected late
              2026,&rdquo; that is the company talking, not the FDA. When the FDA sets a formal
              decision date and it is made public, this page will say so.
            </p>
            <p>
              Trial results are the company&rsquo;s own reported figures, from its own announcement.
              We have not audited them and nothing here tells you what they mean for you.
            </p>

            <h2>One of these is already approved, and it is not a peptide</h2>
            <p>
              Orforglipron, sold as Foundayo, was approved on 1 April 2026 under application
              NDA220934. It gets searched for alongside the drugs above, so it is worth naming: it
              is a small molecule, not a peptide. It is in the{" "}
              <Link href="/approved">approved directory</Link>.
            </p>
          </Prose>
        </Container>
      </Section>
    </>
  );
}
