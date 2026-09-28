#!/usr/bin/env bash
#
# Confirm the live site is serving the build currently in out/.
#
# "Pushed" is not "live": GitHub Pages rebuilds asynchronously and its CDN
# caches, so the old page keeps being served for a minute or so after a
# successful push. Checking by eye during that window reads as a failed deploy
# and invites a second, unnecessary deploy.
#
# The fingerprint is Next.js's build id, which appears in the asset path
# /_next/static/<buildId>/_buildManifest.js and changes every build. Matching it
# proves the live HTML came from this exact build, which grepping for a phrase
# you just wrote does not.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

URL="https://cockmankevin-design.github.io/peptidechecker/"
TIMEOUT="${1:-300}"

[ -f out/index.html ] || { echo "No out/index.html — run the build first." >&2; exit 1; }

BUILD_ID="$(grep -o '_next/static/[^/]*/_buildManifest.js' out/index.html | head -1 | cut -d/ -f3)"
[ -n "$BUILD_ID" ] || { echo "Could not read a build id from out/index.html." >&2; exit 1; }

echo "Local build id: $BUILD_ID"
echo "Waiting up to ${TIMEOUT}s for $URL to serve it."

DEADLINE=$(( $(date +%s) + TIMEOUT ))
while [ "$(date +%s)" -lt "$DEADLINE" ]; do
  LIVE="$(curl -sS -H 'Cache-Control: no-cache' "${URL}?cb=$(date +%s%N)" \
    | grep -o '_next/static/[^/]*/_buildManifest.js' | head -1 | cut -d/ -f3 || true)"
  if [ "$LIVE" = "$BUILD_ID" ]; then
    echo "LIVE — serving $BUILD_ID"
    exit 0
  fi
  echo "  still serving ${LIVE:-<none>} ..."
  sleep 12
done

echo "Timed out after ${TIMEOUT}s. The push may still be building — check" >&2
echo "https://github.com/cockmankevin-design/peptidechecker/deployments" >&2
exit 1
