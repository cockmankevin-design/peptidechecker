import Link from "next/link";

import Hero from "@/components/site/sections/Hero";
import StatStrip from "@/components/site/sections/StatStrip";
import PivotIndex from "@/components/site/sections/PivotIndex";
import EvidenceSummary from "@/components/site/sections/EvidenceSummary";
import { Container, Reveal, Section } from "@/components/site/ui";

/* Homepage, rebuilt around the 2026-09-24 pivot.

   The order is the pivot brief's own argument, not the old grey-market
   argument this replaced:

     Hero            - what this is, in five seconds
     StatStrip       - the real numbers, immediately (index-first)
     PivotIndex      - routes into the four reference pages, the actual product
     EvidenceSummary - why the unregulated sellers fail, ONE small section now,
                       not five - the full seven-gate detail still lives at
                       /methodology and /vendors for anyone who wants it
     Closing band    - check anything here against the source

   Previously: Problem, VerificationScroll, WhatWeVerify, RegistryPreview,
   SayNo, Independence and VendorCTA WERE the homepage - five-plus sections
   built entirely around grey-market vendor verification. Demoted per the
   pivot brief, which is explicit that the vendor-evidence section survives
   small, never as the site's main argument. Faq removed from the homepage
   for the same reason: its seven answers were written for the retired
   framing and would misrepresent the new one until rewritten (still live,
   unchanged, at /faq). */

export default function Home() {
  return (
    <>
      <Hero />
      <StatStrip />
      <PivotIndex />
      <EvidenceSummary />

      <Section className="border-t border-line">
        <Container>
          <Reveal className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[1.35rem] font-semibold text-text">
                Check anything here against the source.
              </p>
              <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-muted">
                Every approval lists its FDA application number. Every pipeline date lists the
                announcement it came from. Every page says when it was last checked.
              </p>
            </div>
            <Link
              href="/approved"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-5 py-3 text-[15px] font-medium text-bg transition-colors duration-200 hover:bg-accent-hover"
            >
              Open the directory
            </Link>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
