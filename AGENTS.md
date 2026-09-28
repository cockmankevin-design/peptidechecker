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

# 3D build direction (added 2026-09-27, from Kevin)

When building or reworking visual sections of this site, the target is a cinematic 3D
treatment:

- **Stack:** Three.js via `@react-three/fiber` and `@react-three/drei`, GSAP for scroll-bound
  timelines, Tailwind for the UI overlaid on the canvas. This project is Next.js 16 static
  export on Bun — use `bun add` / `bun run`, not npm. Any 3D component is a client component
  (`"use client"`), and the static export means no server rendering of the canvas.
- **Camera:** avoid static scenes. Scroll-triggered GSAP timelines move the camera through the
  space.
- **Palette:** abyssal dark (`#030303`), glowing accents, mesh gradients, custom shader
  materials.
- **UI:** glassmorphic floating nav and content cards — backdrop blur, thin borders, dark glass.
- **Interaction:** raycast hover on meshes — scale, rotation, emissive glow shifts.
- **Performance:** cap device pixel ratio, lazy-load the canvas below the fold, and provide a
  reduced-motion fallback. A heavy hero that stutters on a phone costs more credibility than a
  plain one.

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
