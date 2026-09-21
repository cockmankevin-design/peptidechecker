import Link from "next/link";

import { Container, PageHeader, Prose, Section } from "@/components/site/ui";

/* No origin story here on purpose.

   This page previously opened with an invented anecdote about a friend hospitalised by a bad
   batch. It was fiction presented as the founder's own experience, which is the same problem
   as the fabricated lab data and the "we test the products ourselves" copy - a claim the site
   cannot stand behind. The market argument below is true on its own and needs no victim. */

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Why PeptideChecker exists."
        lede="The research peptide market has no central authority separating sellers who can prove their product from sellers who simply say they can."
      />
      <Section>
        <Container>
          <Prose>
            <p>
              The market has no FDA oversight and no standard testing requirement. Anyone can print
              &ldquo;third-party tested&rdquo; on a product page. Far fewer publish the actual certificate, and
              fewer still publish one tied to the specific lot you would receive.
            </p>
            <p>
              That gap is the whole reason this site exists. Checking it properly means opening every
              certificate, confirming it names a real laboratory, and confirming it refers to the batch on sale
              rather than one generic PDF reused across a catalogue. It is tedious, and almost nobody buying
              does it.
            </p>
            <p>
              So PeptideChecker does it once, in one place, and publishes the result for every vendor,
              including the ones that fail.
            </p>

            <h2>What we are, and what we are not</h2>
            <p>
              We do not sell peptides and we do not run a laboratory. We read the certificates sellers publish,
              check they are real and lot-specific, and record what we find. No vendor can pay for a listing,
              and a listing whose evidence stops checking out is moved to review or delisted, with the reason
              kept on the record.
            </p>
            <p>
              We earn affiliate commission when you buy through a link here. It is our only revenue and it never
              changes a verdict. The <Link href="/methodology">methodology</Link> sets out exactly how a record is
              decided and what keeps the commission away from it.
            </p>
          </Prose>
          <p className="mt-12 border-t border-line pt-6 font-mono text-[11.5px] text-dim">
            PeptideChecker does not sell peptides and does not provide medical advice.
          </p>
        </Container>
      </Section>
    </>
  );
}
