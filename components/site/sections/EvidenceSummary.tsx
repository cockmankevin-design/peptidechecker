"use client";

import Link from "next/link";

import { Container, Reveal, Section, SectionHeader } from "@/components/site/ui";

/* Why the unregulated sellers fail - the shrunk evidence section
   (2026-09-24 pivot build).

   This used to be the homepage: Problem, the seven gates, the full
   registry, SayNo, Independence, VendorCTA - five sections built around
   grey-market vendor verification. The pivot brief is explicit that this
   survives as ONE small section, never a shopping directory: no affiliate
   links, no purchase links, no ranking, no named accusations. The full
   seven-gate methodology and vendor registry still exist at /methodology
   and /vendors for anyone who wants the detail - this is the homepage's
   one paragraph pointing at them, not the homepage's main argument
   anymore. Copy follows research/homepage-copy-2026-09-23.md section 5. */

export default function EvidenceSummary() {
  return (
    <Section id="why-unregulated-sellers-fail" className="border-t border-line">
      <Container>
        <SectionHeader
          eyebrow="Why the unregulated sellers fail"
          title="&ldquo;Third-party tested&rdquo; is not the same as approved."
          lede={
            <>
              Vendors selling research peptides publish a certificate of analysis. We have read a
              lot of them. Some name a laboratory that says it never issued the document. Some name
              a different company as the client. Some are one file reused across an entire
              catalogue, and some are two years old.
            </>
          }
        />
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            Even a certificate that survives every check only describes the sample that lab
            received. It is not an approval, it says nothing about sterility unless the document
            says so, and if the vial is different, nobody is accountable.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <Link
            href="/methodology"
            className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-accent hover:underline"
          >
            See how the checks work
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </Reveal>
      </Container>
    </Section>
  );
}
