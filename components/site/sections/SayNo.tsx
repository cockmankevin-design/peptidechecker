"use client";

/* "A list that can afford to say no." — the brand argument, staged once.

   The structural idea: this is ONE list, not two. A vendor that fails does not
   disappear from the register; it crosses a rule and settles into the part of
   the same list that is kept on record. Nothing is deleted, so the animation is
   a reordering, not a removal - which is exactly the claim the copy makes.

   Choreography is two beats and then it stops:
     t=1.0s  the row's status resolves to Delisted (chip crossfades, the strike
             draws across the name, the evidence line becomes the reason)
     t=1.9s  the row crosses the rule; the rows above it close up

   Everything animated here is opacity, transform or a Motion layout projection.
   No width/height/top/left is touched. With reduced motion the sequence never
   runs: the settled end state is the first and only render, and the replay
   control is not offered because there is nothing to replay. */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { RotateCcw } from "lucide-react";

import {
  CTA,
  Container,
  DemoNotice,
  Eyebrow,
  Reveal,
  Section,
  SectionHeader,
  StatusChip,
} from "@/components/site/ui";
import { DEMO_REGISTRY, type RegistryRow } from "@/lib/demo-registry";
import { DURATION, EASE_OUT_QUINT, SPRING } from "@/lib/motion";

/* --------------------------------------------------------------------------
   Data

   Rows come from the demonstration registry rather than being written out
   here, so the settled end state of this section is the same record the rest
   of the site renders. The one row that moves is placed mid-list on purpose:
   if it were last, nothing would close up behind it.
   -------------------------------------------------------------------------- */

const TARGET_VENDOR = "Fenwick Compound Co.";

const SEQUENCE = [
  "Ashgrove Bio",
  "Bellwether Compounds",
  TARGET_VENDOR,
  "Coldharbour Research Supply",
  "Drayton Peptide Works",
];

const ROWS: RegistryRow[] = SEQUENCE.map((vendor) =>
  DEMO_REGISTRY.find((row) => row.vendor === vendor),
).filter((row): row is RegistryRow => row !== undefined);

const GROUNDS = [
  "The certificate cannot be tied to the lot actually being shipped.",
  "The certificate is withdrawn or replaced after the listing goes live.",
  "The laboratory named on the certificate will not confirm the work.",
];

type Phase = "listed" | "flagged" | "settled";

/** A missing lot is not a gap in our data - it is the finding. Rendered as
    such rather than as an em dash placeholder. */
function evidenceLine(row: RegistryRow): string {
  if (!row.lot) return "No lot reference published";
  return [`Lot ${row.lot}`, row.lab].filter(Boolean).join(" · ");
}

