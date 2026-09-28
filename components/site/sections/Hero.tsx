"use client";

import { Eye, PackageX, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { Container, CTA } from "@/components/site/ui";
import { EASE_OUT_QUINT } from "@/lib/motion";
import { asset } from "@/lib/basePath";

/* Hero.

   The vial video fills the ENTIRE hero screen, full brightness, copy
   overlaid on top - the animation IS the design here, not an illustration
   next to it. A single small, localized radial scrim sits only behind the
   copy block (a top-down gradient on mobile, where the copy stacks into one
   tall column) so the rest of the frame stays at full brightness.

   2026-09-28: removed the scroll-pinned, frame-by-frame canvas scrub
   (GSAP ScrollTrigger, desktop only) at Kevin's explicit request. The hero
   now just plays the source video on a plain loop on every screen size, the
   same way mobile already did - no section pin, no scroll-driven frame
   stepping. */

const BADGES = [
  { label: "Every date FDA-sourced", icon: ShieldCheck },
  { label: "We sell nothing", icon: PackageX },
  // 2026-09-27: was "Commission disclosed", which contradicted /cost and
  // /get-started - no affiliate programme has accepted us, so nothing pays us
  // yet. Restore the old wording only when one actually does.
  { label: "We take no commissions", icon: Eye },
] as const;

function framePath(i: number) {
  return asset(`/hero-vial/desktop/frame-${String(i + 1).padStart(4, "0")}.webp`);
}

export default function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#080f1f]">
      {/* ---------------- the vial: full screen, full brightness ---------------- */}
      <div className="absolute inset-0" aria-hidden="true">
        {reduced ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={framePath(29)} alt="" className="h-full w-full object-cover" />
        ) : (
          <video
            className="h-full w-full object-cover"
            src={asset("/hero-vial/hero-vial.mp4")}
            poster={asset("/hero-vial/mobile/frame-0001.webp")}
            autoPlay
            muted
            loop
            playsInline
          />
        )}
      </div>

      {/* local scrim, sized to the copy block only - not a wide overlay,
          so the rest of the frame stays at full brightness. Mobile stacks
          the headline, buttons and badges into one tall column, so its
          scrim is a top-down gradient covering that whole column; desktop
          has room to keep it a small radial patch behind just the text. */}
      <div
        className="pointer-events-none absolute inset-0 min-[900px]:hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgba(3, 8, 20, 0.82) 0%, rgba(3, 8, 20, 0.6) 55%, rgba(3, 8, 20, 0.15) 78%, transparent 92%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 hidden min-[900px]:block"
        style={{
          background:
            "radial-gradient(60% 55% at 22% 42%, rgba(3, 8, 20, 0.72) 0%, rgba(3, 8, 20, 0.35) 45%, transparent 72%)",
        }}
        aria-hidden="true"
      />

      <Container className="relative flex min-h-[100svh] items-center py-32">
        {/* ---------------- copy ---------------- */}
        <div className="w-full max-w-md">
          <motion.h1
            className="text-[clamp(2.6rem,6.8vw,4.4rem)] font-semibold leading-[1.03] tracking-[-0.03em] text-white"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_QUINT }}
          >
            We check what the
            <br />
            label can&rsquo;t tell you.
          </motion.h1>

          <motion.p
            className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-white/80"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT_QUINT }}
          >
            Twelve peptide medicines carry FDA approval today. Several more are waiting on a
            decision. Everything else being sold online is neither, whatever the label says —
            and we check every date and application number ourselves.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: EASE_OUT_QUINT }}
          >
            <CTA href="/approved">See what&rsquo;s approved</CTA>
            {/* Inline style, not the shared CTA "secondary" variant - that
                variant's classes are tuned for the token-driven page and
                Tailwind's utility precedence isn't guaranteed to let a
                passed-in className override them here. */}
            <Link
              href="/cost"
              className="group inline-flex items-center gap-2 rounded-lg px-5 py-3 text-[15px] font-medium transition-colors duration-200"
              style={{ border: "1px solid rgba(255,255,255,0.3)", color: "#ffffff" }}
            >
              What it costs
              <svg
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </motion.div>

          {/* trust badges - real facts, not vendor-style purity/shipping claims */}
          <motion.div
            className="mt-10 flex flex-wrap gap-3"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.26, ease: EASE_OUT_QUINT }}
          >
            {BADGES.map((b) => (
              <div
                key={b.label}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2.5 text-[13px] font-medium text-white/90 backdrop-blur-sm"
              >
                <b.icon className="h-4 w-4 text-[#78c0ff]" aria-hidden="true" />
                {b.label}
              </div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
