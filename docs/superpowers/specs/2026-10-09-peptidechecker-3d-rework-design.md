# PeptideChecker — 3D Molecule Rework

**Date:** 2026-10-09
**Status:** Approved by Kevin in brainstorm (2026-10-08/09). Awaiting his review of this written spec.
**Supersedes:** the hero video (`hero-vial.mp4`) as the centrepiece. Folds in the 2026-09-24
dashboard restyle (`2026-09-24-dashboard-restyle-design.md`).
**Visual reference (the approved build):** `docs/superpowers/specs/assets/2026-10-09-molecule-prototype-b.html`.
This is a single-file, working Three.js prototype, "B · Cinema". It is the source of truth for the look, the
camera journey and the render pipeline. Port it; do not reinterpret it.

## Decisions (each one made by Kevin in the brainstorm)

| Question | Decision |
|---|---|
| 3D or not | Full cinematic 3D, from the 2026-09-27 brief |
| Hero video | Retired. The 3D scene replaces it |
| Scene subject | A peptide molecule: an alpha-helix in ball-and-stick, coloured by element (N, O, H, C) |
| Colour and type | Clinical cobalt. Geist for text, IBM Plex Mono for data |
| Homepage journey | Five camera stops (below). Kevin: "the movements is perfect" |
| Image quality | No blur of any kind: no depth of field, film grain or chromatic aberration. Kevin rejected v2 for "blurry spots and poor image quality" |
| Render variant | B · Cinema, chosen over A · Photoreal after both were viewed live |
| Inner pages | The dashboard restyle, folded in |
| Phones | A lighter live 3D scene. Reduced-motion users and weak devices get a still frame |
| 3D stack | Plain Three.js, ported from the prototype. **Not** React Three Fiber or GSAP. AGENTS.md is updated to match |

## 1. Homepage

A single fixed WebGL canvas sits behind the whole page. Content scrolls over it on dark glass cards. Section
order, copy and numbers are unchanged from today's `app/page.tsx` (Hero → StatStrip → PivotIndex →
EvidenceSummary → closing band).

### Camera stops

Each stop is driven by scroll progress, exactly as in the prototype. Port these from the prototype verbatim:
the `stops` array, the cubic easing, the smoothing `prog += (target - prog) * .06`, the mouse parallax and the
slow rotation of the chain.

| Stop | Section | Camera | Scene behaviour |
|---|---|---|---|
| 1 | Hero | Wide, whole chain | Chain slowly turns |
| 2 | StatStrip (12 / 4 / 1) | Close on one residue | — |
| 3 | PivotIndex (four routes) | Tracks along the chain | The nitrogen atoms of four residues glow, one per route card |
| 4 | EvidenceSummary | Close on the far end | One stretch of residues turns matte grey and drifts apart |
| 5 | Closing band | Pulls back | Chain dims to a backdrop |

### Content

- The stat values stay derived from `lib/fda-registry.ts`, never hardcoded. Today that gives 12 approved, 4 pipeline,
  1 discontinued, last checked 2026-09-23.
- The PivotIndex titles and EvidenceSummary copy are kept word for word.
- The hero headline stays "We check what the label can't tell you."

## 2. Inner pages

These are `/approved`, `/pipeline`, `/get-started`, `/cost`, `/about`, `/faq`, `/methodology` and the remaining routes.

- **Background:** the same molecule, dimmed (a veil of about .8 opacity, `--color-bg`), slowly rotating, with no
  scroll journey. On a route change it is the same canvas instance, never torn down and rebuilt.
- **Data presentation:** the 2026-09-24 dashboard restyle, as specified there:
  - filled status pills (one shared `Pill` primitive);
  - stat tiles;
  - tables and cards on glass panels.
- **Status wording:** use the pivot's statuses, Approved, Pipeline and Discontinued. The seven-gate
  statuses (Verified, Under review, Delisted) stay on the vendor evidence pages only.
- **Legibility rule:** text never sits directly on the moving 3D. Every text block sits on a glass panel. Text
  meets WCAG AA (4.5:1) against the panel's worst-case composite: the panel colour over the brightest 3D pixel
  that can appear behind it.

## 3. Look

- **Tokens:** the existing cobalt accent family. The background moves from today's navy `#080f1f` toward the
  prototype's deep navy-black. It is never flat `#000`; the scene background is a radial navy gradient.
- **Glass:** `rgba(6,10,22,.5)`, `backdrop-filter: blur(16px) saturate(1.2)`, a 1px line at `rgba(120,160,255,.22)`
  and a 14px radius. These are the prototype's values.
- **Fonts:** Geist and IBM Plex Mono, both already self-hosted by the site.
- **Avoid:** neon, purple gradients and anything that reads like the grey-market vendor vial sites.

