"use client";

/* FAQ.

   The section exists to answer the objections a burned buyer arrives with, in
   the order they arrive: are you selling me something, are you making the
   numbers up, who pays you. So the answers lead with the concession - "no",
   "we don't", "affiliate commission" - and explain afterwards. An FAQ that
   opens with a paragraph before the answer reads as a hedge, which on a trust
   site is the same as an admission.

   Structure: a ruled ledger. Each question is a row on a hairline, numbered in
   mono, opening in place. It is deliberately not a grid of cards - a card grid
   implies the items are alternatives to choose between, and these are a
   sequence to read down.

   Accessibility is the point of the component:
   - Real <button> inside an <h3>, so the questions appear in a screen reader's
     heading list and are operable with Enter/Space for free.
   - aria-expanded / aria-controls, with the panel labelled back by the button.
   - The panel is mounted when open regardless of animation state, so the
     content is reachable with motion disabled - the collapse is Motion's
     height:auto, never a raw CSS height transition. */

import { useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";

import { Container, Section, SectionHeader, CTA, DemoNotice } from "@/components/site/ui";
import { DURATION, EASE_OUT_QUINT } from "@/lib/motion";

/* --------------------------------------------------------------------------
   Content
   -------------------------------------------------------------------------- */

interface FaqItem {
  id: string;
  q: string;
  a: ReactNode;
}

/** The seven gates, kept in the order they are applied so the copy here cannot
    drift from `CoaGates` in lib/types.ts. */
const GATES: { label: string; detail: string }[] = [
  {
    label: "01 · Loads",
    detail:
      "The certificate is published and reachable. “Available on request” is a fail — a document nobody can open is not evidence.",
  },
  {
    label: "02 · Names the lab",
    detail:
      "It identifies the issuing laboratory. An unattributed result is an assertion. In-house is not third-party, and we record which it was.",
  },
  {
    label: "03 · Lab confirms it",
    detail:
      "The lab's own lookup, verification key or QR code resolves to this certificate. A lab name copied onto a forged PDF fails here.",
  },
  {
    label: "04 · Issued to this vendor",
    detail:
      "The certificate's client line names the seller. A report issued to another brand describes someone else's product.",
  },
  {
    label: "05 · Names the lot",
    detail:
      "It refers to a specific lot or batch. One generic PDF reused across a whole catalogue says nothing about the vial being shipped.",
  },
  {
    label: "06 · Matches the page",
    detail:
      "Compound and strength agree with what the product page claims. A certificate for a different thing is a certificate for a different thing.",
  },
  {
    label: "07 · Current",
    detail:
      "Tested within the last six months. An older certificate almost certainly describes a lot that has already sold through.",
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "sell",
    q: "Does PeptideChecker sell or prescribe peptide medicines?",
    a: (
      <p>
        No, and it never will. There is no cart, no prescription and nothing to ship — we never
        handle product or write a prescription at any point. We publish what the FDA has approved,
        what is still in trials, and what each legal route costs. Whether a medicine is right for
        you is a question for a physician, not this site.
      </p>
    ),
  },
  {
    id: "verify",
    q: "How do you verify what's approved?",
    a: (
      <>
        <p>
          Against the FDA&rsquo;s own record, under the application number you can look up
          yourself at Drugs@FDA. Approval is granted per use, not in general, so we record what
          each drug was actually approved to treat rather than implying one date covers
          everything.
        </p>
        <p className="mt-3">
          Pipeline entries work the same way, sourced to each company&rsquo;s own filing or trial
          announcement rather than a reseller&rsquo;s claim. Every entry shows the date we last
          checked it, and the site is re-checked monthly.
        </p>
      </>
    ),
  },
  {
    id: "money",
    q: "How do you make money?",
    a: (
      <>
        <p>
          We intend to earn a commission when a reader signs up with a licensed telehealth
          provider through this site.
        </p>
        <p className="mt-3">
          That is not live yet. No provider currently pays us anything, and every provider we
          know of is compared the same way whether or not it ever does. Once it starts, commission
          will not move a price we publish or buy a place in a comparison — a provider that pays
          us more appears no differently than one that pays us nothing.
        </p>
      </>
    ),
  },
  {
    id: "checked",
    q: "What actually gets checked, and what doesn't?",
    a: (
      <>
        <p>
          Two different things, kept separate. The approved directory and pipeline tracker are
          checked against primary sources: the FDA&rsquo;s own database and each company&rsquo;s
          own announcements.
        </p>
        <p className="mt-3">
          Separately, we still read the certificates that grey-market sellers publish for
          compounds sold outside any FDA process — a smaller check now, not the main one, applying
          seven gates in order:
        </p>
        <ul className="mt-4 space-y-3 border-l border-line pl-4">
          {GATES.map((gate) => (
            <li key={gate.label}>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
                {gate.label}
              </span>
              <span className="mt-1 block">{gate.detail}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          That check exists as evidence for why the legal routes are worth the extra cost, not as
          a shopping guide — the full detail is on the methodology page.
        </p>
      </>
    ),
  },
  {
    id: "wrong",
    q: "What happens when something here turns out to be wrong or out of date?",
    a: (
      <p>
        It gets corrected, and the correction is dated. Regulatory status moves fast — a filing
        gets a decision, a price changes — and a distinction we drew yesterday can be wrong today.
        Tell us and we will fix it. Nothing is deleted quietly; when a fact changes, the
        page&rsquo;s &ldquo;last checked&rdquo; date changes with it.
      </p>
    ),
  },
  {
    id: "real",
    q: "Is the vendor registry real?",
    a: (
      <>
        <p>
          No. Every vendor name, lot number and figure in the registry is demonstration data,
          invented to show the format while the first real audits are verified. It exists to
          support the &ldquo;why the unregulated sellers fail&rdquo; evidence, not as a shopping
          list — there is no purchase link anywhere in it.
        </p>
        <DemoNotice className="mt-4" />
      </>
    ),
  },
  {
    id: "medical",
    q: "Is this medical advice?",
    a: (
      <p>
        No. Nothing here is medical advice, a dosage, or a claim that any medicine or provider is
        right for you. What we publish is regulatory status and pricing, drawn from the
        FDA&rsquo;s own records and each company&rsquo;s own statements. Whether you should be
        taking anything, and from whom, is a question for a physician, not a registry.
      </p>
    ),
  },
];

/* --------------------------------------------------------------------------
   One row
   -------------------------------------------------------------------------- */

function FaqRow({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  const buttonId = `faq-${item.id}-q`;
  const panelId = `faq-${item.id}-a`;

  const body = (
    <div className="max-w-[62ch] pb-7 pr-1 text-[15px] leading-relaxed text-muted sm:pl-9">
      {item.a}
    </div>
  );

  return (
    <li className="border-t border-line">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="group flex w-full items-start gap-4 py-5 text-left"
        >
          <span className="mt-[3px] shrink-0 font-mono text-[11px] tabular tracking-[0.14em] text-dim">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="flex-1 text-[16px] font-medium leading-snug text-text transition-colors duration-200 group-hover:text-accent sm:text-[17px]">
            {item.q}
          </span>
          <Plus
            aria-hidden="true"
            strokeWidth={1.5}
            className={`mt-0.5 h-4 w-4 shrink-0 text-dim transition-[transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-accent ${
              open ? "rotate-45 text-accent" : ""
            }`}
          />
        </button>
      </h3>

      {reduced ? (
        open && (
          <div id={panelId} role="region" aria-labelledby={buttonId}>
            {body}
          </div>
        )
      ) : (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="panel"
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: DURATION.base, ease: EASE_OUT_QUINT },
                opacity: { duration: DURATION.fast, ease: EASE_OUT_QUINT },
              }}
              className="overflow-hidden"
            >
              {body}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </li>
  );
}

/* --------------------------------------------------------------------------
   Section
   -------------------------------------------------------------------------- */

export default function Faq() {
  return (
    <Section id="faq" className="border-t border-line">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              title="The obvious objections, answered first."
              lede="What we check, what we refuse to do, and where the money comes from. If an answer here reads like a hedge, it is the wrong answer."
            />
            <div className="mt-8">
              <CTA href="/methodology" variant="secondary">
                Read the full method
              </CTA>
            </div>
          </div>

          <ul className="border-b border-line">
            {FAQ_ITEMS.map((item, i) => (
              <FaqRow key={item.id} item={item} index={i} />
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
