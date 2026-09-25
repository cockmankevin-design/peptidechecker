# PeptideChecker — Dashboard/KPI Restyle

**Date:** 2026-09-24
**Status:** Approved by Kevin, pending implementation

## Origin

Kevin sent an Instagram reel (an email-marketing agency's client-onboarding
walkthrough — nothing to do with peptides) as a design reference. The relevant
frame is its "Monthly Reporting" slide: a near-black dashboard card showing a
grid of KPI tiles (Leads Generated, CPA, CTR, Open Rate, Click Rate...), each
with a bold white number and a small colored status pill — green "Exceeding
Target," blue "On Target," red "Below Target." Kevin confirmed this pill/tile
look, on a near-black ground, is the reference. He also confirmed scope is a
restyle, not a rebuild, and that the current hero's scroll-scrubbed vial
animation should not change.

## Scope

Visual restyle only. Same pages, same content, same copy, same seven-gates
model, same no-score / no-affiliate-on-vendor-pages rules, same hero
animation pipeline (`Hero.tsx`, GSAP scroll-pin, canvas frame scrub). Nothing
about page structure, routing, or the FDA-pivot content changes.

## What stays unchanged

- `Hero.tsx` — the scroll-scrubbed vial canvas animation, frame pipeline,
  GSAP pin/scrub logic, and the hero's own navy gradient background. Zero
  changes to this file's animation code.
- Page structure and copy: `/approved`, `/pipeline`, `/cost`, `/get-started`,
  `/vendors`, `/methodology`, `/compare`, `/peptides`, `/blog`, etc.
- The seven-gates model, the no-score rule, the verified/review/delisted
  semantics, and the WCAG AA contrast discipline already enforced in
  `globals.css`.
- No buttons/affiliate links on the grey-market vendor registry; buttons stay
  correct only on the FDA-approved-medicine pages — this is a locked business
  rule, unrelated to visual styling, and this restyle does not touch it.

## What changes

### 1. Background — navy toward near-black

`--color-bg`, `--color-surface`, `--color-surface-2` in `app/globals.css`
shift from the current navy tint (`#080f1f` / `#0f1a30` / `#16233d`) toward a
true near-black dashboard ground, matching the reel's reference rather than a
navy-tinted one. Every shifted value gets re-checked against WCAG AA (4.5:1
text, and border/line presence per the project's own banked lesson that a
color passing the text-contrast formula can still be an invisible border) —
same discipline the existing token comments already document.

**Flagged tension, not a blocker:** the hero's own background is the navy
Higgs-Field video and is explicitly staying navy (per "what stays unchanged"
above). A near-black body against a navy hero is an intentional contrast in
dashboard-style sites (hero as the "screen," body as the "console around
it") but is a visible shift from the current fully-cohesive navy-everywhere
look. Worth a look once built before calling it final.

### 2. Tags / status chips — filled KPI-pill treatment

Every chip-like element site-wide is rebuilt to the reel's pill style: a
solid colored fill (not the current thin-border-plus-dim-background look),
bold label, rounded-full shape — the same visual language as the reel's
"Exceeding Target" / "On Target" / "Below Target" pills.

- `StatusChip` (`components/site/ui.tsx`) — verified/review/delisted move
  from outline+dim-bg to filled-pill.
- Hero trust badges (`Hero.tsx`, the `BADGES` array) — restyled to match,
  animation/layout unchanged.
- `WhatWeVerify`'s "Fails on" tag — same pill treatment.
- Any other ad-hoc badge/pill found across the 11 files that currently
  hand-roll their own chip styling (`get-started`, `cost`, `vendors/[slug]`,
  `pipeline`, `approved`, `methodology`, `results`, `compare`, `blog`,
  `peptides/[slug]`, `peptides`) gets normalized onto the shared `StatusChip`
  (or a new shared `Pill` primitive if the existing one doesn't fit a given
  case) rather than staying page-specific.

### 3. Stat-tile pattern — the actual KPI card

Introduce a real stat-tile pattern, borrowed directly from the reel's grid,
anywhere the site currently shows plain numbers or lists where a bold
number + label + status pill would read better (e.g. `StatStrip`,
`RegistryPreview`-adjacent summary numbers). Large white number, small mono
label underneath, colored pill where a status applies — same shape as the
reel's tiles, not a literal copy of its metric names.

## Non-goals

- No new pages, no content rewrites, no restructuring.
- No change to the hero's animation, the seven gates, the no-score rule, or
  the affiliate-disclosure/buy-button rules.
- No change to font choices (Geist / IBM Plex Mono stay).

## Verification

- WCAG AA re-checked for every new/changed color pairing, both text-contrast
  and border/line presence (not just the formula in isolation — this project
  has been burned by that gap once already, see `PeptideChecker.md`).
- Full `bun run build` + typecheck clean, all routes render.
- Visual confirmation via Playwright screenshots (or equivalent) before
  calling the restyle final — this project's own banked lesson is that
  palette/visual work must be seen, not assumed correct from code alone.