## 4. Render pipeline (port from the prototype)

The prototype's pipeline is the spec:

- Instanced atoms and bonds with per-atom neighbour lists. Contact occlusion and soft key-light shadowing are
  computed against only about four neighbours per pixel. Never loop over all atoms: the rejected "crisp studio"
  variant did that and fell to 0 fps at stop 2.
- 4× MSAA on a half-float target.
- Once the camera settles, jittered supersampling accumulates several frames.
- Bloom is applied only to the deliberate stop-3 glow.
- Vignette and a 1-LSB dither. No grain, no chromatic aberration, no depth of field.
- **Quality governor:** supersampling runs only while the camera is settled. The supersample level steps down,
  and then the pixel ratio steps down, when the machine cannot hold about 55 fps.
- **Lighting is local:** no runtime HDRI download. The prototype loads the polyhaven HDRI only behind a `?hdri`
  flag; the production build ships without it.
- **Three.js r169:** installed with `bun add three`, not loaded from a CDN. The scene is one client component
  (`"use client"`) that is dynamically imported with `ssr: false`, so the static export never tries to render
  WebGL on the server.

## 5. Phones and fallbacks

| Condition | Behaviour |
|---|---|
| Width < 760px | Same scene and journey. Pixel ratio capped at 1.5, 500 dust particles instead of 1,100, no supersampling |
| `prefers-reduced-motion` | Still frame at stop 1: no rotation, no camera travel. Text and glass are unchanged |
| No WebGL, or a context lost | A pre-rendered still image of stop 1, shipped as WebP, behind the same glass layout |
| Governor floor reached and still under 30 fps | Switch to the still image |

The still image is captured from the production scene itself at 1440×900 and 390×844, so it matches the scene.

## 6. What does not change

- FDA-approved medicines only, reached through licensed telehealth referrals (`lib/fda-registry.ts`).
- The vendor registry stays a small evidence section. No buy links, affiliate links or rankings.
- Never use "we test" language anywhere.
- No dosing guides, dosage calculators or where-to-buy pages for pipeline drugs.
- Every figure is sourced and dated, with no invented numbers.
- The "for research purposes only" footer and the affiliate disclosure stay.
- Deploys use `bun run deploy`, then `bun run verify-deploy`, and are never done by hand.

## 7. Files touched (outline; the plan fixes the details)

- **New:**
  - `components/site/three/MoleculeScene.tsx`: client component with the ported scene, pipeline and governor.
  - A journey hook or config that maps homepage sections to camera stops.
  - The still fallback images under `public/`.
- **Changed:**
  - `app/layout.tsx`: mounts the persistent canvas.
  - `app/page.tsx` and the homepage sections: become glass cards.
  - `Hero.tsx`: video removed.
  - `app/globals.css`: tokens and glass.
  - `components/site/ui.tsx`: `Pill`, stat tile and glass panel primitives.
  - The inner pages: dashboard restyle.
  - `AGENTS.md`: the 3D direction section now records plain Three.js, the stack Kevin chose on 2026-10-09.
- **Removed:**
  - `public/hero-vial/`: the video and its webp frame folders, once `Hero.tsx` no longer references them
    (checked 2026-10-09: `Hero.tsx` is their only consumer).
  - Pre-existing dead code, removed only with Kevin's OK and not as part of this rework's own changes.
    `Problem`, `VerificationScroll`, `SayNo`, `Independence` and `VendorCTA` are imported nowhere (grep,
    2026-10-09). `WhatWeVerify` (`/methodology`), `RegistryPreview` (`/vendors`) and `Faq` (`/faq`) are still
    in use and stay.

## 8. Verification (every task, real output)

- `bun x tsc --noEmit` is clean, and `bun run build` is clean across all routes.
- A Playwright capture against the real GPU (ANGLE D3D11):
  - all five homepage stops at 1440×900;
  - stops 1 and 2 at 390×844;
  - every inner route at both sizes;
  - zero console or page errors.
- **Performance:** at least 55 fps measured at stops 1 and 2 on Kevin's machine (AMD Radeon integrated).
- **Visual:** a sharpness check of every capture. No blur, haze, fringing or jaggies on foreground atoms.
- **Contrast:** the worst-case glass composite is at least 4.5:1 for body text.
- **Reduced motion:** with it emulated, the page shows a still frame and the camera never moves.
- **Fallback:** with WebGL disabled, the fallback image renders and the layout is unchanged.
- **Review and deploy:** Kevin reviews between tasks. Deploy only on his explicit OK. After deploy, run
  `bun run verify-deploy`, then capture the live site.
