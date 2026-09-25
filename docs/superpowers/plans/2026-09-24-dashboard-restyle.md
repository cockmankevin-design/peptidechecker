# PeptideChecker Dashboard Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle PeptideChecker's background tokens and every tag/chip to a near-black, filled-pill "dashboard KPI" look (per `docs/superpowers/specs/2026-09-24-dashboard-restyle-design.md`), without touching the hero's video animation, page content, or the seven-gates/no-score business rules.

**Architecture:** Two new shared primitives in `components/site/ui.tsx` — `Pill` (one chip/tag renderer, six color "tones") and `StatTile` (a KPI card: number + label + optional pill) — that every existing chip and stat display gets migrated onto. `StatusChip`'s exported signature does not change, so the six files that already consume it need no edits; only the primitive underneath it changes. A handful of files that currently hand-roll their own chip markup (`Hero.tsx`, `WhatWeVerify.tsx`, `pipeline/page.tsx`, `peptides/[slug]/page.tsx`) get migrated onto `Pill` directly.

**Tech Stack:** Next.js 16 (static export), Tailwind 4 (`@theme` tokens in `app/globals.css`, no `tailwind.config.ts`), Bun. No component test framework in this repo — verification gates are `bunx tsc --noEmit`, `bun run build`, and a compiled-CSS grep, per this project's own established practice (see `PeptideChecker.md`: "verified in the actually-served compiled CSS, not just assumed").

## Global Constraints

- Bun is the only package manager available (no npm/npx) — use `bun run <script>`, not `npm run`.
- `Hero.tsx`'s canvas draw loop, frame preload, and GSAP `ScrollTrigger` pin/scrub logic must not change — only the `BADGES` rendering block.
- No new pages, no copy/content changes, no changes to the seven-gates model, the no-score rule, or the affiliate/buy-button rules (buttons stay allowed only on the FDA-approved pages, never on the vendor registry).
- New/changed design tokens (computed and verified below, WCAG 2.1 relative-luminance formula — do not re-derive, copy these values):
  - `--color-bg: #0a0a0c` (was `#080f1f`)
  - `--color-surface: #141418` (was `#0f1a30`)
  - `--color-surface-2: #1c1c22` (was `#16233d`)
  - `--color-line: #40404a` (was `#3a4d72`) — 1.93:1 against the new bg, clears the project's own ~1.8:1 border-presence bar
  - `--color-line-strong: #68686f` (was `#5a75a3`) — 3.58:1 against the new bg, clears the ~3.5:1 bar
  - `--color-text`, `--color-muted`, `--color-dim`, `--color-accent`, `--color-verified`, `--color-review`, `--color-delisted` are **unchanged** — all re-verified at 6.38:1–17.94:1 against the new bg, still comfortably above WCAG AA's 4.5:1.
- The hero's own background (the navy Higgs-Field video) is explicitly NOT part of this token change — it stays navy. This is a deliberate contrast, flagged in the design spec, not an oversight.

---

### Task 1: Near-black background tokens

