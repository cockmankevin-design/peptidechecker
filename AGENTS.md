# Deploying this site

**Run `bun run deploy`. Do not deploy by hand.**

The site is served from the prebuilt `gh-pages` branch, with no CI. Before this
script existed, every session improvised its own build-and-copy, two sessions
deployed three days apart unaware of each other, and because both commit as
Kevin the history cannot tell them apart.

The failure that matters is silent. `gh-pages` shares no history with `main`, so
building from a `main` that is behind origin and pushing the result reverts the
previous deploy with no conflict and no warning. `bun run deploy` refuses to run
in that state; a hand-rolled copy does not.

After deploying, run `bun run verify-deploy`. GitHub Pages rebuilds
asynchronously and its CDN caches, so the old page is served for up to a minute
after a successful push. That script waits for the live HTML to carry this
build's own Next.js build id, which is proof the deploy landed — grepping the
live page for a phrase you just wrote is not, because it passes as soon as the
CDN happens to revalidate.

If the deploy script aborts, read what it says and fix that. Do not work around
it, and never `git push --force` to `gh-pages`: the thing you would be forcing
past is someone else's deployment.

# 3D build direction (2026-09-27 brief, superseded in part by the built rework, 2026-10-09)

The site's background is a real-time **peptide molecule** (alpha-helix, ball-and-stick) behind every
page. The approved look and every value come from
`docs/superpowers/specs/assets/2026-10-09-molecule-prototype-b.html` ("B · Cinema"), and the spec is
`docs/superpowers/specs/2026-10-09-peptidechecker-3d-rework-design.md`.

- **Stack: plain Three.js (r169, from npm). Not React Three Fiber, drei or GSAP.** Kevin chose this
  on 2026-10-09 so the prototype's 60 fps tuning would carry over. The engine is
  `components/site/three/molecule/` (typed modules with `bun test` coverage). It is mounted once in
  `app/layout.tsx` through `MoleculeCanvasLoader` (`ssr:false`) → `MoleculeCanvas`, which wires scroll,
  pointer and resize, and switches between `journey` (homepage) and `ambient` (all other pages,
  under a 0.8 veil).
- **Camera:** the homepage's 5-stop scroll journey is locked ("the movements is perfect").
- **Image:** no depth of field, film grain or chromatic aberration. Kevin rejected blur.
  Contact shading uses per-item neighbour lists (up to 16), never a loop over all atoms.
- **UI:** content sits on dark glass (`GlassPanel`). No text ever sits on raw 3D, and the
  `check3d.py` contrast gate enforces it.
- **Performance and fallbacks:** at least 55 fps on Kevin's AMD integrated GPU is the gate.
  - Phones (<760px) get a lighter scene.
  - Reduced motion gets a true still frame.
  - No WebGL, a lost context or a sustained slow device gets the WebP stills in
    `public/molecule/` (regenerate them with `py -3 scripts/check3d.py --capture-stills`).

Two things from the original brief deliberately NOT carried over:
- It assigned a persona ("developer arm of the JARVIS fleet"). Identity comes from the global
  boot config, not project files.
- It said to fix and rebuild after errors "without asking for permission." Kevin's standing
  rule is to state the exact change and get confirmation before editing source. That rule
  stands here unless he explicitly changes it.

**One constraint specific to this site:** PeptideChecker sells credibility — every figure is
sourced and dated, and the whole pivot was away from anything that reads as a product pitch.
The 3D treatment is the frame, not the argument. Approval data, sources and dates must stay
plainly legible, never behind an effect, and the look must not drift toward the neon-vial
aesthetic of the grey-market sellers the site argues against.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
