import { Container, PageHeader, Prose, Section } from "@/components/site/ui";
import { APPROVED_DRUGS, APPROVED_LAST_CHECKED } from "@/lib/fda-registry";

/* The approved directory - the pivot's core reference table (2026-09-24).

   Every row is real, sourced against the FDA's own Drugs@FDA database - see
   lib/fda-registry.ts for the full source note. Foundayo and Adlyxin get
   their own callouts rather than a plain row, per the brief: Foundayo
   because it is a small molecule people mistake for a peptide, Adlyxin
   because it is discontinued but still shows up on copied "approved
   peptides" lists elsewhere - a live example of the exact problem this
   site exists to catch. */

export const metadata = {
  title: "Every FDA-approved peptide medicine, with its paperwork",
  description:
    "Every FDA-approved peptide medicine with its approval date and application number, sourced from the FDA's own Drugs@FDA database.",
};

export default function ApprovedPage() {
  const rows = APPROVED_DRUGS.filter((d) => d.status === "approved" && d.isPeptide);
  const foundayo = APPROVED_DRUGS.find((d) => d.brand === "Foundayo")!;
  const adlyxin = APPROVED_DRUGS.find((d) => d.brand === "Adlyxin")!;

  return (
    <>
      <PageHeader
        eyebrow="Approved directory"
        title="Every approved peptide medicine, with its paperwork."
        lede="Each entry carries its generic name, its application number, and the date the FDA originally approved it. Approval is granted per use, not in general - later indications were approved on their own dates, and this page does not imply one date covers everything."
      />

      <Section className="!pt-10 sm:!pt-14">
        <Container>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
            Last checked {APPROVED_LAST_CHECKED} against Drugs@FDA
          </p>

          {/* ---- Desktop: a real table ---- */}
          <div
            className="mt-6 hidden overflow-x-auto rounded-lg border border-line md:block"
            role="region"
            aria-label="Approved peptide medicines, scrollable"
            tabIndex={0}
          >
            <table className="w-full min-w-[820px] border-collapse text-left">
              <caption className="sr-only">
                FDA-approved peptide medicines with generic name, application number, sponsor and
                original approval date.
              </caption>
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th scope="col" className="px-5 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">
                    Brand
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">
                    Generic
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">
                    Application
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">
                    Sponsor
                  </th>
                  <th scope="col" className="px-5 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">
                    Original approval
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d, i) => (
                  <tr key={d.brand} className={i === rows.length - 1 ? "" : "border-b border-line"}>
                    <td className="px-5 py-3.5 text-[14px] font-medium text-text">{d.brand}</td>
                    <td className="px-4 py-3.5 text-[14px] text-muted">{d.generic}</td>
                    <td className="px-4 py-3.5 font-mono text-[12.5px] text-muted">{d.applicationNumber}</td>
                    <td className="px-4 py-3.5 text-[14px] text-muted">{d.sponsor}</td>
                    <td className="px-5 py-3.5 font-mono text-[12.5px] tabular text-verified">{d.originalApproval}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---- Mobile: stacked cards ---- */}
          <ul className="mt-6 space-y-3 md:hidden">
            {rows.map((d) => (
              <li key={d.brand} className="rounded-lg border border-line bg-surface p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[15px] font-medium text-text">{d.brand}</p>
                  <span className="font-mono text-[12px] tabular text-verified">{d.originalApproval}</span>
                </div>
                <p className="mt-1 text-[13.5px] text-muted">{d.generic}</p>
                <p className="mt-2 font-mono text-[11.5px] text-dim">
                  {d.applicationNumber} · {d.sponsor}
                </p>
              </li>
            ))}
          </ul>

          {/* ---- Foundayo and Adlyxin: their own callouts, not table rows ---- */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-review/25 bg-review-dim p-5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-review">
                Searched for, but not a peptide
              </p>
              <p className="mt-2 text-[15px] font-medium text-text">
                {foundayo.brand} ({foundayo.generic})
              </p>
              <p className="mt-1.5 font-mono text-[11.5px] text-dim">
                {foundayo.applicationNumber} · {foundayo.sponsor} · approved {foundayo.originalApproval}
              </p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{foundayo.note}</p>
            </div>

            <div className="rounded-lg border border-delisted/25 bg-delisted-dim p-5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-delisted">
                Discontinued
              </p>
              <p className="mt-2 text-[15px] font-medium text-dim line-through decoration-delisted/50">
                {adlyxin.brand} ({adlyxin.generic})
              </p>
              <p className="mt-1.5 font-mono text-[11.5px] text-dim">
                {adlyxin.applicationNumber} · {adlyxin.sponsor}
              </p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{adlyxin.note}</p>
            </div>
          </div>

          <p className="mt-8 rounded-md border border-line bg-surface-2 px-4 py-3 font-mono text-[11.5px] leading-relaxed text-dim">
            This page reports regulatory facts only, sourced from the FDA&rsquo;s own records. It is
            not medical advice, and it is not a claim that any medicine is safe or appropriate for
            you - talk to a clinician about treatment.
          </p>

          <Prose className="mt-10">
            <h2>How to read the application number</h2>
            <p>
              Query the FDA&rsquo;s own record by application number, not brand name - one record
              can carry more than one brand (Ozempic and Rybelsus share a semaglutide record), which
              is how a wrong date gets published elsewhere. Every number above can be checked
              directly at{" "}
              <a href="https://api.fda.gov/drug/drugsfda.json" target="_blank" rel="noopener noreferrer">
                api.fda.gov
              </a>
              .
            </p>
          </Prose>
        </Container>
      </Section>
    </>
  );
}
