"use client";

/* Shared primitives.

   Every section composes from these rather than hand-rolling its own spacing,
   eyebrow or chip. That is what stops a multi-section page from reading as
   several sites stitched together.

   Client component because Reveal uses Motion. The rest are presentational and
   cost nothing extra by living here. */

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentType, ReactNode } from "react";

import { fadeUp, stagger, VIEWPORT } from "@/lib/motion";

/* --------------------------------------------------------------------------
   Layout
   -------------------------------------------------------------------------- */

export function Container({
  children,
  className = "",
  glass = false,
}: {
  children: ReactNode;
  className?: string;
  /** Inner-page sections: the content sits on one glass panel, so no table,
      label or paragraph ever sits on the (dimmed) molecule. */
  glass?: boolean;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1180px] px-5 sm:px-8 ${className}`}>
      {glass ? <GlassPanel className="!p-4 sm:!p-8">{children}</GlassPanel> : children}
    </div>
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

/** The dark-glass card every homepage content block sits on (tokens in
    globals.css, values from the molecule prototype). */
export function GlassPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`glass p-6 sm:p-7 ${className}`}>{children}</div>;
}

/** One homepage stop: a viewport-tall band whose glass content sits left or
    right, so each block lines up with its camera stop as in the prototype. */
export function StopSection({
  children,
  side = "left",
  id,
  last = false,
}: {
  children: ReactNode;
  side?: "left" | "right";
  id?: string;
  /** The final stop shares its viewport with the footer (--footer-h, measured
      by MoleculeCanvas), so the page ends exactly one viewport after the last
      stop begins and scroll fractions 0, .25 ... 1 land on the five stops. */
  last?: boolean;
}) {
  return (
    <section
      id={id}
      className={`flex items-center py-24 ${last ? "min-h-[calc(100vh-var(--footer-h,0px))]" : "min-h-[100vh]"}`}
    >
      <Container className={`flex ${side === "right" ? "sm:justify-end" : ""}`}>{children}</Container>
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
  /** Optional - only pass this when it tells the reader something the title
      doesn't already say (a category, an audience switch). Most headings
      don't need one; a label over every section is chrome, not content. */
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {/* One reveal for the whole header, not one per line - a heading and its
          lede land as a single moment instead of a staggered checklist. */}
      <Reveal>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2
          className={`text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.12] text-text ${eyebrow ? "mt-4" : ""}`}
        >
          {title}
        </h2>
        {lede && (
          <p className={`mt-4 text-[17px] leading-relaxed text-muted ${centered ? "mx-auto" : ""}`}>
            {lede}
          </p>
        )}
      </Reveal>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Pill & Status
   -------------------------------------------------------------------------- */

export type PillTone = "verified" | "review" | "delisted" | "accent" | "neutral" | "onVideo";

const PILL_TONE_STYLE: Record<PillTone, string> = {
  verified: "bg-verified text-bg",
  review: "bg-review text-bg",
  delisted: "bg-delisted text-bg",
  accent: "bg-accent text-bg",
  neutral: "border border-line-strong bg-surface-2 text-muted",
  // Sits over the hero's full-brightness video, not the site's near-black
  // body - a solid fill would fight the footage for attention, so this stays
  // the translucent backdrop-blur treatment instead of a filled tone.
  onVideo: "border border-white/15 bg-white/[0.06] text-white/90 backdrop-blur-sm",
};

const PILL_SIZE_STYLE: Record<"sm" | "md", string> = {
  sm: "gap-1.5 px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]",
  md: "gap-2 px-4 py-2.5 text-[13px] font-medium",
};

/** The site's one chip/tag primitive. Every status chip, trust badge and
    category tag renders through this, so "a tag" always means the same
    shape and colour system regardless of which page it's on. */
export function Pill({
  tone,
  size = "sm",
  dot = false,
  icon: Icon,
  children,
  className = "",
}: {
  tone: PillTone;
  size?: "sm" | "md";
  dot?: boolean;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full ${PILL_SIZE_STYLE[size]} ${PILL_TONE_STYLE[tone]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {Icon && <Icon className={size === "md" ? "h-4 w-4" : "h-3 w-3"} aria-hidden />}
      {children}
    </span>
  );
}

export type Status = "verified" | "review" | "delisted";

const STATUS_LABEL: Record<Status, string> = {
  verified: "Verified",
  review: "Under review",
  delisted: "Delisted",
};

/** Status is never conveyed by colour alone - the label is always present, so
    it survives greyscale, colour blindness and a screen reader. */
export function StatusChip({ status, className = "" }: { status: Status; className?: string }) {
  return (
    <Pill tone={status} dot className={className}>
      {STATUS_LABEL[status]}
    </Pill>
  );
}

/** A KPI-style stat: a bold number, a label beneath it, and an optional
    status pill - the dashboard-tile pattern used wherever the site surfaces
    a derived count rather than a full record. */
export function StatTile({
  value,
  label,
  pill,
}: {
  value: ReactNode;
  label: ReactNode;
  pill?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[1.75rem] font-semibold tabular text-text">{value}</span>
        {pill}
      </div>
      <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{label}</p>
    </div>
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
      ? // Dark text, not white: the dark-theme accent is bright enough that
        // white text on it only clears ~2.5:1 contrast. --color-bg reads at
        // 7.6:1 on the same fill.
        "bg-accent text-bg hover:bg-accent-hover"
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

/* --------------------------------------------------------------------------
   Inner pages
   -------------------------------------------------------------------------- */

/** The opening block of every inner page: the hero's ruled ground, an eyebrow,
    the page's one h1 and a lede. Pages below the header use <Section>. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line pt-32 pb-14 sm:pt-40 sm:pb-16">
      <Container className="relative">
        {/* On glass: no inner-page text sits on the raw 3D (see the ambient veil in MoleculeCanvas). */}
        <GlassPanel>
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-5 max-w-3xl text-[clamp(2.2rem,5.4vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-text">
              {title}
            </h1>
          </Reveal>
          {lede && (
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-muted">{lede}</p>
            </Reveal>
          )}
          {children && <Reveal delay={0.18} className="mt-8">{children}</Reveal>}
        </GlassPanel>
      </Container>
    </header>
  );
}

const GATE_STYLE = {
  pass: { mark: "✓", label: "Passed", cls: "border-verified/40 bg-verified-dim text-verified" },
  fail: { mark: "✕", label: "Failed", cls: "border-delisted/40 bg-delisted-dim text-delisted" },
  open: { mark: "–", label: "Not reached", cls: "border-line-strong text-dim" },
} as const;

/** The seven gates of one certificate, in order, each with its outcome spelled
    out - never colour alone. */
export function GateList({
  names,
  gates,
}: {
  names: readonly string[];
  gates: readonly ("pass" | "fail" | "open")[];
}) {
  return (
    <ol className="divide-y divide-line rounded-lg border border-line bg-surface">
      {names.map((name, i) => {
        const g = GATE_STYLE[gates[i]];
        return (
          <li key={name} className="flex items-center gap-3 px-4 py-3.5">
            <span className="w-5 font-mono text-[11px] tabular text-dim">{String(i + 1).padStart(2, "0")}</span>
            <span
              className={`grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full border text-[11px] ${g.cls}`}
              aria-hidden="true"
            >
              {g.mark}
            </span>
            <span className={`min-w-0 flex-1 text-[14px] ${gates[i] === "open" ? "text-dim" : "text-text"}`}>
              {name}
            </span>
            <span className={`font-mono text-[10.5px] uppercase tracking-[0.1em] ${g.cls.split(" ").pop()}`}>
              {g.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Body copy for prose pages: measured width, the site's muted text. On
    inner pages it sits inside a <Container glass> panel, never on the 3D. */
export function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`max-w-[68ch] space-y-5 text-[16.5px] leading-relaxed text-muted [&_a]:text-accent [&_a:hover]:underline [&_h2]:pt-6 [&_h2]:text-[1.6rem] [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-text [&_h3]:pt-3 [&_h3]:text-[1.2rem] [&_h3]:font-semibold [&_h3]:text-text [&_strong]:font-semibold [&_strong]:text-text ${className}`}
    >
      {children}
    </div>
  );
}
