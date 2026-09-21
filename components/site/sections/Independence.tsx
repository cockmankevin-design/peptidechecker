"use client";

/* Why independence matters — the structural-conflict section.

   The business fact this section exists to state out loud: PeptideChecker is
   paid affiliate commission by the same vendors it publishes verdicts on. A
   verification site that omits that has already failed the standard it sells.

   The structure is a two-column ledger. Left column admits a pressure on the
   verdict; right column names the mechanism that keeps that pressure off it.
   Every admission is answered on the same row, across one hairline spine, so
   the page never leaves a conflict sitting unaccompanied.

   Deliberate colour restraint: a "conflict" is NOT rendered in delisted-red
   and a "control" is NOT rendered in verified-green. Those colours are
   verdicts about a vendor's evidence; borrowing them as decoration here would
   teach the reader to misread them everywhere else. The hierarchy is carried
   by weight and text colour instead - the control side simply sits brighter
   than the admission it answers. The accent appears once, on the only link. */

import { Container, CTA, Reveal, Section, SectionHeader } from "@/components/site/ui";

type Pairing = {
  id: string;
  conflict: { claim: string; detail: string };
  control: { claim: string; detail: string };
};

const PAIRINGS: Pairing[] = [
  {
    id: "01",
    conflict: {
      claim: "Our revenue comes from the companies we assess.",
      detail:
        "We earn affiliate commission on referrals to listed vendors. Every verdict published here has money attached to it.",
    },
    control: {
      claim: "Every input is a document you can open yourself.",
      detail:
        "A verification cites the certificate, the laboratory named on it, and the lot it is supposed to belong to — all of it already published by the vendor, all of it linked. Nothing enters a verdict that you cannot check without us.",
    },
  },
  {
    id: "02",
    conflict: {
      claim: "A vendor could push back before publication.",
      detail:
        "The usual arrangement in this industry is a preview, a quiet correction window, and a call from someone senior.",
    },
    control: {
      claim: "No vendor sees a result before it is public.",
      detail:
        "There is no preview, no embargo, and no right of reply held open while a listing gets negotiated. A vendor learns its outcome when you do, and argues with it afterwards, in public, using documents.",
    },
  },
  {
    id: "03",
    conflict: {
      claim: "Some vendors pay more than others.",
      detail:
        "Commission rates differ, which creates the obvious incentive to grade the generous ones gently.",
    },
    control: {
      claim: "The rate is never one of the inputs.",
      detail:
        "Assessment runs on evidence only: whether the certificate is real, whether it names its laboratory, whether it matches the lot on sale. Two vendors with identical evidence get identical outcomes. What either pays is not in the record being read.",
    },
  },
  {
    id: "04",
    conflict: {
      claim: "Removing a vendor costs us money.",
      detail:
        "A delisting deletes a revenue line. The cheapest thing we could do is look away and leave the listing up.",
    },
    control: {
      claim: "The vendor comes off anyway.",
      detail:
        "When the evidence fails, or a certificate can no longer be tied to the lot being sold, the listing is removed regardless of what it earned. A list that cannot afford to remove anyone is a catalogue, not a check.",
    },
  },
];

const COMMITMENTS: { label: string; line: string }[] = [
  {
    label: "No paid placement",
    line: "A vendor cannot buy a listing, a position on it, or a softer verdict.",
  },
  {
    label: "No sponsored tier",
    line: "There is no premium version of the registry for a vendor to appear in.",
  },
  {
    label: "Buyers pay nothing",
    line: "Reading the registry is free, has no account behind it, and stays that way.",
  },
];

export default function Independence() {
  return (
    <Section id="independence">
      <Container>
        <SectionHeader
          eyebrow="Independence"
          title="We earn commission from the vendors we publish."
          lede="That is a genuine conflict, and concealing it would be the first thing wrong with a site like this. It is survivable for one reason: the commission never reaches the evidence. Each pressure on a verdict is below, next to the structure that keeps it off."
        />

        <div className="mt-12 overflow-hidden rounded-lg border border-line bg-surface/40 sm:mt-16">
          <dl className="divide-y divide-line">
            {PAIRINGS.map((row, i) => (
              <Reveal
                key={row.id}
                delay={i * 0.05}
                className="grid gap-x-10 px-5 py-7 sm:grid-cols-2 sm:px-8 sm:py-9"
              >
                <dt className="min-w-0">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">
                    <span className="tabular">{row.id}</span>
                    <span className="mx-1.5 text-line-strong" aria-hidden="true">
                      /
                    </span>
                    Conflict
                  </p>
                  <p className="mt-3 text-[16px] font-medium leading-snug text-muted">
                    {row.conflict.claim}
                  </p>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-dim">
                    {row.conflict.detail}
                  </p>
                </dt>

                {/* The left rule is the spine: on mobile it reads as the answer
                    indented under the admission, on desktop the rules of every
                    row stack into one continuous column divider. */}
                <dd className="mt-5 min-w-0 border-l border-line pl-5 sm:mt-0 sm:pl-10">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">
                    Control
                  </p>
                  <p className="mt-3 text-[16px] font-medium leading-snug text-text">
                    {row.control.claim}
                  </p>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
                    {row.control.detail}
                  </p>
                </dd>
              </Reveal>
            ))}
          </dl>

          <ul className="grid divide-y divide-line border-t border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {COMMITMENTS.map((c) => (
              <li key={c.label} className="px-5 py-6 sm:px-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text">
                  {c.label}
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-dim">{c.line}</p>
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={0.08}>
          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-[15px] leading-relaxed text-muted">
              There is no version of this registry a vendor can pay to change. The verdict has to
              survive you knowing exactly how we get paid — which is why we say it first.
            </p>
            <CTA href="/methodology#funding" variant="secondary" className="shrink-0">
              How we are funded
            </CTA>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
