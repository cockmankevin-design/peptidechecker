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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
