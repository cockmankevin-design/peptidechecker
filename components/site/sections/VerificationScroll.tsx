"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import { Container, Eyebrow } from "@/components/site/ui";

/* "How verification works" - the scroll-told sequence.

   ARCHITECTURE. GSAP owns only the pin and the scroll progress. React owns the
   step state. CSS owns the visual transitions. That split matters: the common
   way GSAP-in-React breaks is both libraries writing to the same DOM nodes,
   with React re-rendering over GSAP's inline styles mid-tween. Here GSAP never
   touches a node React renders - it reports a number, and React decides what
   that number means.

   GSAP is used here and nowhere else on the site, because this is the one
   place that genuinely needs what Motion cannot do well: pinning a section and
   scrubbing a sequence to scroll position.

   Below 900px the pin is dropped entirely. Pinned sections on a phone fight the
   browser's own scroll handling and the address-bar resize, and the result is
   the jank the brief explicitly rules out. Mobile gets an honest stacked
   sequence instead - an intentional layout, not a shrunken one. */

const STEPS = [
  {
    k: "Seller",
    t: "A seller enters the queue",
    d: "Anyone can be reviewed. Being reviewed is not the same as being listed, and nothing about entering the queue is bought.",
  },
  {
    k: "Lot",
    t: "The specific lot is identified",
    d: "Not the product line — the batch actually being shipped. Everything downstream is anchored to this identifier.",
  },
  {
    k: "Certificate",
    t: "A certificate is attached to that lot",
    d: "The document must exist, be reachable, and reference this lot. A certificate available only on request is not evidence.",
  },
  {
    k: "Laboratory",
    t: "The laboratory is named and checked",
    d: "An unattributed result is an assertion with a chart on it. The issuing lab must be named, and independent of the seller.",
  },
  {
    k: "Match",
    t: "Evidence is matched to the product page",
    d: "Compound, strength and date on the certificate must agree with what the seller is actually selling.",
  },
  {
    k: "Verdict",
    t: "A verdict is reached",
    d: "Every gate passes, or the check fails. There is no partial credit and no discretion to grant.",
  },
  {
    k: "Record",
    t: "The result enters the public record",
    d: "Pass or fail, the outcome is published with its reason — and a failure stays on the record rather than quietly disappearing.",
  },
] as const;

