"use client";

/* Public registry preview.

   The structural idea: a delisted vendor is not a row that failed to render -
   it is a TWO-PART record. The record line stays in sequence, in the same
   columns as everything else, and carries a second line beneath it holding the
   reason it was removed. That reason is the most useful thing on this page,
   so it gets its own annotation row rather than being crushed into a seventh
   column or hidden behind a tooltip.

   The consequence, deliberately: the table cannot be skimmed for green ticks.
   A reader who scrolls it has to read why two vendors are gone.

   Desktop gets a real <table> because this is tabular data and screen readers
   should be told so. Mobile gets stacked records instead - a six-column table
   on a phone is a horizontal-scroll puzzle, not a document. Both render the
   same rows from the same source; neither is a shrunken version of the other. */

import Link from "next/link";

import {
  Container,
  CTA,
  DataField,
  DemoNotice,
  Reveal,
  Section,
  SectionHeader,
  StatusChip,
} from "@/components/site/ui";
import { DEMO_REGISTRY, registryTally, type RegistryRow } from "@/lib/demo-registry";

/* --------------------------------------------------------------------------
   Absence

   A missing lot is not a formatting gap, it is the finding. It gets words.
   A missing lab on an already-delisted row is downstream of that,
   so it gets a rule - legible to sighted readers, spoken to screen readers.
   -------------------------------------------------------------------------- */

function NotPublished() {
  return <span className="text-dim">Not published</span>;
}

function Absent() {
  return (
    <span className="text-dim">
      <span aria-hidden="true">—</span>
      <span className="sr-only">Not published</span>
    </span>
  );
}

/* --------------------------------------------------------------------------
   Tally strip
   -------------------------------------------------------------------------- */

function TallyItem({ count, label, dot }: { count: number; label: string; dot: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      <span className="tabular text-text">{count}</span>
      <span className="text-muted">{label}</span>
    </span>
  );
}

/* --------------------------------------------------------------------------
   The retained removal reason

   Shared by the table row and the mobile card so the wording can never drift
   between the two layouts. The left rule is delisted-red because it marks a
   verdict, not because red is decorative.
   -------------------------------------------------------------------------- */

