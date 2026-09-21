"use client";

/* Shared primitives.

   Every section composes from these rather than hand-rolling its own spacing,
   eyebrow or chip. That is what stops a multi-section page from reading as
   several sites stitched together.

   Client component because Reveal uses Motion. The rest are presentational and
   cost nothing extra by living here. */

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { fadeUp, stagger, VIEWPORT } from "@/lib/motion";

/* --------------------------------------------------------------------------
   Layout
   -------------------------------------------------------------------------- */

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1180px] px-5 sm:px-8 ${className}`}>{children}</div>
  );
}

/** Standard vertical rhythm for a section. Sections never set their own
    padding, so the page cadence stays even. */
export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-20 sm:py-28 ${className}`}>
      {children}
    </section>
  );
}

/* --------------------------------------------------------------------------
   Motion wrappers
   -------------------------------------------------------------------------- */

/** The site's single entrance animation.

    `useReducedMotion` is checked here rather than relying only on the CSS
    media query: Motion writes inline styles, so a suppressed animation would
    otherwise leave the element stuck at opacity 0 - invisible content, which
    is worse than no animation. When reduced, this renders a plain div. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
}) {
  const reduced = useReducedMotion();
  const Tag = as === "li" ? motion.li : motion.div;

  if (reduced) {
    return as === "li" ? <li className={className}>{children}</li> : <div className={className}>{children}</div>;
  }

  return (
    <Tag
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      transition={{ delay }}
    >
      {children}
    </Tag>
  );
}

/** Parent for staggered groups. Children must be <Reveal> or motion elements
    using the `fadeUp` variant. */
export function RevealGroup({
  children,
  className = "",
  step = 0.06,
}: {
  children: ReactNode;
  className?: string;
  step?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={stagger(step)}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------------------------------------------------------
   Type
   -------------------------------------------------------------------------- */

/** Mono, uppercase, tracked. Marks the start of a section and reads as a
    record label rather than a decorative kicker. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`font-mono text-[11px] uppercase tracking-[0.18em] text-dim ${className}`}
    >
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="mt-4 text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.12] text-text">
          {title}
        </h2>
      </Reveal>
      {lede && (
        <Reveal delay={0.12}>
          <p className={`mt-4 text-[17px] leading-relaxed text-muted ${centered ? "mx-auto" : ""}`}>
            {lede}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Status
   -------------------------------------------------------------------------- */

export type Status = "verified" | "review" | "delisted";

const STATUS_STYLE: Record<Status, { label: string; cls: string; dot: string }> = {
  verified: {
    label: "Verified",
    cls: "text-verified bg-verified-dim border-verified/25",
    dot: "bg-verified",
  },
  review: {
    label: "Under review",
    cls: "text-review bg-review-dim border-review/25",
    dot: "bg-review",
  },
  delisted: {
    label: "Delisted",
    cls: "text-delisted bg-delisted-dim border-delisted/25",
    dot: "bg-delisted",
  },
};

/** Status is never conveyed by colour alone - the label is always present, so
    it survives greyscale, colour blindness and a screen reader. */
export function StatusChip({ status, className = "" }: { status: Status; className?: string }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] ${s.cls} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}

/* --------------------------------------------------------------------------
   Actions
   -------------------------------------------------------------------------- */

/** The accent is reserved for interaction, so `primary` is the only place the
    brand blue appears as a fill anywhere on the site. */
export function CTA({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const base =
    "group inline-flex items-center gap-2 rounded-lg px-5 py-3 text-[15px] font-medium transition-colors duration-200";
  const styles =
    variant === "primary"
      ? "bg-accent text-white hover:bg-accent-hover"
      : "border border-line-strong text-text hover:border-accent/50 hover:text-accent";

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
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
  );
}

/* --------------------------------------------------------------------------
   Structure
   -------------------------------------------------------------------------- */

export function Hairline({ className = "" }: { className?: string }) {
  return <div className={`h-px w-full bg-line ${className}`} aria-hidden="true" />;
}

/** A labelled machine value. The label is sans, the value is mono - the site's
    consistent signal for "this is a record we checked". */
export function DataField({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">{label}</dt>
      <dd className={`mt-1.5 text-[14px] text-text ${mono ? "font-mono tabular" : ""}`}>{value}</dd>
    </div>
  );
}

/** The demo-data notice. Used wherever fabricated figures appear, because the
    one thing this site cannot do is present invented data as verified. */
export function DemoNotice({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <p
      className={`inline-flex items-start gap-2 rounded-md border border-review/25 bg-review-dim px-3 py-2 font-mono text-[11px] leading-relaxed text-review ${className}`}
    >
      <span aria-hidden="true">▲</span>
      <span>
        {children ?? "Demonstration data. Illustrative vendors and figures — not real verification results."}
      </span>
    </p>
  );
}