export default function VerificationScroll() {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reduced motion, or no element: render the resting state. Every step is
    // shown, nothing is pinned, and the section reads as a plain list.
    if (reduced || !wrapRef.current) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      // Imported dynamically so GSAP stays out of the initial bundle and never
      // runs during the static export, where `window` does not exist.
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 900px)", () => {
          ScrollTrigger.create({
            trigger: wrapRef.current!,
            start: "top top",
            // One viewport of scroll per step gives each one room to be read.
            end: () => `+=${STEPS.length * 420}`,
            pin: pinRef.current!,
            pinSpacing: true,
            scrub: 0.6,
            onUpdate: (self) => {
              setProgress(self.progress);
              // Bias slightly forward so a step activates as it is reached
              // rather than after it has been passed.
              const i = Math.min(
                STEPS.length - 1,
                Math.floor(self.progress * STEPS.length + 0.15),
              );
              setActive(i);
            },
          });
        });
      }, wrapRef);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  const isStatic = reduced;

  return (
    <div ref={wrapRef} className="relative">
      <div ref={pinRef}>
        <section className="py-20 sm:py-28" id="verification">
          <Container>
            <div className="max-w-2xl">
              <Eyebrow>How verification works</Eyebrow>
              <h2 className="mt-4 text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.12] text-text">
                Evidence is only evidence if it points at the bottle.
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-muted">
                Seven steps, applied identically to every seller. No step is skippable and none is
                negotiable.
              </p>
            </div>

            <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-16">
              {/* ---- step list ---- */}
              <ol className="relative">
                {/* progress spine */}
                <div
                  className="absolute left-[13px] top-2 bottom-2 w-px bg-line"
                  aria-hidden="true"
                >
                  <div
                    className="w-px origin-top bg-accent transition-transform duration-150 ease-linear"
                    style={{
                      height: "100%",
                      transform: `scaleY(${isStatic ? 1 : progress})`,
                    }}
                  />
                </div>

                {STEPS.map((s, i) => {
                  const on = isStatic || i <= active;
                  const current = !isStatic && i === active;
                  return (
                    <li key={s.k} className="relative flex gap-4 pb-7 last:pb-0">
                      <span
                        className={`relative z-10 mt-0.5 grid h-[27px] w-[27px] shrink-0 place-items-center rounded-full border font-mono text-[10px] transition-colors duration-300 ${
                          on
                            ? "border-accent/40 bg-accent-dim text-accent"
                            : "border-line bg-bg text-dim"
                        }`}
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-300 ${
                            on ? "text-dim" : "text-dim/50"
                          }`}
                        >
                          {s.k}
                        </p>
                        <h3
                          className={`mt-1 text-[16.5px] font-medium leading-snug transition-colors duration-300 ${
                            on ? "text-text" : "text-dim"
                          }`}
                        >
                          {s.t}
                        </h3>
                        <p
                          className={`mt-1.5 max-w-[46ch] text-[14px] leading-relaxed transition-colors duration-300 ${
                            current || isStatic ? "text-muted" : "text-dim/70"
                          }`}
                        >
                          {s.d}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {/* ---- the record being built ---- */}
              <div className="lg:sticky lg:top-28">
                <RecordPanel active={isStatic ? STEPS.length - 1 : active} />
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}

/* The evolving record. Rows resolve as their step is reached; nothing is
   removed, so the panel reads as accumulating evidence rather than a slideshow.
   Heights are fixed per row so the panel never reflows while pinned. */
function RecordPanel({ active }: { active: number }) {
  const rows = [
    { label: "Seller", value: "Ashgrove Bio", at: 0 },
    { label: "Lot", value: "AG-4471-A", at: 1 },
    { label: "Certificate", value: "COA-2026-0811.pdf", at: 2 },
    { label: "Laboratory", value: "Independent Lab A", at: 3 },
    { label: "Compound / strength", value: "Matches listing", at: 4 },
  ];

  const verdictReached = active >= 5;
  const published = active >= 6;

  return (
    <div className="rounded-xl border border-line bg-surface/80 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">
          Verification record
        </p>
        <p className="font-mono text-[10.5px] text-dim tabular">
          {String(Math.min(active + 1, STEPS.length)).padStart(2, "0")} / {STEPS.length}
        </p>
      </div>

      <dl className="mt-4">
        {rows.map((r) => {
          const on = active >= r.at;
          return (
            <div
              key={r.label}
              className="flex min-h-[2.6rem] items-center justify-between gap-4 border-b border-line/60"
            >
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">
                {r.label}
              </dt>
              <dd
                className={`font-mono text-[13px] tabular transition-all duration-500 ${
                  on ? "translate-y-0 text-muted opacity-100" : "translate-y-1 opacity-0"
                }`}
              >
                {r.value}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-5 flex min-h-[2.5rem] items-center justify-between gap-4">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">
          Status
        </span>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-500 ${
            published
              ? "border-verified/25 bg-verified-dim text-verified"
              : verdictReached
                ? "border-review/25 bg-review-dim text-review"
                : "border-line text-dim"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
              published ? "bg-verified" : verdictReached ? "bg-review" : "bg-dim"
            }`}
            aria-hidden="true"
          />
          {published ? "Published" : verdictReached ? "Verdict reached" : "In review"}
        </span>
      </div>

      <p className="mt-4 font-mono text-[10.5px] leading-relaxed text-dim">
        Illustrative record — not a real vendor
      </p>
    </div>
  );
}
