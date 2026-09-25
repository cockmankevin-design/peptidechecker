import Link from "next/link";

import { Container, PageHeader, Prose, Section } from "@/components/site/ui";

/* No origin story here on purpose.

   This page previously opened with an invented anecdote about a friend hospitalised by a bad
   batch. It was fiction presented as the founder's own experience, which is the same problem
   as the fabricated lab data and the "we test the products ourselves" copy - a claim the site
   cannot stand behind. The market argument below is true on its own and needs no victim.

   Rewritten for the 2026-09-24 pivot: the site's subject is FDA-approved peptide medicines,
   the approval pipeline, and the legal cost of each, not grey-market vendor certificates. The
   money section matches get-started's own disclosure - no telehealth program is live yet, so
   this page does not claim revenue it does not have. */

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Why PeptideChecker exists."
        lede="Twelve peptide medicines carry FDA approval today. Several more are in trials or under review. Almost nothing sold online under those names says which is which."
      />
      <Section>
        <Container>
          <Prose>
            <p>
              That confusion is the whole reason this site exists. A product page can say
              &ldquo;clinically proven&rdquo; or borrow a drug&rsquo;s name without saying whether the FDA
              has approved anything, whether the compound is still in trials, or whether it was approved once
              and later discontinued. Most buyers have no fast way to tell the three apart.
            </p>
            <p>
              So PeptideChecker reads the primary sources directly: the FDA&rsquo;s own Drugs@FDA record for
              what is approved and when, and each company&rsquo;s own filing or trial announcement for what is
              still pending. Every entry carries its source and the date we last checked it.
            </p>

            <h2>What we are, and what we are not</h2>
            <p>
              We are not a pharmacy, a clinic, or a laboratory. We do not prescribe, and we do not decide
              whether a medicine is right for you &mdash; that is a question for a physician. What we publish
              is documentary: application numbers, filing and trial dates, and prices we have checked against
              each provider&rsquo;s own page.
            </p>
            <p>
              We intend to earn a commission when a reader signs up with a licensed{" "}
              <Link href="/get-started">telehealth provider</Link> listed here. That is not live yet: no
              provider currently pays us anything, and every provider we know of is listed the same way
              regardless. The <Link href="/methodology">methodology</Link> page sets out exactly how a page is
              checked and kept current, including the smaller, separate check we still run on grey-market
              sellers.
            </p>
          </Prose>
          <p className="mt-12 border-t border-line pt-6 font-mono text-[11.5px] text-dim">
            PeptideChecker does not sell peptides, prescribe medicine, or provide medical advice.
          </p>
        </Container>
      </Section>
    </>
  );
}
