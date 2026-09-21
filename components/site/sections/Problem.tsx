"use client";

/* THE PROBLEM.

   The educational centre of the site. The argument is not "peptides are hard
   to buy" - it is that a completely legitimate-looking certificate still tells
   a buyer nothing unless it names the lot in the box.

   The structural idea: show the SAME document twice. Identical frame, identical
   header, identical six fields. The only thing that changes between the two
   panels is the lot line - blank in one, resolved in the other. Any treatment
   that made the bad document look shabby would let the reader off the hook,
   because in the real world it does not look shabby. It looks exactly like the
   good one.

   Colour discipline: the accent never appears here - nothing in this section is
   interactive. The verdict on each document is carried by the semantic status
   colours through <StatusChip>, which also supplies a text label, so the
   difference survives greyscale and screen readers. */

import type { ReactNode } from "react";

import {
  Container,
  DemoNotice,
  Eyebrow,
  Hairline,
  Reveal,
  Section,
  SectionHeader,
  StatusChip,
  type Status,
} from "@/components/site/ui";
import { DEMO_REGISTRY, type RegistryRow } from "@/lib/demo-registry";

/* One invented vendor from the demo registry supplies both panels, so the
   comparison is genuinely the same record twice rather than two documents. */
const SOURCE: RegistryRow =
  DEMO_REGISTRY.find((row) => row.status === "verified" && row.lot !== null) ?? DEMO_REGISTRY[0];

const DOC_REF = "COA-2026-0731";

/** The six fields that are identical in both panels. The point of the section
    is that all of them can be true and none of them help. */
const SHARED_FIELDS: ReadonlyArray<{ label: string; value: string }> = [
  { label: "Supplier", value: SOURCE.vendor },
  { label: "Compound", value: "BPC-157" },
  { label: "Assay purity", value: "99.4%" }, // a field on the mock document, not a registry figure
  { label: "Method", value: "RP-HPLC / MS" },
  { label: "Report date", value: SOURCE.lastReviewed },
  { label: "Laboratory", value: SOURCE.lab ?? "—" },
];

/* --------------------------------------------------------------------------
   One field row inside a certificate panel
   -------------------------------------------------------------------------- */

