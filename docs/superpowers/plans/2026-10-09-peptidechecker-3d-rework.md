# PeptideChecker 3D Molecule Rework — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Kevin reviews between every task.

**Goal:** Port the approved B · Cinema Three.js prototype behind the whole site, with the homepage camera journey, dashboard inner pages and mobile/fallback modes.

**Spec:** `docs/superpowers/specs/2026-10-09-peptidechecker-3d-rework-design.md`. **Visual source of truth:** `docs/superpowers/specs/assets/2026-10-09-molecule-prototype-b.html`.

## Global Constraints

- Port the prototype verbatim: the `stops` array, cubic easing, `prog += (target-prog)*.06`, parallax, chain rotation, stop-3 LIT glow and stop-4 BROKEN grey break-apart.
- No depth of field, film grain or chromatic aberration. Contact AO uses per-item neighbour lists of up to 16 (`NB = 16`), never a loop over all atoms.
- Three.js r169 from npm (`bun add three`). Never load it from a CDN, and download no HDRI at runtime.
- One fixed canvas, mounted once in `app/layout.tsx`, as a client component with `ssr:false`.
- At least 55 fps at homepage stops 1 and 2 on Kevin's AMD integrated GPU (Playwright, `--use-angle=d3d11`).
- Text never sits directly on the 3D: always on glass. The worst-case contrast composite is at least 4.5:1.
- Phones under 760px: pixel ratio 1.5, 500 dust particles, no supersampling. Reduced motion gets a still frame. No WebGL, or the governor floor below 30 fps, gets the WebP still.
- Unchanged:
  - FDA-approved medicines only, through telehealth.
  - The vendor section has no buy links, affiliate links or rankings.
  - Never use "we test".
  - No dosing content.
  - Every figure is sourced and dated, and stat values derive from `lib/fda-registry.ts`.
  - The research-only footer and the disclosure stay.
- Every task:
  - `bun x tsc --noEmit`, `bun test` and `bun run build` are clean;
  - the harness passes with zero console errors;
  - captures at 1440x900 and 390x844 are looked at.
- Stop processes by PID only. Commit and push each task. Deploy only on Kevin's explicit OK, via `bun run deploy` and then `bun run verify-deploy`.

---

## Tasks
1. **Merge the dashboard restyle.**
   - Merge `worktree-dashboard-restyle` into `main` and resolve conflicts against the post-pivot copy.
   - Main has moved: `df86a25`, `c2c5c3f`, the deploy scripts and the Hero loop change `c1f1820`.
   - The Hero badge commit `4ea3eda` may be dropped where it conflicts, because the Hero is rebuilt in Task 4.
   - Keep `lib/content.test.ts` if it came from that branch.
   - Then remove the worktree (`git worktree remove`), with Kevin's OK at that step.
   - Verify: `bun x tsc --noEmit`, `bun test`, `bun run build`, all routes.
2. **Verification harness**: `scripts/check3d.py`, generalised from the session's `snapfps.py`.
   - Builds the static export without `BASE_PATH`, serves `out/` on its own port and records the PID.
   - Playwright Chromium with `--use-angle=d3d11`. Asserts the GPU string is not SwiftShader.
   - fps over 3s at chosen scroll points.
   - Screenshots of the homepage stops at 1440×900 and 390×844, plus every route at both sizes.
   - Fails on any console or page error.
   - Modes: `--reduced-motion`, and `--no-webgl` (`--disable-webgl`).
   - Stops the server by its PID.
   - This harness is the gate for every later task.
