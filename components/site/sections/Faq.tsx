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
    q: "Does PeptideChecker sell peptides?",
    a: (
      <p>
        No, and it never will. There is no cart, no inventory and nothing to ship — we never
        hold product at any point. Grading the thing you also sell is the conflict that made
        this site necessary, so the two stay apart. It is the only reason a verdict here is
        worth reading.
      </p>
    ),
  },
  {
    id: "lab",
    q: "Do you run the lab tests?",
    a: (
      <>
        <p>
          No. We operate no laboratory and commission no testing. We verify certificates that
          vendors have already published: that the document exists, that it names an
          independent lab, and that it belongs to the lot actually on sale.
        </p>
        <p className="mt-3">
          That boundary is not modesty, it is why the check scales. Reading a published
          document costs a fraction of assaying a vial, so one market can be covered and
          re-checked whenever a certificate changes — which is when the failures show up.
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
          Affiliate commission on referrals to listed vendors. Stated plainly, because you
          should be able to price it into how much you trust us.
        </p>
        <p className="mt-3">
          Two things it does not buy. It does not move a verification outcome, and it does not
          buy a place on the list: there is no paid placement, no sponsored row, no status for
          sale. A vendor that pays us is removed on the same evidence as one that does not, and
          commission is earned after a listing passes — never in exchange for passing it.
        </p>
      </>
    ),
  },
  {
    id: "checked",
    q: "What actually gets checked?",
    a: (
      <>
        <p>
          Seven gates, applied in order to a real product’s certificate rather than to a vendor’s
          description of its own standards.
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
          A certificate that fails any gate counts as no certificate at all. A gate we were
          unable to check is recorded as blocked — never quietly converted into a fail.
        </p>
      </>
    ),
  },
  {
    id: "fails",
    q: "What happens when a vendor fails?",
    a: (
      <p>
        The listing comes off, and the reason goes up in plain language. The record then stays:
        a removal that quietly disappears is a delisting nobody can audit, and it lets the same
        vendor reappear next quarter with a clean page. Anyone can be re-checked, and anyone can
        return on new evidence. What nobody can do is have the old entry deleted.
      </p>
    ),
  },
  {
    id: "real",
    q: "Are these real vendors?",
    a: (
      <>
        <p>
          No. Every vendor name, lot number and figure shown in the registry on this site is
          demonstration data, invented to show the format while the first audits are verified. A
          real vendor appears only after a real certificate has been through the seven gates and
          a second pass has confirmed the read.
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
        No. Nothing here is medical advice, a dosage, or a claim that any compound is safe or
        effective. These materials are for research use only. What we verify is documentary —
        whether a certificate is real and belongs to the lot in front of you. Whether you should
        be taking anything at all is a question for a physician, not a registry.
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