function Field({
  label,
  children,
  emphasised = false,
}: {
  label: string;
  children: ReactNode;
  emphasised?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 ${
        emphasised ? "bg-surface-2" : ""
      }`}
    >
      <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">{label}</dt>
      <dd className="text-[13.5px] leading-snug sm:text-right">{children}</dd>
    </div>
  );
}

/* --------------------------------------------------------------------------
   A certificate panel
   -------------------------------------------------------------------------- */

function Certificate({
  index,
  caption,
  captionNote,
  lot,
  status,
  verdict,
}: {
  index: string;
  caption: string;
  captionNote: string;
  /** null renders the blank field - the whole point of the comparison. */
  lot: string | null;
  status: Status;
  verdict: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] tabular text-dim">{index}</span>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{caption}</p>
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-dim">{captionNote}</p>

      {/* Both frames are identical on purpose. A credible document is exactly
          what the problem looks like. */}
      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-3.5">
          <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-text">
            Certificate of Analysis
          </p>
          <p className="font-mono text-[11px] tabular text-dim">{DOC_REF}</p>
        </div>

        <dl className="divide-y divide-line">
          {SHARED_FIELDS.map((field) => (
            <Field key={field.label} label={field.label}>
              <span className="font-mono tabular text-text">{field.value}</span>
            </Field>
          ))}

          <Field label="Lot reference" emphasised>
            {lot ? (
              <>
                <span className="font-mono tabular text-verified">{lot}</span>
                <span className="mt-1 block text-[12px] text-dim">
                  Printed on the vial. Checked against the vendor&rsquo;s own lot record.
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="inline-block h-[10px] w-20 border-b border-dashed border-line-strong"
                  />
                  <span className="font-mono text-review">not stated</span>
                </span>
                <span className="mt-1 block text-[12px] text-dim">
                  Nothing in the document names the vial it describes.
                </span>
              </>
            )}
          </Field>
        </dl>

        <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-start sm:gap-4">
          <StatusChip status={status} className="shrink-0" />
          <p className="text-[13.5px] leading-relaxed text-muted">{verdict}</p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Root cause
   -------------------------------------------------------------------------- */

const ROOT_CAUSE: ReadonlyArray<{ n: string; claim: string; detail: string }> = [
  {
    n: "01",
    claim: "Nothing stops a vendor publishing a certificate.",
    detail:
      "Anyone can send a sample to a laboratory and post the PDF that comes back. The document proves a test happened somewhere, to something.",
  },
  {
    n: "02",
    claim: "No standard says what it has to contain.",
    detail:
      "There is no required format. A report can omit the lot, the date, the method, or the identity of the lab and still look finished on a product page.",
  },
  {
    n: "03",
    claim: "No one checks it describes the bottle.",
    detail:
      "Between the sample that was tested and the vial that ships sits an unverified claim. In most cases nobody has ever put the two side by side.",
  },
];

/* --------------------------------------------------------------------------
   Section
   -------------------------------------------------------------------------- */

export default function Problem() {
  return (
    <Section id="problem">
      <Container>
        <SectionHeader
          eyebrow="The problem"
          title="A genuine certificate can still tell you nothing."
          lede="Not the laboratory name, not the purity figure, not the signature block — none of it connects the document on the page to the vial in the box. Only the lot reference does that, and it is the one field a certificate can quietly leave out."
        />

        <Reveal delay={0.06}>
          <p className="mt-10 max-w-2xl text-[15px] leading-relaxed text-muted">
            Below is one report, shown twice. Same supplier, same compound, same laboratory, same
            numbers, same reference in the header. Six of the seven fields are identical.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-6">
          <Reveal>
            <Certificate
              index="01"
              caption="As published by the seller"
              captionNote="Everything a buyer normally gets to see."
              lot={null}
              status="review"
              verdict="Unverifiable. The figures may well be accurate, but there is no way to establish that they were measured on the material being sold."
            />
          </Reveal>

          <Reveal delay={0.08}>
            <Certificate
              index="02"
              caption="As it has to arrive here"
              captionNote="The same report, carrying the field that ties it to a vial."
              lot={SOURCE.lot}
              status="verified"
              verdict="Verifiable. The lot on the vial matches the lot on the report — which is the moment the numbers above start to mean something."
            />
          </Reveal>
        </div>

        <Reveal delay={0.06}>
          <div className="mt-8 rounded-md border border-line bg-surface-2 p-5 sm:p-6">
            <Eyebrow>The only difference</Eyebrow>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
              One line. Both documents are real, both were produced by a laboratory, and at a glance
              both look like proof. The first one describes a sample. The second one describes{" "}
              <span className="text-text">your</span> sample. Nothing else on either page can tell
              you which situation you are in.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <DemoNotice className="mt-5">
            Demonstration document. Invented supplier and figures, used to show the structure of a
            certificate — not a real verification result.
          </DemoNotice>
        </Reveal>

        <Hairline className="mt-16 sm:mt-20" />

        <div className="mt-12 sm:mt-14">
          <Reveal>
            <Eyebrow>Why it stays this way</Eyebrow>
          </Reveal>

          <dl className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {ROOT_CAUSE.map((item, i) => (
              <Reveal key={item.n} delay={0.06 * i}>
                <div className="border-t border-line pt-4">
                  <span className="font-mono text-[11px] tabular text-dim">{item.n}</span>
                  <dt className="mt-3 text-[15.5px] font-medium leading-snug text-text">
                    {item.claim}
                  </dt>
                  <dd className="mt-2 text-[14px] leading-relaxed text-muted">{item.detail}</dd>
                </div>
              </Reveal>
            ))}
          </dl>

          <Reveal delay={0.06}>
            <div className="mt-12 border-l-2 border-line-strong pl-5 sm:mt-14 sm:pl-6">
              <p className="max-w-2xl text-[clamp(1.15rem,2.6vw,1.55rem)] font-medium leading-[1.3] text-text">
                A signal that costs nothing to produce carries no information.
              </p>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
                That is the whole failure. When every seller can display a certificate, displaying
                one stops separating the careful from the careless. PeptideChecker runs no
                laboratory and tests no product. It reads the certificates vendors already publish,
                checks whether each one resolves to the lot being sold, and puts the answer on the
                public record — including when the answer is no.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