3. **Scene engine** (`bun add three`, `bun add -d @types/three`), in `components/site/three/molecule/`. Pure TS
   modules ported verbatim from the prototype:
   - `build.ts`: residues and atoms, the `LIT` and `BROKEN` sets, instanced meshes, per-atom neighbour lists
     of at most 4.
   - `materials.ts`: the occlusion and key-shadow shader hooks.
   - `pipeline.ts`: 4× MSAA half-float target, settled-camera jittered supersampling, glow-only bloom,
     vignette and dither.
   - `governor.ts`: steps down the supersample level, then the pixel ratio, then switches to the still image.
   - `journey.ts`: `stops`, cubic easing, `prog += (target-prog)*.06`, parallax.
   - `bun test` unit tests for the pure parts:
     - neighbour lists are at most 4 and symmetric;
     - journey interpolation equals the prototype's values at fractions 0, .25, .5, .75 and 1;
     - governor stepping and floor behaviour.
4. **Canvas plus homepage.**
   - `components/site/three/MoleculeCanvas.tsx` (`"use client"`, `next/dynamic` with `ssr:false`), mounted once in
     `app/layout.tsx` as a fixed layer behind `<main>`. Mode `journey` on `/`, `ambient` elsewhere, from
     `usePathname`, with the same instance across routes.
   - `Hero.tsx`: the video and frame code are removed, and it becomes a glass card with the unchanged headline.
   - The homepage sections (StatStrip, PivotIndex, EvidenceSummary, the closing band) become glass panels,
     using the prototype's glass values as tokens in `app/globals.css`.
   - Copy and the `fda-registry` derivation are unchanged.
   - Verify:
     - the harness captures of the 5 stops sit next to the prototype captures;
     - at least 55 fps at stops 1 and 2;
     - no blur.
5. **Inner pages.**
   - Ambient mode: veil about .8 `--color-bg`, slow rotation, no journey.
   - `PageHeader`, tables and cards in `components/site/ui.tsx` get a glass panel primitive, so no text sits on
     raw 3D.
   - Add a contrast check to the harness: the worst-case panel composite over the brightest scene pixel must
     be at least 4.5:1.
   - Verify every route at both sizes.
6. **Phones and fallbacks.**
   - Below 760px: pixel ratio 1.5, 500 dust particles, no supersampling.
   - Reduced motion: a still frame of stop 1.
   - No WebGL, context lost, or governor floor below 30 fps: WebP stills in `public/molecule/`. The stills are
     captured from the production scene at 1440×900 and 390×844 by a harness subcommand.
   - Verify with the harness's `--reduced-motion` and `--no-webgl` modes, plus the mobile captures.
7. **Cleanup and docs.**
   - Delete `public/hero-vial/` once a grep shows no references.
   - Rewrite the AGENTS.md 3D section to plain Three.js (Kevin, 2026-10-09).
   - Ask Kevin whether to delete the pre-existing dead sections (`Problem`, `VerificationScroll`, `SayNo`,
     `Independence`, `VendorCTA`). Delete them only on his OK.
8. **Full verification and deploy gate.**
   - Run the whole harness, a mobile Lighthouse score, and `tsc`, `test` and `build` clean.
   - Kevin reviews the captures and the local site.
   - **Deploy only on his explicit OK:** `bun run deploy`, then `bun run verify-deploy`, then a live capture.
   - Update the vault notes: PeptideChecker and the daily note.

## Reuse
- The prototype file, which is the source of every value.
- `Pill`, `StatTile` and `StatusChip` from the restyle branch.
- `Container`, `Section`, `Reveal` and `PageHeader` in `components/site/ui.tsx`.
- `lib/fda-registry.ts` and `lib/basePath.ts` `asset()` for every raw asset path.
- `scripts/deploy.sh` and `scripts/verify-deploy.sh`.
- The `.claude/launch.json` config `peptidechecker-dev` on port 3100.

## Verification (end to end)
- The harness passes in all modes, with no console errors.
- At least 55 fps at the homepage stops on Kevin's GPU.
- Captures match the prototype's look, with no blur or haze.
- Contrast is at least 4.5:1.
- `tsc`, `bun test` and `bun run build` are clean.
- After the gated deploy, `verify-deploy` confirms the new build id is live, and a capture of the live site is taken.