function removalLine(row: RegistryRow): string {
  return row.reason ? `Removed ${row.lastReviewed} · ${row.reason}` : `Removed ${row.lastReviewed}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/* --------------------------------------------------------------------------
   Row
   -------------------------------------------------------------------------- */

function RegisterRow({
  row,
  isTarget,
  struck,
  reduced,
}: {
  row: RegistryRow;
  isTarget: boolean;
  struck: boolean;
  reduced: boolean | null;
}) {
  /* The target row is under review until the verdict lands; every other row
     renders the status the registry actually holds. */
  const status = isTarget && !struck ? "review" : row.status;
  const isStruck = isTarget && struck;

  return (
    <motion.li
      layout={!reduced}
      transition={{ layout: SPRING }}
      className="border-t border-line first:border-t-0"
    >
      <div className="flex flex-col gap-2.5 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-5">
        <div className="sm:order-2 sm:shrink-0">
          {isTarget ? (
            /* mode="wait" so the two chips never overlap and the row never
               widens mid-swap. */
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={status}
                className="inline-flex"
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={{ duration: DURATION.fast, ease: EASE_OUT_QUINT }}
              >
                <StatusChip status={status} />
              </motion.span>
            </AnimatePresence>
          ) : (
            <StatusChip status={status} />
          )}
        </div>

        <div className="min-w-0 sm:order-1 sm:flex-1">
          <p
            className={`text-[15px] font-medium transition-colors duration-500 ${
              isStruck ? "text-dim" : "text-text"
            }`}
          >
            <span className="relative inline-block">
              {row.vendor}
              {/* The strike is drawn with scaleX rather than toggling a
                  text-decoration, so it arrives as a movement instead of a
                  jump - and it is still only a transform. */}
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-1/2 h-px origin-left bg-line-strong"
                initial={false}
                animate={{ scaleX: isStruck ? 1 : 0 }}
                transition={{ duration: 0.45, ease: EASE_OUT_QUINT }}
              />
            </span>
          </p>

          {isTarget ? (
            /* Both lines are always in the DOM, stacked in one grid cell, so
               the row reserves the taller of the two from the start and the
               swap costs no layout. */
            <p className="mt-1.5 grid font-mono text-[11.5px] leading-relaxed">
              <motion.span
                className="[grid-area:1/1] text-dim"
                aria-hidden={isStruck}
                initial={false}
                animate={{ opacity: isStruck ? 0 : 1 }}
                transition={{ duration: DURATION.fast, ease: EASE_OUT_QUINT }}
              >
                {evidenceLine(row)}
              </motion.span>
              <motion.span
                className="[grid-area:1/1] text-muted"
                aria-hidden={!isStruck}
                initial={false}
                animate={{ opacity: isStruck ? 1 : 0 }}
                transition={{ duration: DURATION.fast, ease: EASE_OUT_QUINT }}
              >
                {removalLine(row)}
              </motion.span>
            </p>
          ) : (
            <p className="mt-1.5 font-mono text-[11.5px] leading-relaxed text-dim">
              {evidenceLine(row)}
            </p>
          )}
        </div>
      </div>
    </motion.li>
  );
}

/* --------------------------------------------------------------------------
   Section
   -------------------------------------------------------------------------- */

export default function SayNo() {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);
  const inView = useInView(panelRef, { once: true, amount: 0.3 });
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);

  /* The effect only schedules; it never sets state synchronously, so the
     reduced-motion end state is derived rather than written. */
  useEffect(() => {
    if (reduced || !inView) return;
    const flag = window.setTimeout(() => setStep(1), 1000);
    const settle = window.setTimeout(() => setStep(2), 1900);
    return () => {
      window.clearTimeout(flag);
      window.clearTimeout(settle);
    };
  }, [inView, reduced, run]);

  const phase: Phase = reduced || step === 2 ? "settled" : step === 1 ? "flagged" : "listed";
  const struck = phase !== "listed";
  const settled = phase === "settled";

  function replay() {
    setStep(0);
    setRun((n) => n + 1);
  }

  const listed = settled ? ROWS.filter((row) => row.vendor !== TARGET_VENDOR) : ROWS;
  const removed = settled ? ROWS.filter((row) => row.vendor === TARGET_VENDOR) : [];

  return (
    <Section id="say-no" className="relative isolate">
      <div
        aria-hidden="true"
        className="grid-rule mask-fade-edges pointer-events-none absolute inset-0 -z-10 opacity-30"
      />

      <Container>
        <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-16 lg:gap-y-10">
          {/* -------------------------------------------------- argument */}
          <div className="lg:col-span-5 lg:row-start-1">
            <SectionHeader
              eyebrow="Removal policy"
              title="A list that can afford to say no."
              lede="Adding a vendor to this register costs us nothing. Removing one costs us the affiliate commission that vendor earns. That asymmetry is the product."
            />
          </div>

          {/* -------------------------------------------------- the moment */}
          <div className="lg:col-span-7 lg:row-span-2 lg:row-start-1">
            <Reveal>
              <figure
                ref={panelRef}
                className="overflow-hidden rounded-lg border border-line bg-surface"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line px-4 py-3 sm:px-5">
                  <Eyebrow>Public register</Eyebrow>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="tabular font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">
                      Listed {pad(listed.length)}
                      {settled ? ` · Removed ${pad(removed.length)}` : ""}
                    </span>
                    {!reduced && (
                      <button
                        type="button"
                        onClick={replay}
                        className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim transition-colors duration-200 hover:text-accent"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                        Replay
                      </button>
                    )}
                  </div>
                </div>

                {/* layout on the list so its height resolves smoothly when the
                    record rule appears; every direct child carries layout too,
                    which is what keeps the rows from squashing during it. */}
                <motion.ul layout={!reduced} transition={{ layout: SPRING }}>
                  {listed.map((row) => (
                    <RegisterRow
                      key={row.vendor}
                      row={row}
                      isTarget={row.vendor === TARGET_VENDOR}
                      struck={struck}
                      reduced={reduced}
                    />
                  ))}

                  {settled && (
                    <motion.li
                      key="record-rule"
                      layout={!reduced}
                      initial={reduced ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        layout: SPRING,
                        opacity: { duration: DURATION.base, ease: EASE_OUT_QUINT },
                      }}
                      className="flex items-center justify-between gap-4 border-t border-line bg-surface-2/60 px-4 py-2.5 sm:px-5"
                    >
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">
                        Removed from the register
                      </span>
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">
                        Kept on record
                      </span>
                    </motion.li>
                  )}

                  {removed.map((row) => (
                    <RegisterRow
                      key={row.vendor}
                      row={row}
                      isTarget
                      struck={struck}
                      reduced={reduced}
                    />
                  ))}
                </motion.ul>

                <figcaption className="border-t border-line px-4 py-3.5 text-[13px] leading-relaxed text-muted sm:px-5">
                  The record does not close. A removed entry keeps its date and the reason it
                  failed, so a vendor&rsquo;s history stays readable after the listing is gone.
                </figcaption>
              </figure>
            </Reveal>

            <Reveal delay={0.08}>
              <DemoNotice className="mt-4">
                Demonstration data. These vendors are invented and the sequence above is an
                illustration of the process, not a real verification outcome.
              </DemoNotice>
            </Reveal>
          </div>

          {/* -------------------------------------------------- economics */}
          <div className="lg:col-span-5 lg:row-start-2">
            <Reveal>
              <p className="text-[15px] leading-relaxed text-muted">
                PeptideChecker earns affiliate commission from the vendors it lists, so every
                delisting has a price and we pay it. That price is not a flaw in the model. It is
                the only reason the verdict is worth reading: a register that can be paid into is
                not a register, it is an advertisement with a badge on it.
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="mt-8">
                <Eyebrow>Grounds for removal</Eyebrow>
                <ol className="mt-4 border-t border-line">
                  {GROUNDS.map((ground, i) => (
                    <li key={ground} className="flex gap-4 border-b border-line py-3">
                      <span className="tabular pt-0.5 font-mono text-[11px] text-dim">
                        {pad(i + 1)}
                      </span>
                      <span className="text-[14px] leading-relaxed text-muted">{ground}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <CTA href="/methodology" variant="secondary" className="mt-8">
                How a listing fails
              </CTA>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
