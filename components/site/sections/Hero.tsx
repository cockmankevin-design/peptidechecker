"use client";

import { Eye, PackageX, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { CTA, GlassPanel, Pill, StopSection } from "@/components/site/ui";

/* Hero.

   2026-10 3D rework: the vial video and its reduced-motion <img> switch are
   gone. The hero is the first camera stop of the molecule journey (the fixed
   canvas in the layout), with the copy on a glass card. The markup no longer
   branches on motion preference, so server and client render the same thing
   in every mode (that branch caused React hydration error #418). */

const BADGES = [
  { label: "Every date FDA-sourced", icon: ShieldCheck },
  { label: "We sell nothing", icon: PackageX },
  // 2026-09-27: was "Commission disclosed", which contradicted /cost and
  // /get-started - no affiliate programme has accepted us, so nothing pays us
  // yet. Restore the old wording only when one actually does.
  { label: "We take no commissions", icon: Eye },
] as const;

export default function Hero() {
  return (
    <StopSection>
      <GlassPanel className="w-full max-w-[560px]">
        <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-[1.03] tracking-[-0.03em] text-white">
          We check what the
          <br />
          label can&rsquo;t tell you.
        </h1>

        <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-white/80">
          Twelve peptide medicines carry FDA approval today. Several more are waiting on a
          decision. Everything else being sold online is neither, whatever the label says —
          and we check every date and application number ourselves.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
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
        </div>

        {/* trust badges - real facts, not vendor-style purity/shipping claims */}
        <div className="mt-10 flex flex-wrap gap-3">
          {BADGES.map((b) => (
            <Pill key={b.label} tone="onVideo" size="md" icon={b.icon}>
              {b.label}
            </Pill>
          ))}
        </div>
      </GlassPanel>
    </StopSection>
  );
}
