import Link from "next/link";

import { Container, PageHeader, Prose, Section, SectionHeader, StatusChip } from "@/components/site/ui";
import WhatWeVerify from "@/components/site/sections/WhatWeVerify";

/* Methodology. The seven gates are the homepage's own section, reused so the
   method can never be described two ways. Around it: what we do not do, what
   each status means, and how the commission is kept away from the verdict. */

const STATUSES = [
  {
    status: "verified" as const,
    body: "The certificate passed all seven checks: it loads, names a laboratory that confirms it, was issued to this vendor, names the lot, matches the product page, and is recent.",
  },
  {
    status: "review" as const,
    body: "A check failed or could not be completed, and the vendor has been asked to fix it. The record stays visible, with the open question stated.",
  },
  {
    status: "delisted" as const,
    body: "The vendor could not fix it, or the certificate was withdrawn. The record is kept permanently, with the reason for removal.",
  },
];

export default function MethodologyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Methodology"
        title="What we check, and what we refuse to do."
        lede="Every vendor is checked the same way, whether it has sold for five years or listed last week. No vendor pays for a place, and no vendor sees its record before it is published."
      />

      <Section className="!pb-10">
        <Container>
          <Prose>
            <h2>We do not test anything</h2>
            <p>
              <strong>PeptideChecker runs no laboratory and commissions no testing.</strong> We do not buy
              samples, we do not send them anywhere, and no figure on this site comes from a test we paid for.
            </p>
            <p>
              What we check is the evidence that already exists. Anyone can print &ldquo;third-party
              tested&rdquo; on a product page. Far fewer publish the actual certificate, and fewer still publish
              one tied to the lot you would receive. That gap is the entire job.
            </p>
          </Prose>
        </Container>
      </Section>

      <WhatWeVerify />

      <Section className="border-t border-line">
        <Container>
          <SectionHeader eyebrow="Statuses" title="Three outcomes, and none of them is silent." />
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {STATUSES.map((s) => (
              <li key={s.status} className="rounded-lg border border-line bg-surface p-5">
                <StatusChip status={s.status} />
                <p className="mt-4 text-[15px] leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-[68ch] text-[14.5px] leading-relaxed text-dim">
            A check we could not run, because a vendor&apos;s site blocked us, is recorded as not
            checked. It is never recorded as a failure.
          </p>
        </Container>
      </Section>

      <Section className="border-t border-line">
        <Container>
          <Prose>
            <h2>How this site makes money</h2>
            <p>
              PeptideChecker earns affiliate commission when a reader buys from a vendor listed here, the same
              vendors we publish records on. That is our only revenue. No vendor pays for a listing, a
              position, or a softer verdict.
            </p>
            <p>
              Three rules keep the commission away from the verdict. Every check is against a published
              document you can open yourself. No vendor sees its record before it is published. And the
              commission rate is never an input: two vendors with identical certificates get identical
              records, whatever they pay.
            </p>
            <h2>Removal is immediate</h2>
            <p>
              If a listed vendor&apos;s certificate stops checking out, because it was withdrawn or no longer
              matches the lot on sale, the listing moves to under review or delisted straight away. It is not
              grandfathered in. That has a direct revenue cost, and it is the point: a verification site that
              cannot afford to delist its own earners is not a verification site.
            </p>
            <p>
              See it applied in the <Link href="/vendors">registry</Link>, or check each vendor&apos;s{" "}
              <Link href="/results">certificate record</Link>.
            </p>
          </Prose>
        </Container>
      </Section>
    </>
  );
}