function RemovalReason({ reason }: { reason: string }) {
  return (
    <div className="border-l-2 border-delisted/40 pl-3">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">
        Reason for removal
      </span>
      <p className="mt-1 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">{reason}</p>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Desktop cells
   -------------------------------------------------------------------------- */

const TH =
  "px-4 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim";
const TD = "px-4 py-4 align-top font-mono tabular text-[13px] text-muted";

function VendorName({ row }: { row: RegistryRow }) {
  const delisted = row.status === "delisted";
  return (
    <Link
      href={`/vendors/${row.slug}`}
      className="hover:underline hover:decoration-accent/60"
    >
    <span
      className={
        delisted
          ? "text-[14.5px] text-dim line-through decoration-delisted/50 decoration-1"
          : "text-[14.5px] font-medium text-text"
      }
    >
      {row.vendor}
    </span>
    </Link>
  );
}

/* --------------------------------------------------------------------------
   Section
   -------------------------------------------------------------------------- */

export default function RegistryPreview({ page = false }: { page?: boolean }) {
  const tally = registryTally();
  const rows = DEMO_REGISTRY;

  return (
    <Section id="registry" className={page ? "!pt-10 sm:!pt-14" : ""}>
      <Container>
        {!page && (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            title="Every listing, including the ones we took down."
            lede="A vendor appears here when a published certificate can be tied to the lot actually being sold. When that link breaks, the entry is marked and kept — not quietly deleted. A record that vanishes the moment it becomes inconvenient is not a record."
          />
          <Reveal delay={0.18} className="shrink-0 lg:pb-1">
            <CTA href="/vendors" variant="secondary">
              Open the full registry
            </CTA>
          </Reveal>
        </div>
        )}

        <Reveal delay={0.08} className={page ? "flex" : "mt-10 flex"}>
          <DemoNotice />
        </Reveal>

        {/* Summary line. Counts are derived, so they cannot drift from the rows
            printed underneath them. */}
        <Reveal delay={0.12}>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-line py-3 font-mono text-[11.5px]">
            <span className="tabular text-muted">
              {tally.total} records{page ? "" : " in this preview"}
            </span>
            <span className="hidden h-3 w-px bg-line sm:block" aria-hidden="true" />
            <TallyItem count={tally.verified} label="verified" dot="bg-verified" />
            <TallyItem count={tally.review} label="under review" dot="bg-review" />
            <TallyItem count={tally.delisted} label="delisted" dot="bg-delisted" />
          </div>
        </Reveal>

        {/* ---- Desktop: a real table -------------------------------------- */}
        <Reveal delay={0.16}>
          <div
            className="mt-6 hidden overflow-x-auto rounded-lg border border-line md:block"
            role="region"
            aria-label="Vendor registry preview, scrollable"
            tabIndex={0}
          >
            <table className="w-full min-w-[880px] border-collapse text-left">
              <caption className="sr-only">
                Demonstration registry preview: vendor, verification status, lot reference,
                testing laboratory and date last reviewed. Delisted entries
                are retained and carry the reason for removal.
              </caption>
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th scope="col" className={`${TH} pl-5`}>
                    Vendor
                  </th>
                  <th scope="col" className={TH}>
                    Status
                  </th>
                  <th scope="col" className={TH}>
                    Lot
                  </th>
                  <th scope="col" className={TH}>
                    Lab
                  </th>
                  <th scope="col" className={`${TH} pr-5`}>
                    Last reviewed
                  </th>
                </tr>
              </thead>

              {rows.map((row, i) => {
                const last = i === rows.length - 1;
                const edge = last ? "" : "border-b border-line";
                return (
                  /* One <tbody> per vendor: the record line and its removal
                     reason are a single unit, not two unrelated rows. */
                  <tbody key={row.vendor} className="bg-bg">
                    <tr className={row.reason ? "" : edge}>
                      <th scope="row" className="px-4 py-4 pl-5 text-left align-top font-normal">
                        <VendorName row={row} />
                      </th>
                      <td className="px-4 py-4 align-top">
                        <StatusChip status={row.status} />
                      </td>
                      <td className={TD}>{row.lot ?? <NotPublished />}</td>
                      <td className={TD}>{row.lab ?? <Absent />}</td>
                      <td className={`${TD} pr-5`}>
                        <time dateTime={row.lastReviewed}>{row.lastReviewed}</time>
                      </td>
                    </tr>

                    {row.reason && (
                      <tr className={edge}>
                        <td colSpan={5} className="px-4 pb-5 pl-5 pr-5 pt-0">
                          <RemovalReason reason={row.reason} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
            </table>
          </div>
        </Reveal>

        {/* ---- Mobile: stacked records ------------------------------------ */}
        <Reveal delay={0.16} className="md:hidden">
          <ul className="mt-6 space-y-3">
            {rows.map((row) => (
              <li key={row.vendor}>
                <article className="rounded-lg border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="min-w-0">
                      <VendorName row={row} />
                    </h3>
                    <StatusChip status={row.status} />
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3.5">
                    <DataField label="Lot" value={row.lot ?? <NotPublished />} />
                    <DataField label="Lab" value={row.lab ?? <Absent />} />
                    <DataField
                      label="Last reviewed"
                      value={<time dateTime={row.lastReviewed}>{row.lastReviewed}</time>}
                    />
                  </dl>

                  {row.reason && (
                    <div className="mt-4 border-t border-line pt-4">
                      <RemovalReason reason={row.reason} />
                    </div>
                  )}
                </article>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.06}>
          <p className="mt-6 font-mono text-[11.5px] leading-relaxed text-dim">
            Delisted entries stay on this page permanently. Nothing is removed from the record.
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
