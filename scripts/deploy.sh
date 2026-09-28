#!/usr/bin/env bash
#
# The ONE deploy procedure for this site. Run it with `bun run deploy`.
#
# Why this file exists (2026-09-27): nothing documented how to deploy, so every
# agent and session improvised its own build-and-copy into the gh-pages branch.
# Two of them deployed within three days of each other, each unaware of the
# other, and both commit as Kevin so the history cannot tell them apart. The
# failure that matters is silent: build from a main that is behind origin, push
# the result, and the previous deploy's content is reverted with no conflict and
# no warning.
#
# The guard against that is step 2 — refuse to deploy a build made from a main
# that is missing commits the remote already has.
#
# Two hand-rolled traps this also removes, both hit for real:
#   * `robocopy /MIR` deletes the worktree's .git, which is a FILE in a worktree,
#     not a directory, so /XD .git does not protect it. Here the mirror is done
#     in shell and .git is excluded by name.
#   * A stale local gh-pages ref makes the push non-fast-forward, which invites a
#     --force that clobbers whatever is on the remote. Here the commit is always
#     built directly on top of the fetched origin/gh-pages, so the push is always
#     a fast-forward and --force is never needed.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

WT=""
cleanup() {
  if [ -n "$WT" ] && [ -d "$WT" ]; then
    git worktree remove "$WT" --force >/dev/null 2>&1 || rm -rf "$WT"
    git worktree prune >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[31mDEPLOY ABORTED: %s\033[0m\n\n' "$*" >&2; exit 1; }

# --- 1. Deploy only from a clean main -----------------------------------------
say "Checking the working tree"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ "$BRANCH" = "main" ] || die "on branch '$BRANCH', not main. Deploy from main."
[ -z "$(git status --porcelain --untracked-files=no)" ] \
  || die "uncommitted changes. Commit them first, so what is live matches a commit."

# --- 2. The guard that prevents silent reverts --------------------------------
# A build made from a main that is behind origin would push older pages over
# newer ones. Git will not complain, because gh-pages is a separate branch with
# no relationship to main's history. So check it here.
say "Checking main is up to date with origin"
git fetch origin main --quiet
BEHIND="$(git rev-list --count HEAD..origin/main)"
if [ "$BEHIND" -ne 0 ]; then
  die "main is $BEHIND commit(s) behind origin/main.
  Someone else has pushed. Building now would deploy a stale site and silently
  revert their work. Run: git pull --rebase   then deploy again."
fi
AHEAD="$(git rev-list --count origin/main..HEAD)"
[ "$AHEAD" -eq 0 ] || die "main is $AHEAD commit(s) ahead of origin/main.
  Push your source first: git push"

# --- 3. Build -----------------------------------------------------------------
# Building from the repo root matters: `bun run build` fails with EBUSY if the
# shell's cwd is anywhere inside out/.
say "Building"
bun run build
[ -d out ] || die "build produced no out/ directory."
# Recreated every build. Without it GitHub Pages runs Jekyll, which drops every
# _next/ path and serves an unstyled site.
touch out/.nojekyll

# --- 4. Publish on top of whatever is on the remote ---------------------------
say "Fetching gh-pages"
git fetch origin gh-pages --quiet

WT="$(mktemp -d -t pcgh-XXXXXX)"
rm -rf "$WT"
git worktree add --quiet --detach "$WT" origin/gh-pages

say "Mirroring build output"
# Delete everything except .git, then copy. `.git` in a worktree is a file that
# points back at the main repo; removing it detaches the worktree entirely.
find "$WT" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -r out/. "$WT"/

cd "$WT"
git add -A
if git diff --cached --quiet; then
  say "No change in the built output — nothing to deploy"
  exit 0
fi

SRC="$(git -C "$ROOT" rev-parse --short HEAD)"
MSG="${1:-Deploy from main@$SRC}"
git commit --quiet -m "$MSG

Source: main@$SRC
Deployed by scripts/deploy.sh

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"

say "Pushing gh-pages"
# Always a fast-forward: this commit's parent IS the origin/gh-pages we fetched
# a moment ago. If this is ever rejected, someone deployed in the last few
# seconds — re-run rather than forcing.
git push origin HEAD:gh-pages

cd "$ROOT"
say "Deployed. GitHub Pages usually serves it within a minute."
echo "    https://cockmankevin-design.github.io/peptidechecker/"
echo "    Verify with:  bun run verify-deploy"
