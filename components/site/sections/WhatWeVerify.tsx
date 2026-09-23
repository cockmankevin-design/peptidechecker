"use client";

/* WHAT WE VERIFY - the seven gates.

   The structural idea is a gauntlet, not a scorecard. The seven checks are laid
   out as one continuous vertical chain: a hairline spine runs from the first
   numbered marker down through every gate to a single terminal node at the
   bottom. You can only reach the end by passing through all seven, and each gate
   carries the exact condition that ends the run. Numbering is used because the
   order is real - a certificate that does not load cannot be checked for a lab
   name - so the ordinals are earned rather than decorative.

   The second half states the boundary: no lab, no commissioned testing, no
   product handled. That is presented as the reason the check scales, not as a
   disclaimer buried at the bottom.

   Animation is <Reveal> only, staggered down the chain so the sequence reads in
   order. Reduced motion is handled inside <Reveal>. */

import { ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";

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
    title: "The lab's own records confirm it",
    body: "A lab name on a PDF can be copied onto a forged document. So we check the certificate against the laboratory itself: its public lookup, verification key or QR code has to resolve to this report, with the same compound and result. If the lab cannot confirm the document, nothing proves it issued it.",
    failsOn: "key: no match · lab denies issuing",
  },
  {
    n: "04",
    title: "It was issued to this vendor",
    body: "Every certificate names the client that sent the sample. If that line names a different company, the document describes someone else's product, borrowed to make a storefront look tested. The client on the certificate has to be the vendor selling the vial.",
    failsOn: "client: another brand",
  },
  {
    n: "05",
    title: "It names a specific lot",
    body: "A certificate with no lot number cannot be tied to anything. One generic PDF reused across a catalogue describes a batch that was tested once, somewhere, and says nothing about the vial being shipped to you. The lot on the document has to be the lot on the label.",
    failsOn: "lot: absent · one COA, many listings",
  },
  {
    n: "06",
    title: "It matches the product page",
    body: "This gate is arithmetic, not chemistry. Compound and strength on the certificate have to agree with the listing that links to it. A 10 mg listing carrying a 5 mg report is a mismatch whether or not anyone intended it.",
    failsOn: "page 10 mg / COA 5 mg",
  },
  {
    n: "07",
    title: "It is current",
    body: "A certificate describes one sample on one day. If it was tested more than six months ago, it almost certainly describes a lot that has already sold through, not the one being shipped now.",
    failsOn: "tested > 6 months ago",
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
              title="Seven gates. A certificate clears all seven, or it clears none."
              lede="Every listing runs the same sequence in the same order. Each gate asks one question the document either answers or does not, and the run stops at the first no."
            />
          </div>

          <Reveal delay={0.18} className="lg:col-span-4 lg:col-start-9 lg:self-end">
            <div className="rounded-lg border border-line bg-surface p-5">
              <Eyebrow>Pass condition</Eyebrow>
              <p className="mt-3 font-mono text-[13px] leading-relaxed text-muted">
                <span className="text-text tabular">7 of 7.</span> No partial credit, no
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

        {/* Terminal node. The chain from gate 07 runs straight into it, which is
            the whole argument: this status is downstream of all seven. */}
        <Reveal delay={0.32}>
          <div className="grid grid-cols-[2.25rem_1fr] gap-x-4 sm:gap-x-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface">
              <Check className="h-4 w-4 text-verified" aria-hidden="true" />
            </span>
            <div className="min-w-0 pt-1">
              <p className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[15px] leading-relaxed text-text">
                <span>Only past the seventh gate does a listing carry</span>
                <StatusChip status="verified" />
              </p>
              <p className="mt-2 max-w-[58ch] font-mono text-[12px] leading-relaxed text-dim">
                One gate short is not mostly verified. It is not verified.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Gate 6 made concrete. "Matches the product page" is the gate most
            likely to stay abstract, so it gets one worked example: the actual
            three-node path a check like this traces, named and linked rather
            than described. Real internal link to the product page; the
            certificate and lab are illustrative, same as the Hero record. */}
        <Reveal delay={0.1}>
          <div className="mt-14 rounded-lg border border-line bg-surface p-5 sm:p-6">
            <Eyebrow>Gate 06, traced</Eyebrow>
            <p className="mt-2 max-w-[58ch] text-[13.5px] leading-relaxed text-muted">
              What &ldquo;matches the product page&rdquo; actually checks — three things, named
              and followed, not taken on trust.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
              <Link
                href="/peptides/bpc-157"
                className="group rounded-md border border-line bg-surface-2 p-3.5 transition-colors hover:border-accent/40"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
                  Product page
                </p>
                <p className="mt-1.5 text-[13.5px] text-text">BPC-157 · 10&nbsp;mg</p>
                <p className="mt-0.5 font-mono text-[11px] text-dim group-hover:text-accent">
                  /peptides/bpc-157
                </p>
              </Link>

              <ArrowRight
                className="hidden h-4 w-4 shrink-0 rotate-90 text-dim sm:block sm:rotate-0"
                aria-hidden="true"
              />

              <div className="rounded-md border border-line bg-surface-2 p-3.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
                  Certificate
                </p>
                <p className="mt-1.5 text-[13.5px] text-text">10&nbsp;mg · Lot AG-4471-A</p>
                <p className="mt-0.5 font-mono text-[11px] text-dim">COA-2026-0811.pdf</p>
              </div>

              <ArrowRight
                className="hidden h-4 w-4 shrink-0 rotate-90 text-dim sm:block sm:rotate-0"
                aria-hidden="true"
              />

              <div className="rounded-md border border-line bg-surface-2 p-3.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
                  Laboratory
                </p>
                <p className="mt-1.5 text-[13.5px] text-text">Independent Lab A</p>
                <p className="mt-0.5 font-mono text-[11px] text-verified">Issuance confirmed</p>
              </div>
            </div>

            <p className="mt-4 font-mono text-[10.5px] leading-relaxed text-dim">
              Illustrative trace — see the <Link href="/vendors/ashgrove-bio" className="underline decoration-line-strong underline-offset-2 hover:text-accent">full record</Link>
            </p>
          </div>
        </Reveal>

        <Hairline className="mt-14 sm:mt-16" />

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
                costs minutes, so the same seven gates can run across a whole catalogue, run again
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
