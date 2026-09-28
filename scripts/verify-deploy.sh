#!/usr/bin/env bash
#
# Confirm the live site is serving the build currently in out/.
#
# "Pushed" is not "live": GitHub Pages rebuilds asynchronously and its CDN
# caches, so the old page keeps being served for a minute or so after a
# successful push. Checking by eye during that window reads as a failed deploy
# and invites a second, unnecessary one.
#
# The fingerprint is Next.js's build id — the directory name under
# out/_next/static/ that holds _buildManifest.js. It changes every build, so
# asking the live site for that exact asset is a yes/no question: 200 means the
# deploy landed, 404 means the old build is still being served. Grepping the
# live HTML for a phrase you just wrote proves far less, since it passes the
# moment the CDN revalidates for any reason.
#
# 2026-09-27: the first version of this script read the build id out of
# out/index.html, which does not reference _buildManifest.js in Next 16. The
# grep matched nothing, and under `set -e` a failed command substitution in an
# assignment exits immediately — so it died silently with no output at all.
# Reading the directory name avoids both problems.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

URL="https://cockmankevin-design.github.io/peptidechecker"
TIMEOUT="${1:-300}"

[ -d out/_next/static ] || { echo "No out/ build found — run 'bun run build' first." >&2; exit 1; }

MANIFEST="$(ls out/_next/static/*/_buildManifest.js 2>/dev/null | head -1 || true)"
[ -n "$MANIFEST" ] || { echo "No _buildManifest.js under out/_next/static/." >&2; exit 1; }
BUILD_ID="$(basename "$(dirname "$MANIFEST")")"

ASSET="$URL/_next/static/$BUILD_ID/_buildManifest.js"
echo "Local build id: $BUILD_ID"
echo "Waiting up to ${TIMEOUT}s for the live site to serve it."

DEADLINE=$(( $(date +%s) + TIMEOUT ))
while [ "$(date +%s)" -lt "$DEADLINE" ]; do
  CODE="$(curl -s -o /dev/null -w '%{http_code}' -H 'Cache-Control: no-cache' \
    "${ASSET}?cb=$(date +%s%N)" || echo "000")"
  if [ "$CODE" = "200" ]; then
    echo "LIVE — the site is serving build $BUILD_ID"
    exit 0
  fi
  echo "  not yet (HTTP $CODE) ..."
  sleep 12
done

echo "Timed out after ${TIMEOUT}s. The push may still be building — check" >&2
echo "https://github.com/cockmankevin-design/peptidechecker/deployments" >&2
exit 1
