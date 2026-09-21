"use client";

/* WHAT WE VERIFY - the four gates.

   The structural idea is a gauntlet, not a scorecard. The four checks are laid
   out as one continuous vertical chain: a hairline spine runs from the first
   numbered marker down through every gate to a single terminal node at the
   bottom. You can only reach the end by passing through all four, and each gate
   carries the exact condition that ends the run. Numbering is used because the
   order is real - a certificate that does not load cannot be checked for a lab
   name - so the ordinals are earned rather than decorative.

   The second half states the boundary: no lab, no commissioned testing, no
   product handled. That is presented as the reason the check scales, not as a
   disclaimer buried at the bottom.

   Animation is <Reveal> only, staggered down the chain so the sequence reads in
   order. Reduced motion is handled inside <Reveal>. */

import { Check, X } from "lucide-react";

import {
  Container,
  Eyebrow,
  Hairline,
  Reveal,
  Section,
  SectionHeader,
  StatusChip,
} from "@/components/site/ui";

interface Gate {
  /** Displayed ordinal. The sequence is the point, so it is written out. */
  n: string;
  title: string;
  body: string;
  /** The condition that ends the run at this gate. Kept mono and terse - it is
      a machine-readable failure state, not a sentence. */
  failsOn: string;
}

const GATES: readonly Gate[] = [
  {
    n: "01",
    title: "It exists and it loads",
    body: "We open the certificate ourselves, from the same public link a buyer would use. A dead URL, a login wall, a file that will not render, or a promise that a COA is available on request all read identically from the outside: there is nothing to check.",
    failsOn: "404 · login wall · “on request”",
  },
  {
    n: "02",
    title: "It names the laboratory",
    body: "A result has to come from somewhere accountable. If the document does not identify the lab that produced it — a name that can be looked up, not a cropped header or an unbranded chart — then it is an assertion with a chart on it.",
    failsOn: "lab: not stated · header cropped",
  },
  {
    n: "03",
    title: "It names a specific lot",
    body: "A certificate with no lot number cannot be tied to anything. One generic PDF reused across a catalogue describes a batch that was tested once, somewhere, and says nothing about the vial being shipped to you. The lot on the document has to be the lot on the label.",
    failsOn: "lot: absent · one COA, many listings",
  },
  {
    n: "04",
    title: "It matches the product page",
    body: "The last gate is arithmetic, not chemistry. Compound, strength and date on the certificate have to agree with the listing that links to it. A 10 mg listing carrying a 5 mg report, or a current page pointing at a document from two years ago, is a mismatch whether or not anyone intended it.",
    failsOn: "page 10 mg / COA 5 mg · date drift",
  },
];

const BOUNDARY: readonly { term: string; detail: string }[] = [
  {
    term: "No laboratory operated",
    detail: "We own no bench, no instrument and no analyst. Nothing on this site is measured by us.",
  },
  {
    term: "No testing commissioned",
    detail: "We do not pay for assays or order panels of our own. Every result we read was paid for and published by someone else.",
  },
  {
    term: "No product touched",
    detail: "Nothing is bought, stored, shipped or resold here. We never hold a vial, so we never have a reason to move one.",
  },
];

