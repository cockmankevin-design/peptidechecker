import Link from "next/link";

import { Container, PageHeader, Prose, Section, SectionHeader, StatusChip } from "@/components/site/ui";
import WhatWeVerify from "@/components/site/sections/WhatWeVerify";

/* Methodology, demoted the same way the homepage was for the 2026-09-24 pivot
   (see app/page.tsx's own comment). FDA-approval and pipeline sourcing lead,
   the telehealth-commission funding section follows, and the seven gates /
   vendor statuses survive afterward as a smaller evidence section, not the
   site's main argument - same treatment as EvidenceSummary on the homepage. */

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
        title="How every fact here gets checked."
        lede="Two different checks live on this site. Approved-medicine facts are checked against the FDA's own records. A smaller, separate check still verifies grey-market vendor certificates - evidence for why the legal routes are worth it, not the site's main argument anymore."
      />

      <Section className="!pb-10">
        <Container>
          <Prose>
            <h2>FDA approvals and the pipeline</h2>
            <p>
              PeptideChecker runs no laboratory and commissions no testing of any medicine or compound. Every
              approval on this site is checked against the FDA&rsquo;s own Drugs@FDA record under the
              application number shown on the page &mdash; the same number anyone can query directly at
              api.fda.gov. Every pipeline entry is sourced to the company&rsquo;s own filing or trial
              announcement, not a reseller&rsquo;s claim or a copied list. Both pages show the date we last
              checked them, and both are re-checked monthly.
            </p>
            <h2>Cost</h2>
            <p>
              The <Link href="/cost">cost page</Link> compares insurance, manufacturer direct-pay and licensed
              telehealth using prices published on each provider&rsquo;s own site, with the date we read them.
              We do not estimate or average a price we have not seen published.
            </p>
          </Prose>
        </Container>
      </Section>

      <Section className="border-t border-line">
        <Container>
          <Prose>
            <h2>How this site makes money</h2>
            <p>
              We intend to earn a commission when a reader signs up with a licensed telehealth provider
              compared on the <Link href="/get-started">get-started page</Link>. That is not live yet: no
              provider currently pays us anything, and no affiliate agreement is in place. Every provider we
              know of is compared the same way regardless.
            </p>
            <p>
              When it starts, three rules keep the commission away from the comparison. It will never move a
              price we publish &mdash; those come from each provider&rsquo;s own page, not from us. It will
              never buy a place in the order providers appear. And a provider paying a higher rate will not
              read more favourably than one paying nothing: the comparison covers what each one prescribes,
              whether it is branded or compounded, and how quickly someone is seen, not who pays best.
            </p>
            <p>
              We earn nothing from the grey-market vendors described below. No vendor listing, on this site or
              anywhere else, has ever carried a purchase or affiliate link.
            </p>
          </Prose>
        </Container>
      </Section>

      <Section className="border-t border-line">
        <Container>
          <SectionHeader
            eyebrow="Also on this site"
            title="Why the unregulated sellers fail"
            lede="A smaller check than it used to be. It exists as evidence for why the legal routes above are worth their price, not as a shopping guide - nothing below links out to a vendor."
          />
        </Container>
      </Section>

      <WhatWeVerify />

      <Section className="border-t border-line">
        <Container>
          <SectionHeader eyebrow="Statuses" title="Three outcomes, and none of them is silent." />
          <p className="mt-4 max-w-[68ch] text-[14.5px] leading-relaxed text-dim">
            These three statuses apply to the vendor registry only &mdash; a demonstration dataset while the
            first real audits are verified.
          </p>
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
          <p className="mt-6 max-w-[68ch] text-[14.5px] leading-relaxed text-muted">
            See it applied in the <Link href="/vendors">registry</Link>, or check each vendor&apos;s{" "}
            <Link href="/results">certificate record</Link>.
          </p>
        </Container>
      </Section>
    </>
  );
}