**Files:**
- Modify: `app/globals.css:50-54` (the `@theme` block's ground/structure tokens)

**Interfaces:**
- Produces: new values for `--color-bg`, `--color-surface`, `--color-surface-2`, `--color-line`, `--color-line-strong`, consumed implicitly by every component via Tailwind's `bg-bg`/`bg-surface`/`border-line`/etc. utility classes. No code-level interface — this is a pure CSS token swap.

- [ ] **Step 1: Update the token values**

In `app/globals.css`, replace lines 50-54:

```css
  --color-bg: #080f1f;
  --color-surface: #0f1a30;
  --color-surface-2: #16233d;
  --color-line: #3a4d72;
  --color-line-strong: #5a75a3;
```

with:

```css
  --color-bg: #0a0a0c;
  --color-surface: #141418;
  --color-surface-2: #1c1c22;
  --color-line: #40404a;
  --color-line-strong: #68686f;
```

Update the comment block immediately above (lines 36-49) so it describes the near-black dashboard ground instead of "deep navy... matches the hero video's own background" — that sentence is no longer true once this task lands, since the hero is the only thing staying navy.

- [ ] **Step 2: Build and verify the tokens actually compiled**

Run: `bun run build`
Expected: build succeeds, 0 errors.

Then confirm the new hex values are actually in the served CSS, not just the source file (this project has been burned before by a token that was correct in `globals.css` but never made it into the compiled output):

Run: `grep -r "0a0a0c" .next/static/css/ || grep -r "0a0a0c" out/_next/static/css/`
Expected: at least one match. If none, the build did not pick up the token change — stop and investigate before continuing.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "Background tokens: navy to near-black dashboard ground"
```

---

### Task 2: `Pill` primitive + `StatusChip` migration

**Files:**
- Modify: `components/site/ui.tsx:1-14` (imports), `:176-209` (the `Status`/`STATUS_STYLE`/`StatusChip` block)

**Interfaces:**
- Produces: `Pill({ tone, size?, dot?, icon?, children, className? })` — new export.
  - `tone: "verified" | "review" | "delisted" | "accent" | "neutral" | "onVideo"`
  - `size?: "sm" | "md"` (default `"sm"`)
  - `dot?: boolean` — renders a small solid dot before the label (used by `StatusChip`)
  - `icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>` — renders an icon before the label (used by Hero badges and the gate "Fails on" tag)
- Produces: `StatusChip({ status, className? })` — **signature unchanged** from the existing export. The 6 files that already import `StatusChip` (`components/site/ui.tsx` itself, `app/compare/page.tsx`, `app/results/page.tsx`, `app/methodology/page.tsx`, `app/peptides/[slug]/page.tsx`, `app/vendors/[slug]/page.tsx`, `components/site/sections/SayNo.tsx`) need **no changes** — only its rendered appearance changes.

- [ ] **Step 1: Add the `Pill` primitive**

In `components/site/ui.tsx`, change the import line at the top from:

```tsx
import type { ReactNode } from "react";
```

to:

```tsx
import type { ComponentType, ReactNode } from "react";
```

Then, directly above the existing `Status`/`STATUS_STYLE`/`StatusChip` block (before line 177), insert:

```tsx
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

```

- [ ] **Step 2: Rewrite `StatusChip` to render through `Pill`**

Replace the existing block (the old `Status`/`STATUS_STYLE`/`StatusChip`, currently lines 177-209):

```tsx
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
```

with:

```tsx
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
```

- [ ] **Step 3: Typecheck and build**

Run: `bunx tsc --noEmit`
Expected: 0 errors.

Run: `bun run build`
Expected: build succeeds, all routes render (the build output lists every route — confirm `/compare`, `/results`, `/methodology`, `/peptides/[slug]`, `/vendors/[slug]` are all present with no errors).

- [ ] **Step 4: Commit**

```bash
git add components/site/ui.tsx
git commit -m "ui: add Pill primitive, rebuild StatusChip as a filled pill"
```

---

### Task 3: Hero trust badges → `Pill`

**Files:**
- Modify: `components/site/sections/Hero.tsx:8` (import), `:278-294` (the `BADGES` render block)

**Interfaces:**
- Consumes: `Pill` from `@/components/site/ui` (from Task 2), used with `tone="onVideo"` and `size="md"`.

- [ ] **Step 1: Import `Pill`**

Change line 8 from:

```tsx
import { Container, CTA } from "@/components/site/ui";
```

to:

```tsx
import { Container, CTA, Pill } from "@/components/site/ui";
```

- [ ] **Step 2: Replace the badge markup**

Replace (lines 285-293):

```tsx
                  {BADGES.map((b) => (
                    <div
                      key={b.label}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2.5 text-[13px] font-medium text-white/90 backdrop-blur-sm"
                    >
                      <b.icon className="h-4 w-4 text-[#78c0ff]" aria-hidden="true" />
                      {b.label}
                    </div>
                  ))}
```

with:

```tsx
                  {BADGES.map((b) => (
                    <Pill key={b.label} tone="onVideo" size="md" icon={b.icon}>
                      {b.label}
                    </Pill>
                  ))}
```

Note this drops the icon's `text-[#78c0ff]` tint (icons render in the pill's `text-white/90` instead) and changes the shape from `rounded-lg` to `rounded-full` — both intentional, matching every other tag on the site now being a full pill.

- [ ] **Step 3: Typecheck and build**

Run: `bunx tsc --noEmit`
Expected: 0 errors.

Run: `bun run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/site/sections/Hero.tsx
git commit -m "Hero: trust badges render as Pill, matching the site's tag system"
```

---

### Task 4: `WhatWeVerify`'s "Fails on" tag → `Pill`

**Files:**
- Modify: `components/site/sections/WhatWeVerify.tsx:23-31` (import), `:156-164` (the gate "Fails on" block)

**Interfaces:**
- Consumes: `Pill` from `@/components/site/ui` (from Task 2), used with `tone="delisted"` and the `X` icon already imported from `lucide-react`.

- [ ] **Step 1: Import `Pill`**

Change (lines 23-31) from:

```tsx
import {
  Container,
  Eyebrow,
  Hairline,
  Reveal,
  Section,
  SectionHeader,
  StatusChip,
} from "@/components/site/ui";
```

to:

```tsx
import {
  Container,
  Eyebrow,
  Hairline,
  Pill,
  Reveal,
  Section,
  SectionHeader,
  StatusChip,
} from "@/components/site/ui";
```

- [ ] **Step 2: Replace the "Fails on" label**

Replace (lines 156-164):

```tsx
                <p className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-md border border-line bg-surface-2 px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-delisted">
                    <X className="h-3 w-3" aria-hidden="true" />
                    Fails on
                  </span>
                  <span className="font-mono text-[12px] leading-relaxed text-muted">
                    {gate.failsOn}
                  </span>
                </p>
```

with:

```tsx
                <p className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-md border border-line bg-surface-2 px-3 py-2.5">
                  <Pill tone="delisted" icon={X}>
                    Fails on
                  </Pill>
                  <span className="font-mono text-[12px] leading-relaxed text-muted">
                    {gate.failsOn}
                  </span>
                </p>
```

- [ ] **Step 3: Typecheck and build**

Run: `bunx tsc --noEmit`
Expected: 0 errors.

Run: `bun run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/site/sections/WhatWeVerify.tsx
git commit -m "WhatWeVerify: 'Fails on' label renders as Pill"
```

---

### Task 5: Pipeline status chip → `Pill`

**Files:**
- Modify: `app/pipeline/page.tsx:3` (import), `:76-79` (desktop table cell), `:101-105` (mobile card)

**Interfaces:**
- Consumes: `Pill` from `@/components/site/ui` (from Task 2), used with `tone="accent"`.

- [ ] **Step 1: Import `Pill`**

Change line 3 from:

```tsx
import { Container, PageHeader, Prose, Section } from "@/components/site/ui";
```

to:

```tsx
import { Container, PageHeader, Pill, Prose, Section } from "@/components/site/ui";
```

- [ ] **Step 2: Replace the desktop table chip**

Replace (lines 76-79):

```tsx
                    <td className="px-4 py-4 align-top">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-dim px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-accent">
                        {STATUS_LABEL[d.status]}
                      </span>
```

with:

```tsx
                    <td className="px-4 py-4 align-top">
                      <Pill tone="accent">{STATUS_LABEL[d.status]}</Pill>
```

(the following `<p className="mt-2 ...">{d.statusDetail}</p>` line stays unchanged.)

- [ ] **Step 3: Replace the mobile card chip**

Replace (lines 101-105):

```tsx
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-[15px] font-medium text-text">{d.drug}</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-dim px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-accent">
                    {STATUS_LABEL[d.status]}
                  </span>
                </div>
```

with:

```tsx
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-[15px] font-medium text-text">{d.drug}</p>
                  <Pill tone="accent">{STATUS_LABEL[d.status]}</Pill>
                </div>
```

- [ ] **Step 4: Typecheck and build**

Run: `bunx tsc --noEmit`
Expected: 0 errors.

Run: `bun run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add app/pipeline/page.tsx
git commit -m "Pipeline: status chip renders as Pill"
```

---

### Task 6: `peptides/[slug]` "Studied for" tags → `Pill`

**Files:**
- Modify: `app/peptides/[slug]/page.tsx:4` (import), `:29-34` (the `commonUses` list)

**Interfaces:**
- Consumes: `Pill` from `@/components/site/ui` (from Task 2), used with `tone="neutral"`.

- [ ] **Step 1: Import `Pill`**

Change line 4 from:

```tsx
import { Container, DemoNotice, Eyebrow, PageHeader, Section, StatusChip } from "@/components/site/ui";
```

to:

```tsx
import { Container, DemoNotice, Eyebrow, PageHeader, Pill, Section, StatusChip } from "@/components/site/ui";
```

- [ ] **Step 2: Replace the tag list items**

Replace (lines 29-34):

```tsx
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {product.commonUses.map((u) => (
                <li key={u} className="rounded-full border border-line-strong px-3 py-1 text-[13px] text-muted">
                  {u}
                </li>
              ))}
            </ul>
```

with:

```tsx
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {product.commonUses.map((u) => (
                <li key={u}>
                  <Pill tone="neutral">{u}</Pill>
                </li>
              ))}
            </ul>
```

- [ ] **Step 3: Typecheck and build**

Run: `bunx tsc --noEmit`
Expected: 0 errors.

Run: `bun run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add "app/peptides/[slug]/page.tsx"
git commit -m "Peptide page: 'Studied for' tags render as Pill"
```

---

### Task 7: `StatTile` primitive

**Files:**
- Modify: `components/site/ui.tsx` (add near `Pill`, after the `StatusChip` block)

**Interfaces:**
- Produces: `StatTile({ value, label, pill? })` — new export.
  - `value: ReactNode` — the bold number/figure
  - `label: ReactNode` — the caption beneath it
  - `pill?: ReactNode` — an optional `<Pill>` element rendered beside the value (callers build the `<Pill>` themselves so `StatTile` never has to guess a tone, and the site's "never colour alone" rule stays enforced at the call site where the label text is known)

- [ ] **Step 1: Add `StatTile`**

In `components/site/ui.tsx`, directly after the `StatusChip` function (from Task 2), insert:

```tsx
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
```

- [ ] **Step 2: Typecheck and build**

Run: `bunx tsc --noEmit`
Expected: 0 errors (an unused export is not a type error, so this passes even before Task 8 wires it up).

Run: `bun run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/site/ui.tsx
git commit -m "ui: add StatTile primitive"
```

---

### Task 8: Apply `StatTile` to `StatStrip`

**Files:**
- Modify: `components/site/sections/StatStrip.tsx` (full rewrite of the component body)

**Interfaces:**
- Consumes: `StatTile` and `Pill` from `@/components/site/ui` (from Tasks 2 and 7).

- [ ] **Step 1: Rewrite `StatStrip.tsx`**

Replace the entire file content with:

```tsx
"use client";

import { Container, Pill, Reveal, StatTile } from "@/components/site/ui";
import { APPROVED_DRUGS, APPROVED_LAST_CHECKED, PIPELINE_DRUGS } from "@/lib/fda-registry";

/* Stat strip, directly under the hero (2026-09-24 pivot build).

   Numbers are derived from lib/fda-registry.ts, never hardcoded, so they
   cannot drift from the rows printed on /approved and /pipeline. The
   discontinued-drug count is the site's best single proof of care: lists
   people copy from each other still carry a drug that's gone.

   Rendered as three KPI tiles (2026-09-24 restyle) rather than inline
   numbers, matching the dashboard-tile pattern used site-wide. */

export default function StatStrip() {
  const approvedCount = APPROVED_DRUGS.filter((d) => d.status === "approved" && d.isPeptide).length;
  const discontinuedCount = APPROVED_DRUGS.filter((d) => d.status === "discontinued").length;
  const pendingCount = PIPELINE_DRUGS.length;

  const stats = [
    {
      value: approvedCount,
      label: "approved peptide medicines",
      pill: <Pill tone="verified">Live</Pill>,
    },
    {
      value: pendingCount,
      label: "awaiting an FDA decision",
      pill: <Pill tone="review">Pending</Pill>,
    },
    {
      value: discontinuedCount,
      label: "discontinued, still listed elsewhere as approved",
      pill: <Pill tone="delisted">Discontinued</Pill>,
    },
  ];

  return (
    <div className="border-y border-line bg-surface/40">
      <Container>
        <Reveal>
          <div className="grid gap-4 py-8 sm:grid-cols-3">
            {stats.map((s) => (
              <StatTile key={s.label} value={s.value} label={s.label} pill={s.pill} />
            ))}
          </div>
          <p className="pb-6 font-mono text-[11px] uppercase tracking-[0.1em] text-dim">
            Last checked {APPROVED_LAST_CHECKED} against Drugs@FDA
          </p>
        </Reveal>
      </Container>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and build**

Run: `bunx tsc --noEmit`
Expected: 0 errors.

Run: `bun run build`
Expected: build succeeds. Confirm the homepage route builds with no errors (`StatStrip` is rendered on `/`).

- [ ] **Step 3: Commit**

```bash
git add components/site/sections/StatStrip.tsx
git commit -m "StatStrip: rebuild as a three-tile KPI grid using StatTile"
```

---

### Task 9: Full-site verification and visual confirmation

**Files:** none (verification only)

**Interfaces:** none

- [ ] **Step 1: Full clean build and typecheck**

Run: `bunx tsc --noEmit`
Expected: 0 errors.

Run: `bun run build`
Expected: build succeeds, all ~24 routes listed with no errors.

- [ ] **Step 2: Confirm no leftover references to the old navy tokens outside the hero**

Run: `grep -rn "#080f1f\|#0f1a30\|#16233d\|#3a4d72\|#5a75a3" app components lib`
Expected: no matches (the old hex values should not appear anywhere as hardcoded literals; the hero's own navy comes from the video frames, not a CSS token, so this should be clean).

- [ ] **Step 3: Start the dev server and visually confirm**

Run: `bun run dev -- -p 3100`

Using the project's own established method (screenshot-based visual confirmation before calling a palette change final — see `PeptideChecker.md`'s banked lesson that colour work must be seen, not assumed), check:
- The near-black body background against the still-navy hero — confirm the flagged contrast from the spec reads as an intentional "hero as the bright screen, body as the console around it" effect, not as a mismatch or a bug.
- Every migrated tag (`StatusChip` on `/compare`, `/results`, `/vendors/[slug]`, `/peptides/[slug]`, `/methodology`; the Hero trust badges; the `WhatWeVerify` "Fails on" tags; the `/pipeline` status chips; the `/peptides/[slug]` "Studied for" tags) renders as a filled/bordered pill consistently.
- The new `StatStrip` KPI-tile grid on the homepage.

- [ ] **Step 4: Report to Kevin**

Summarize what was verified (build clean, old tokens gone, tags consistent, hero/body contrast) and flag anything that looked wrong before considering the restyle complete.