export default function WhatWeVerify() {
  return (
    <Section id="what-we-verify">
      <Container>
        {/* Header, with the pass condition set beside it so the reader meets the
            all-or-nothing rule before the first gate. */}
        <div className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-7">
            <SectionHeader
              eyebrow="What we verify"
              title="Four gates. A certificate clears all four, or it clears none."
              lede="Every listing runs the same sequence in the same order. Each gate asks one question the document either answers or does not, and the run stops at the first no."
            />
          </div>

          <Reveal delay={0.18} className="lg:col-span-4 lg:col-start-9 lg:self-end">
            <div className="rounded-lg border border-line bg-surface p-5">
              <Eyebrow>Pass condition</Eyebrow>
              <p className="mt-3 font-mono text-[13px] leading-relaxed text-muted">
                <span className="text-text tabular">4 of 4.</span> No partial credit, no
                averaging, no score. A failure at any gate ends the check for the whole listing.
              </p>
            </div>
          </Reveal>
        </div>

        {/* The chain. Each item carries its own spine segment, so the line
            travels with the item as it arrives rather than sitting under it. */}
        <ol className="mt-16 sm:mt-20">
          {GATES.map((gate, i) => (
            <Reveal
              as="li"
              key={gate.n}
              delay={i * 0.08}
              className="relative grid grid-cols-[2.25rem_1fr] gap-x-4 pb-10 sm:gap-x-6 sm:pb-12"
            >
              <span
                aria-hidden="true"
                className="absolute left-[1.125rem] top-9 bottom-0 w-px -translate-x-1/2 bg-line"
              />

              <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface font-mono text-[12px] tabular text-muted">
                {gate.n}
              </span>

              <div className="min-w-0 pt-1">
                <h3 className="text-[17px] font-semibold leading-snug text-text sm:text-[19px]">
                  {gate.title}
                </h3>
                <p className="mt-2.5 max-w-[58ch] text-[15px] leading-relaxed text-muted">
                  {gate.body}
                </p>

                <p className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-md border border-line bg-surface-2 px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-delisted">
                    <X className="h-3 w-3" aria-hidden="true" />
                    Fails on
                  </span>
                  <span className="font-mono text-[12px] leading-relaxed text-muted">
                    {gate.failsOn}
                  </span>
                </p>
              </div>
            </Reveal>
          ))}
        </ol>

        {/* Terminal node. The chain from gate 04 runs straight into it, which is
            the whole argument: this status is downstream of all four. */}
        <Reveal delay={0.32}>
          <div className="grid grid-cols-[2.25rem_1fr] gap-x-4 sm:gap-x-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface">
              <Check className="h-4 w-4 text-verified" aria-hidden="true" />
            </span>
            <div className="min-w-0 pt-1">
              <p className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[15px] leading-relaxed text-text">
                <span>Only past the fourth gate does a listing carry</span>
                <StatusChip status="verified" />
              </p>
              <p className="mt-2 max-w-[58ch] font-mono text-[12px] leading-relaxed text-dim">
                One gate short is not mostly verified. It is not verified.
              </p>
            </div>
          </div>
        </Reveal>

        <Hairline className="mt-20 sm:mt-24" />

        {/* The boundary. Stated as a capability, because it is the reason the
            check can cover a catalogue instead of a single vial. */}
        <div className="mt-12 grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow>The boundary</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <h3 className="mt-4 text-[clamp(1.25rem,2.6vw,1.6rem)] font-semibold leading-tight text-text">
                What we do not do
              </h3>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-muted">
                Three limits, stated plainly. Vagueness about who did the work is the easiest way
                to be misread as a lab, and we are not one.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={0.06}>
              <dl className="divide-y divide-line rounded-lg border border-line">
                {BOUNDARY.map((item) => (
                  <div key={item.term} className="px-4 py-4 sm:px-5">
                    <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">
                      {item.term}
                    </dt>
                    <dd className="mt-2 text-[14.5px] leading-relaxed text-muted">
                      {item.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-6 max-w-[62ch] text-[15px] leading-relaxed text-muted">
                That boundary is the feature. Reading a document a vendor has already published
                costs minutes, so the same four gates can run across a whole catalogue, run again
                when a lot changes, and run again next quarter. Commissioning our own testing
                would buy a deeper look at one vial and a far shorter list.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-4 max-w-[62ch] text-[14px] leading-relaxed text-dim">
                No vendor pays us for a listing or a verdict. Where a listing links out, our
                revenue is affiliate commission — which means refusing one costs us money, and
                that is exactly the trade that makes the refusals worth anything.
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
