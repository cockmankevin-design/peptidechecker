"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Container, CTA, Eyebrow } from "@/components/site/ui";
import { EASE_OUT_QUINT } from "@/lib/motion";
import { asset } from "@/lib/basePath";

/* Hero.

   The hero visual is not an illustration of the product - it IS the product,
   executing. A record assembles itself: a seller, then the lot, then the
   certificate attaching to that lot, then the four checks running, then the
   verdict entering the public register. That sequence is the entire business
   in one object, which is why it earns the space rather than a stock graphic.

   It runs ONCE on mount and then holds the finished state. A looping animation
   would pull the eye forever and the brief is explicit about animation
   overload; a replay control is offered instead for anyone who wants to watch
   it again.

   Everything animated here is transform or opacity. */

const STAGES = ["Seller", "Lot", "Certificate", "Verification", "Public record"] as const;

const CHECKS = [
  "Certificate exists and loads",
  "Names the issuing laboratory",
  "Names the specific lot",
  "Matches the product page",
] as const;

/** Milliseconds each stage holds before the next begins. Slow enough to read,
    quick enough that the whole story lands inside seven seconds. */
const STEP_MS = 620;
const TOTAL_STEPS = 4 + CHECKS.length; // stages 0-3, then one tick per check, then verdict

export default function Hero() {
  const reduced = useReducedMotion();
  // With reduced motion the record is simply shown complete - the information
  // is the point, and withholding it behind a suppressed animation would hide
  // content rather than calm it.
  const [step, setStep] = useState(reduced ? TOTAL_STEPS : -1);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (reduced) {
      setStep(TOTAL_STEPS);
      return;
    }
    setStep(-1);
    let n = -1;
    const t = setInterval(() => {
      n += 1;
      setStep(n);
      if (n >= TOTAL_STEPS) clearInterval(t);
    }, STEP_MS);
    return () => clearInterval(t);
  }, [reduced, runId]);

  const stageIndex = Math.min(
    STAGES.length - 1,
    step < 0 ? -1 : step < 3 ? step : step < 3 + CHECKS.length ? 3 : 4,
  );

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background film: a vial animation, muted and looped. Reduced motion
          gets the poster only - no autoplay. The scrims keep the headline and
          the record card legible over the brightest frames (the white label
          close-ups), and fade the bottom edge into the page ground. */}
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        poster={asset("/video/hero-vial-poster.jpg")}
        autoPlay={!reduced}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src={asset("/video/hero-vial-960.mp4")} type="video/mp4" media="(max-width: 767px)" />
        <source src={asset("/video/hero-vial.mp4")} type="video/mp4" />
      </video>
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,11,0.95)_0%,rgba(8,9,11,0.88)_48%,rgba(8,9,11,0.6)_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
          {/* ---------------- copy ---------------- */}
          <div>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_QUINT }}
            >
              <Eyebrow>Independent COA verification</Eyebrow>
            </motion.div>

            <motion.h1
              className="mt-5 text-[clamp(2.4rem,6.4vw,4.1rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-text"
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06, ease: EASE_OUT_QUINT }}
            >
              A list that can afford
              <br />
              to say&nbsp;
              <span className="relative inline-block">
                no
                {/* The rule under "no" is drawn, not decorative - it is the
                    strike that a delisting makes. */}
                <motion.span
                  className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-delisted"
                  initial={reduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.75, ease: EASE_OUT_QUINT }}
                />
              </span>
              .
            </motion.h1>

            <motion.p
              className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-muted"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease: EASE_OUT_QUINT }}
            >
              Every peptide seller publishes a certificate of analysis. Almost none can show it
              belongs to the lot in the bottle. We check that link — and we publish the sellers
              that fail.
            </motion.p>

            <motion.div
              className="mt-9 flex flex-wrap items-center gap-3"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease: EASE_OUT_QUINT }}
            >
              <CTA href="/vendors">Explore the registry</CTA>
              <CTA href="/methodology" variant="secondary">
                How verification works
              </CTA>
            </motion.div>

            <motion.p
              className="mt-8 font-mono text-[11.5px] leading-relaxed text-dim"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              We sell nothing. We run no laboratory. We commission no testing.
            </motion.p>
          </div>

          {/* ---------------- the record ---------------- */}
          <div className="relative">
            {/* stage rail */}
            <ol className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1.5" aria-hidden="true">
              {STAGES.map((s, i) => (
                <li key={s} className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-500 ${
                      i <= stageIndex ? "text-muted" : "text-dim/50"
                    }`}
                  >
                    {s}
                  </span>
                  {i < STAGES.length - 1 && (
                    <span
                      className={`h-px w-4 transition-colors duration-500 ${
                        i < stageIndex ? "bg-line-strong" : "bg-line"
                      }`}
                    />
                  )}
                </li>
              ))}
            </ol>

            <div className="rounded-xl border border-line bg-surface/80 p-5 sm:p-6">
              <dl className="space-y-0">
                <Row label="Seller" show={step >= 0} reduced={reduced}>
                  <span className="font-sans text-text">Ashgrove Bio</span>
                </Row>
                <Row label="Lot" show={step >= 1} reduced={reduced}>
                  <span className="tabular">AG-4471-A</span>
                </Row>
                <Row label="Certificate" show={step >= 2} reduced={reduced}>
                  <span className="inline-flex items-center gap-2">
                    <span className="tabular">COA-2026-0811.pdf</span>
                    <span className="text-dim">· Independent Lab A</span>
                  </span>
                </Row>
              </dl>

              <div className="my-4 h-px w-full bg-line" />

              {/* the four gates ticking */}
              <ul className="space-y-2.5">
                {CHECKS.map((c, i) => {
                  const done = step >= 3 + i;
                  return (
                    <li key={c} className="flex items-center gap-2.5">
                      <Tick done={done} reduced={reduced} />
                      <span
                        className={`text-[13.5px] transition-colors duration-500 ${
                          done ? "text-text" : "text-dim"
                        }`}
                      >
                        {c}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="my-4 h-px w-full bg-line" />

              {/* verdict */}
              <div className="flex min-h-[2.25rem] items-center justify-between gap-4">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">
                  Result
                </span>
                <AnimatePresence mode="wait">
                  {step >= TOTAL_STEPS ? (
                    <motion.span
                      key="verdict"
                      className="inline-flex items-center gap-2 rounded-full border border-verified/25 bg-verified-dim px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-verified"
                      initial={reduced ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: EASE_OUT_QUINT }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-verified" aria-hidden="true" />
                      Entered into public record
                    </motion.span>
                  ) : (
                    <motion.span
                      key="pending"
                      className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim"
                      exit={reduced ? undefined : { opacity: 0 }}
                    >
                      Checking…
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="font-mono text-[10.5px] leading-relaxed text-dim">
                Illustrative record — not a real vendor
              </p>
              {!reduced && (
                <button
                  type="button"
                  onClick={() => setRunId((n) => n + 1)}
                  className="rounded font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim transition-colors hover:text-accent"
                >
                  Replay
                </button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* A record line that arrives when its stage does. `min-h` is fixed so the card
   never reflows as rows appear - a card that grows would push the page around
   and thrash layout. */
function Row({
  label,
  children,
  show,
  reduced,
}: {
  label: string;
  children: React.ReactNode;
  show: boolean;
  reduced: boolean | null;
}) {
  return (
    <div className="flex min-h-[2.5rem] items-center justify-between gap-4 border-b border-line/60 last:border-b-0">
      <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">{label}</dt>
      <dd className="font-mono text-[13px] text-muted">
        <motion.span
          className="block text-right"
          initial={reduced ? false : { opacity: 0, y: 5 }}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
          transition={{ duration: 0.36, ease: EASE_OUT_QUINT }}
        >
          {children}
        </motion.span>
      </dd>
    </div>
  );
}

function Tick({ done, reduced }: { done: boolean; reduced: boolean | null }) {
  return (
    <span
      className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border transition-colors duration-400 ${
        done ? "border-verified/40 bg-verified-dim" : "border-line-strong bg-transparent"
      }`}
      aria-hidden="true"
    >
      <motion.svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        initial={reduced ? false : { scale: 0.5, opacity: 0 }}
        animate={done ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.28, ease: EASE_OUT_QUINT }}
      >
        <path
          d="M1.5 5.2l2.2 2.2L8.5 2.6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-verified"
        />
      </motion.svg>
    </span>
  );
}
