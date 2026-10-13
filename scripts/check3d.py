#!/usr/bin/env python3
"""check3d.py - the verification gate for the PeptideChecker 3D rework.

Builds the static export, serves out/ on a private local port, drives Chromium on
the real GPU, screenshots every route at a desktop and a mobile viewport, steps
the homepage through its scroll stops, measures homepage fps, and fails on any
uncaught page error, console error or HTTP response >= 400. At desktop it also
checks the contrast of every body-size text element against the pixels actually
rendered behind it (see contrast_check) and fails anything under WCAG AA 4.5:1.

    py -3 scripts/check3d.py [--no-build] [--routes all|home] [--out DIR] [--min-fps N]
                             [--fps-at 0,0.25] [--stops 0,0.25,0.5,0.75,1]
                             [--reduced-motion] [--no-webgl] [--no-contrast] [--self-test]

Exit 0 = pass, 1 = fail. Results land in --out (default
.superpowers/check3d/<YYYYmmdd-HHMMSS>/): screenshots plus summary.json.

--self-test runs the same pipeline against scripts/check3d_fixture/ and proves
the gate catches a broken page while ignoring Next's harmless prefetch 404s.

The local server is stopped through its own Popen handle only. Never kill
processes by name here: a previous agent did and took down unrelated services.
"""

import argparse
import io
import json
import os
import shutil
import socket
import subprocess
import sys
import time
import traceback
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "out"
FIXTURE_DIR = Path(__file__).resolve().parent / "check3d_fixture"

CHROMIUM_ARGS = ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"]
VIEWPORTS = [("d", 1440, 900), ("m", 390, 844)]  # (tag, width, height)
SETTLE_AFTER_LOAD_MS = 1500
SCROLL_STEP_PX = 300
SCROLL_PAUSE_MS = 100
SETTLE_AFTER_SCROLL_MS = 800
STOP_WAIT_MS = 3500  # the camera eases toward each homepage stop
FPS_WINDOW_MS = 3000
CONTRAST_MIN = 4.5          # WCAG AA, normal text
CONTRAST_MAX_FONT_PX = 18   # "body size": computed font-size at or below this is checked
CONTRAST_WORST_N = 20       # worst case = the 20th lightest (or darkest) background pixel
CONTRAST_BAND_PX = 6        # how far outside the glyph boxes the background is sampled
CONTRAST_SETTLE_MS = 900    # reveal entrances (Motion fadeUp) finish before a view is sampled

# Contrast, step 1 (in the page). For the current viewport, return every text run
# not yet checked that is body size, wholly inside the viewport, visible, fully
# opaque (so not mid-entrance), not under aria-hidden, not the 3D canvas and not
# covered by another element such as the fixed nav. A "run" is one element's own
# direct text nodes; its glyph boxes are the client rects of a Range over those
# nodes (one per line). Also returns the glyph boxes of all text in view, so the
# sampler never takes a neighbour's glyphs for background. Each element is
# measured once, in the first view that shows it whole (window.__contrastSeen).
CONTRAST_COLLECT_JS = r"""([maxFont]) => {
  const seen = window.__contrastSeen || (window.__contrastSeen = new WeakSet());
  const vw = innerWidth, vh = innerHeight;
  const runs = [], allBoxes = [];
  // Any CSS colour (rgb, oklab, color(srgb ...)) -> [r, g, b, a 0..1], resolved by the browser itself.
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgba = (c) => {
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = "#000"; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  for (let el = walker.currentNode; el; el = walker.nextNode()) {
    if (["CANVAS", "SCRIPT", "STYLE", "NOSCRIPT"].includes(el.tagName)) continue;
    const texts = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    if (!texts.length) continue;
    if (el.closest("[aria-hidden='true']")) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility !== "visible") continue;
    let op = 1;
    for (let a = el; a; a = a.parentElement) op *= parseFloat(getComputedStyle(a).opacity);
    if (op < 0.99) continue;
    const range = document.createRange();
    const boxes = [];
    for (const t of texts) {
      range.selectNodeContents(t);
      for (const r of range.getClientRects())
        if (r.width >= 2 && r.height >= 2) boxes.push([r.left, r.top, r.right, r.bottom]);
    }
    if (!boxes.length) continue;
    if (boxes.some(([l, t, r, b]) => r > 0 && b > 0 && l < vw && t < vh)) allBoxes.push(...boxes);
    if (seen.has(el) || !boxes.every(([l, t, r, b]) => l >= 0 && t >= 0 && r <= vw && b <= vh)) continue;
    const fs = parseFloat(cs.fontSize);
    if (fs > maxFont) { seen.add(el); continue; }
    const covered = boxes.some(([l, t, r, b]) => {
      const hit = document.elementFromPoint((l + r) / 2, (t + b) / 2);
      return !hit || !(hit === el || el.contains(hit));
    });
    if (covered) continue;  // try again in a later view
    seen.add(el);
    // The surface the text sits on: the nearest ancestor (or itself) that paints a background or is glass.
    let surface = null;
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a);
      const painted = rgba(s.backgroundColor)[3] > 0 || s.backdropFilter !== "none";
      if (painted) {
        const r = a.getBoundingClientRect();
        surface = [r.left, r.top, r.right, r.bottom, Math.min(parseFloat(s.borderTopLeftRadius) || 0, r.height / 2)];
        break;
      }
    }
    const own = el.getBoundingClientRect();
    const text =texts.map((t) => t.textContent.trim()).join(" ").replace(/\s+/g, " ").slice(0, 60);
    const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 3).join(".") : "";
    runs.push({ sel: el.tagName.toLowerCase() + (cls ? "." + cls : ""), text, color: rgba(cs.color),
                boxes, own: [own.left, own.top, own.right, own.bottom], surface });
  }
  // Small decorative marks (status dots, icons, the notice triangle) are not background either.
  for (const el of document.querySelectorAll("[aria-hidden='true'], svg")) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.width <= 48 && r.height <= 48) allBoxes.push([r.left, r.top, r.right, r.bottom]);
  }
  return { runs, allBoxes };
}"""

GPU_JS = """() => {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  if (!gl) return null;
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  return info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
}"""

# Walk the whole page so reveal-on-scroll sections fire; without it a static
# capture shows them empty. The height is re-read each step in case content grows.
SCROLL_THROUGH_JS = """async ([step, pause]) => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let y = 0; ; y += step) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: Math.min(y, max), left: 0, behavior: "instant" });
    await sleep(pause);
    if (y >= max) return;
  }
}"""

SCROLL_TO_FRACTION_JS = """(f) => {
  const y = (document.documentElement.scrollHeight - window.innerHeight) * f;
  window.scrollTo({ top: y, left: 0, behavior: "instant" });
}"""

# Counts requestAnimationFrame callbacks over the window, timed by rAF's own
# timestamps. The fallback timer reports what it counted rather than hanging the
# gate if rAF stops firing.
FPS_JS = """(windowMs) => new Promise((resolve) => {
  let first = null;
  let frames = 0;
  const tick = (t) => {
    if (first === null) first = t; else frames += 1;
    if (first !== null && t - first >= windowMs) resolve((frames * 1000) / (t - first));
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  setTimeout(() => resolve((frames * 1000) / windowMs), windowMs + 2000);
})"""


def fractions(text):
    try:
        values = [float(x) for x in text.split(",") if x.strip()]
    except ValueError:
        raise argparse.ArgumentTypeError(f"expected comma-separated numbers, got {text!r}")
    if not values or any(not 0 <= v <= 1 for v in values):
        raise argparse.ArgumentTypeError(f"expected fractions between 0 and 1, got {text!r}")
    return values


def parse_args():
    p = argparse.ArgumentParser(description="PeptideChecker build/render/error/fps gate.")
    p.add_argument("--no-build", action="store_true", help="serve the existing out/ without rebuilding")
    p.add_argument("--routes", choices=["all", "home"], default="all")
    p.add_argument("--out", help="output dir (default .superpowers/check3d/<YYYYmmdd-HHMMSS>)")
    p.add_argument("--min-fps", type=float, help="fail if desktop fps at any --fps-at point is below N")
    p.add_argument("--fps-at", type=fractions, default=fractions("0,0.25"),
                   help="homepage scroll fractions where fps is measured (default 0,0.25)")
    p.add_argument("--stops", type=fractions, default=fractions("0,0.25,0.5,0.75,1"),
                   help="homepage scroll fractions to screenshot (default 0,0.25,0.5,0.75,1)")
    p.add_argument("--reduced-motion", action="store_true", help="emulate prefers-reduced-motion: reduce")
    p.add_argument("--no-webgl", action="store_true", help="launch with WebGL disabled and assert it is")
    p.add_argument("--no-contrast", dest="contrast", action="store_false",
                   help="skip the desktop text-contrast check (on by default)")
    p.add_argument("--self-test", action="store_true", help="prove the gate against scripts/check3d_fixture/")
    return p.parse_args()


# --------------------------------------------------------------------------- build


def build():
    """Returns a failure string, or None on success."""
    bun = shutil.which("bun")
    if not bun:
        return "build: bun not found on PATH"
    # Explicitly empty: local serving is at the root, not under /peptidechecker/.
    env = dict(os.environ, BASE_PATH="")
    print("build: bun run build (BASE_PATH='')")
    # cwd must be the repo root: building with cwd inside out/ fails with EBUSY.
    result = subprocess.run([bun, "run", "build"], cwd=ROOT, env=env)
    if result.returncode != 0:
        return f"build: bun run build exited {result.returncode}"
    return None


def check_root_build():
    """out/ must be a root build, or every asset 404s when served at /."""
    index = OUT_DIR / "index.html"
    if not index.is_file():
        return f"build: {index} does not exist"
    # The leading quote matters: a deploy build references "/peptidechecker/_next/static/,
    # which contains /_next/static/ too but 404s every asset when served at the root.
    if '"/_next/static/' not in index.read_text(encoding="utf-8", errors="replace"):
        return ('build: out/index.html does not reference "/_next/static/ at the root '
                "(was it built with a BASE_PATH, e.g. by bun run deploy? rerun without --no-build)")
    return None


# --------------------------------------------------------------------------- serve


def free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def wait_until_answers(proc, url, timeout_s=15):
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        if proc.poll() is not None:
            raise RuntimeError(f"server exited early with code {proc.returncode}")
        try:
            opener.open(url, timeout=1).close()
            return
        except urllib.error.HTTPError:
            return  # any HTTP status means it is answering
        except OSError:
            time.sleep(0.1)
    raise RuntimeError(f"server did not answer {url} within {timeout_s}s")


def stop_server(proc):
    """Stop the server through its own handle. Never by process name."""
    if proc.poll() is None:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait(timeout=5)
    print(f"server: PID {proc.pid} stopped (exit code {proc.returncode})")


# --------------------------------------------------------------------------- routes


def discover_routes(root):
    routes = []
    for index in root.rglob("index.html"):
        rel = index.parent.relative_to(root).as_posix()
        if rel == ".":
            routes.append("/")
        elif rel.split("/")[0] != "_next" and rel not in ("404", "_not-found"):
            routes.append(f"/{rel}/")
    return sorted(routes, key=lambda r: (r != "/", r))


def slug(route):
    return "home" if route == "/" else route.strip("/").replace("/", "_")


def is_ignored_prefetch(url):
    """Next 16's prefetcher asks for flat __next.*.txt files that the static export
    writes as folders. The 404s are harmless (links still work), so they are the one
    excluded class. The query string is ignored."""
    path = urlparse(url).path
    return "/__next." in path and path.endswith(".txt")


# --------------------------------------------------------------------------- browser


def check_page(browser, origin, route, tag, width, height, args, out, report, ignored):
    """Load one route at one viewport, record its errors, capture it. On the homepage
    also step through the stops and measure fps."""
    context = browser.new_context(
        viewport={"width": width, "height": height},
        # Set both ways explicitly so the OS animation setting cannot leak into the default run.
        reduced_motion="reduce" if args.reduced_motion else "no-preference",
    )
    page = context.new_page()
    ignored.setdefault((route, tag), 0)
    responded = set()  # URLs that got any HTTP response on this page

    def add(kind, text):
        report["errors"].append({"route": route, "viewport": tag, "kind": kind, "text": text})

    def on_pageerror(err):
        add("pageerror", f"{err.name}: {err.message}" if err.name else err.message)

    def on_console(msg):
        # Resource failures are counted via their response, so excluded prefetch
        # 404s cannot leak back in through the console.
        if msg.type == "error" and not msg.text.startswith("Failed to load resource"):
            add("console", msg.text)

    def on_response(resp):
        responded.add(resp.url)
        if resp.status < 400:
            return
        if is_ignored_prefetch(resp.url):
            ignored[(route, tag)] += 1
            return
        url = resp.url[len(origin):] if resp.url.startswith(origin) else resp.url
        add("http", f"{resp.status} {url}")

    def on_requestfailed(req):
        # A request that never got a response (refused, DNS, blocked) has no
        # status for on_response to see, and its console line is skipped above.
        # Chromium also fires this (ERR_ABORTED) for a 4xx subresource it already
        # answered; that one is counted by on_response, so skip it here.
        if req.url in responded:
            return
        if is_ignored_prefetch(req.url):
            ignored[(route, tag)] += 1
            return
        url = req.url[len(origin):] if req.url.startswith(origin) else req.url
        add("request", f"{req.failure or 'failed'} {url}")

    page.on("pageerror", on_pageerror)
    page.on("console", on_console)
    page.on("response", on_response)
    page.on("requestfailed", on_requestfailed)
    try:
        page.goto(origin + route, wait_until="load")
        page.wait_for_timeout(SETTLE_AFTER_LOAD_MS)
        page.evaluate(SCROLL_THROUGH_JS, [SCROLL_STEP_PX, SCROLL_PAUSE_MS])
        page.wait_for_timeout(SETTLE_AFTER_SCROLL_MS)
        page.evaluate("() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })")
        name = f"{slug(route)}_{tag}.png"
        page.screenshot(path=str(out / name), full_page=True)
        report["screenshots"].append(name)
        if tag == "d" and args.contrast and not args.self_test:
            contrast_check(page, route, report)
            page.evaluate("() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })")
        if route == "/":
            homepage_stops(page, tag, args, out, report)
    except Exception as exc:  # recorded against this page; the run carries on
        add("harness", f"{type(exc).__name__}: {exc}".splitlines()[0])
    finally:
        context.close()


def homepage_stops(page, tag, args, out, report):
    plan = [(f, k) for k, f in enumerate(args.stops, 1)]
    plan += [(f, None) for f in dict.fromkeys(args.fps_at) if f not in args.stops]
    measured = set()
    for fraction, k in plan:
        page.evaluate(SCROLL_TO_FRACTION_JS, fraction)
        page.wait_for_timeout(STOP_WAIT_MS)
        if fraction in args.fps_at and fraction not in measured:
            fps = page.evaluate(FPS_JS, FPS_WINDOW_MS)
            report["fps"].append({"viewport": tag, "fraction": fraction, "fps": round(fps, 1)})
            measured.add(fraction)
        if k is not None:
            name = f"home_stop{k}_{tag}.png"
            page.screenshot(path=str(out / name))
            report["screenshots"].append(name)


# --------------------------------------------------------------------------- contrast


def rel_luminance(rgb):
    """WCAG 2.x relative luminance of sRGB 0..255 values (last axis = r, g, b)."""
    c = np.asarray(rgb, dtype=float) / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return c[..., 0] * 0.2126 + c[..., 1] * 0.7152 + c[..., 2] * 0.0722


def worst_contrast(img, run, all_boxes, scale):
    """Contrast, step 2 (here, deterministic). The background is the screenshot's
    pixels in a band up to CONTRAST_BAND_PX outside the run's glyph boxes, clipped
    to the surface the text sits on (its nearest ancestor that paints a background
    or is glass, inset by its corner radius; the element's own box when there is
    none, i.e. text straight on the page), with every glyph box and small
    decorative mark in view removed (grown 1px for antialiasing). If clipping
    leaves fewer than 20 pixels the band is used unclipped. The worst
    cases are the band's CONTRAST_WORST_N-th lightest and N-th darkest pixel by
    luminance (so at least N pixels right beside the glyphs are that bad: one
    bright atom behind a line of text is enough, a stray antialiased pixel is
    not); the text colour, alpha-composited over each, is compared with both and
    the lower WCAG ratio is the result. None if there
    is no usable band."""
    h, w = img.shape[:2]

    def px_rect(box, pad):
        l, t, r, b = box
        return (max(0, int((l - pad) * scale)), max(0, int((t - pad) * scale)),
                min(w, int(np.ceil((r + pad) * scale))), min(h, int(np.ceil((b + pad) * scale))))

    band = np.zeros((h, w), dtype=bool)
    for box in run["boxes"]:
        x0, y0, x1, y1 = px_rect(box, CONTRAST_BAND_PX)
        band[y0:y1, x0:x1] = True
    for box in all_boxes:
        x0, y0, x1, y1 = px_rect(box, 1)
        band[y0:y1, x0:x1] = False
    clip = np.zeros((h, w), dtype=bool)
    if run["surface"]:
        # Inset left and right by the corner radius so the page showing through a
        # rounded corner is never read as the surface.
        l, t, r, b, rad = run["surface"]
        l, r = l + rad, r - rad
    else:
        l, t, r, b = run["own"]
    # Rounded inward and inset one more pixel, so the antialiased edge of the
    # surface is never read as the surface.
    x0, y0 = int(np.ceil(l * scale)) + 1, int(np.ceil(t * scale)) + 1
    x1, y1 = int(r * scale) - 1, int(b * scale) - 1
    clip[max(0, y0):max(0, y1), max(0, x0):max(0, x1)] = True
    mask = band & clip
    if mask.sum() < 20:
        mask = band
    if mask.sum() < 20:
        return None
    px = img[mask].astype(float)
    order = np.argsort(rel_luminance(px), kind="stable")
    r, g, b, a = run["color"]  # already resolved to sRGB + alpha by the page
    ratios = []
    k = min(CONTRAST_WORST_N, len(order)) - 1
    for idx in (order[k], order[len(order) - 1 - k]):  # Nth darkest, Nth lightest
        bg = px[idx]
        fg = np.array([r, g, b]) * a + bg * (1 - a)
        lf, lb = float(rel_luminance(fg)), float(rel_luminance(bg))
        ratios.append((max(lf, lb) + 0.05) / (min(lf, lb) + 0.05))
    return min(ratios)


def contrast_check(page, route, report):
    """Walk the page a viewport at a time (80% steps, so a run cut by one view's
    edge is whole in the next); in each view take a screenshot and measure every
    body-size text run shown whole for the first time."""
    vh = page.evaluate("() => innerHeight")
    scale = page.evaluate("() => devicePixelRatio")
    page.evaluate("() => { window.__contrastSeen = new WeakSet(); }")
    checked, worst = 0, None
    y = 0
    while True:
        page.evaluate("(y) => window.scrollTo({ top: y, left: 0, behavior: 'instant' })", y)
        page.wait_for_timeout(CONTRAST_SETTLE_MS)
        data = page.evaluate(CONTRAST_COLLECT_JS, [CONTRAST_MAX_FONT_PX])
        if data["runs"]:
            img = np.array(Image.open(io.BytesIO(page.screenshot())).convert("RGB"))
            for run in data["runs"]:
                ratio = worst_contrast(img, run, data["allBoxes"], scale)
                if ratio is None:
                    continue
                checked += 1
                if worst is None or ratio < worst[0]:
                    worst = (ratio, run["text"])
                if ratio < CONTRAST_MIN:
                    report["contrast_failures"].append({"route": route, "selector": run["sel"],
                                                        "text": run["text"], "ratio": round(ratio, 2),
                                                        "scrollY": y})
        if y + vh >= page.evaluate("() => document.documentElement.scrollHeight"):
            break
        y += max(1, int(vh * 0.8))
    report["contrast"].append({"route": route, "checked": checked,
                               "worst": round(worst[0], 2) if worst else None,
                               "worst_text": worst[1] if worst else None})


def run_browser(origin, routes, args, out, report, ignored):
    launch_args = CHROMIUM_ARGS + (["--disable-webgl"] if args.no_webgl else [])
    with sync_playwright() as p:
        browser = p.chromium.launch(args=launch_args)
        try:
            probe = browser.new_page()
            report["gpu"] = probe.evaluate(GPU_JS)
            probe.close()
            print(f"gpu: {report['gpu'] or 'WebGL unavailable'}")
            gpu = report["gpu"]
            if args.no_webgl:
                if gpu is not None:
                    report["failures"].append(f"gpu: --no-webgl but WebGL is still available ({gpu})")
            elif gpu is None:
                report["failures"].append("gpu: WebGL is unavailable; fps must be measured on the real GPU")
            elif any(s in gpu for s in ("SwiftShader", "Basic Render Driver", "llvmpipe")):
                report["failures"].append(f"gpu: software renderer, not the real GPU ({gpu})")

            for i, route in enumerate(routes, 1):
                counts = []
                for tag, width, height in VIEWPORTS:
                    before = len(report["errors"])
                    check_page(browser, origin, route, tag, width, height, args, out, report, ignored)
                    counts.append(f"{tag}:{len(report['errors']) - before}")
                c = next((x for x in report["contrast"] if x["route"] == route), None)
                ctext = f"  contrast min {c['worst']} over {c['checked']}" if c else ""
                print(f"[{i:>2}/{len(routes)}] {route:<44} errors {' '.join(counts)}{ctext}")
        finally:
            browser.close()


def serve_and_check(serve_dir, routes, args, out, report, ignored):
    port = free_port()
    origin = f"http://127.0.0.1:{port}"
    with open(out / "server.log", "w", encoding="utf-8") as log:
        proc = subprocess.Popen(
            [sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1", "--directory", str(serve_dir)],
            stdout=log, stderr=subprocess.STDOUT,
        )
        try:  # opened immediately: nothing may run between Popen and the guard that stops it
            print(f"server: PID {proc.pid} serving {serve_dir} at {origin}/ (log: {out / 'server.log'})")
            wait_until_answers(proc, origin + "/")
            run_browser(origin, routes, args, out, report, ignored)
        finally:
            stop_server(proc)


# --------------------------------------------------------------------------- report


def finish(report, args):
    if report["errors"]:
        report["failures"].append(f"{len(report['errors'])} page error(s), listed under errors")
    if report["contrast_failures"]:
        report["failures"].append(f"contrast: {len(report['contrast_failures'])} text run(s) below "
                                  f"{CONTRAST_MIN}:1, listed under contrast_failures")
    if args.min_fps is not None:
        desktop = [r for r in report["fps"] if r["viewport"] == "d"]
        if not desktop:
            report["failures"].append("fps: --min-fps given but no desktop fps was measured")
        for r in desktop:
            if r["fps"] < args.min_fps:
                report["failures"].append(
                    f"fps: desktop {r['fps']} < --min-fps {args.min_fps:g} at fraction {r['fraction']:g}")
    report["passed"] = not report["failures"]


def print_summary(report, out, ignored, self_test):
    sizes = {tag: f"{w}x{h}" for tag, w, h in VIEWPORTS}
    print("\n---- check3d summary ----")
    print(f"GPU:         {report['gpu'] or 'WebGL unavailable'}")
    mode = report["mode"]
    print(f"Mode:        reduced_motion={mode['reduced_motion']} no_webgl={mode['no_webgl']}")
    print(f"Routes:      {len(report['routes'])} checked at "
          + " and ".join(f"{tag} {sizes[tag]}" for tag in sizes))
    print(f"Screenshots: {len(report['screenshots'])} in {out}")
    for r in report["fps"]:
        print(f"FPS:         {r['viewport']} {sizes[r['viewport']]} at fraction {r['fraction']:g}: {r['fps']}")
    print(f"Errors:      {len(report['errors'])} "
          f"({sum(ignored.values())} Next prefetch __next.*.txt 404s ignored)")
    for e in report["errors"][:20]:
        print(f"  {e['route']} [{e['viewport']}] {e['kind']}: {e['text']}")
    if len(report["errors"]) > 20:
        print(f"  ... and {len(report['errors']) - 20} more in summary.json")
    if report["mode"]["contrast"]:
        bad = report["contrast_failures"]
        print(f"Contrast:    {sum(c['checked'] for c in report['contrast'])} text runs on "
              f"{len(report['contrast'])} routes, {len(bad)} below {CONTRAST_MIN}:1 -> {'FAIL' if bad else 'PASS'}")
        for c in bad[:30]:
            print(f"  {c['route']} {c['ratio']}:1  {c['selector']}  \"{c['text']}\"")
        if len(bad) > 30:
            print(f"  ... and {len(bad) - 30} more in summary.json")
    for f in report["failures"]:
        print(f"FAILURE:     {f}")
    note = " (expected in --self-test: the fixture's /bad/ page is broken on purpose)" if self_test and not report["passed"] else ""
    print(f"Result:      {'PASS' if report['passed'] else 'FAIL'}{note}")


def self_test_verdict(report, ignored):
    """The four fixture expectations. Returns True only if all hold."""
    def errors(route, tag):
        return [e for e in report["errors"] if e["route"] == route and e["viewport"] == tag]

    tags = [tag for tag, _, _ in VIEWPORTS]
    checks = []

    detail = {t: len(errors("/", t)) for t in tags}
    checks.append((all(n == 0 for n in detail.values()) and "/" in report["routes"],
                   f"/ is clean: errors {detail}"))

    ok, detail = "/bad/" in report["routes"], {}
    for t in tags:
        errs = errors("/bad/", t)
        pageerrors = [e for e in errs if e["kind"] == "pageerror"]
        missing_404 = [e for e in errs if e["kind"] == "http" and e["text"] == "404 /missing.css"]
        other = len(errs) - len(pageerrors) - len(missing_404)
        detail[t] = f"pageerror x{len(pageerrors)}, 404 /missing.css x{len(missing_404)}, other x{other}"
        ok = ok and bool(pageerrors) and bool(missing_404) and other == 0
    ok = ok and not report["passed"]
    checks.append((ok, f"/bad/ reports a pageerror AND a 404, and the run is failed by them: {detail}, "
                       f"run passed={report['passed']}"))

    detail = {t: f"errors x{len(errors('/prefetch/', t))}, ignored x{ignored.get(('/prefetch/', t), 0)}"
              for t in tags}
    ok = "/prefetch/" in report["routes"] and all(
        not errors("/prefetch/", t) and ignored.get(("/prefetch/", t), 0) >= 1 for t in tags)
    checks.append((ok, f"/prefetch/ reports nothing (its __next.*.txt 404 was seen and ignored): {detail}"))

    detail = {t: [e["text"] for e in errors("/netfail/", t) if e["kind"] == "request"] for t in tags}
    ok = "/netfail/" in report["routes"] and all(
        any("unreachable.js" in x for x in detail[t]) for t in tags)
    checks.append((ok, f"/netfail/ reports the request that got no response: {detail}"))

    print("\n---- self-test ----")
    for ok, text in checks:
        print(f"{'PASS' if ok else 'FAIL'}  {text}")
    passed = all(ok for ok, _ in checks)
    print(f"SELF-TEST {'PASS' if passed else 'FAIL'}")
    return passed


# --------------------------------------------------------------------------- main


def main():
    sys.stdout.reconfigure(line_buffering=True, errors="backslashreplace")
    args = parse_args()
    if args.out:
        out = Path(args.out).resolve()
    else:
        out = ROOT / ".superpowers" / "check3d" / datetime.now().strftime("%Y%m%d-%H%M%S")
    out.mkdir(parents=True, exist_ok=True)

    report = {
        "gpu": None,
        "mode": {"reduced_motion": args.reduced_motion, "no_webgl": args.no_webgl,
                 "contrast": args.contrast and not args.self_test},
        "routes": [],
        "screenshots": [],
        "fps": [],
        "errors": [],
        "contrast": [],
        "contrast_failures": [],
        "failures": [],
        "passed": False,
    }
    ignored = {}  # (route, viewport) -> count of excluded prefetch 404s
    serve_dir = FIXTURE_DIR if args.self_test else OUT_DIR

    try:
        failure = None
        if not args.self_test:
            if not args.no_build:
                failure = build()
            failure = failure or check_root_build()
        if failure:
            report["failures"].append(failure)
        else:
            routes = discover_routes(serve_dir)
            if args.routes == "home" and not args.self_test:
                routes = [r for r in routes if r == "/"]
            if not routes:
                report["failures"].append(f"routes: no routes found under {serve_dir}")
            else:
                report["routes"] = routes
                serve_and_check(serve_dir, routes, args, out, report, ignored)
    except Exception as exc:
        traceback.print_exc()
        report["failures"].append(f"harness: {type(exc).__name__}: {exc}".splitlines()[0])

    finish(report, args)
    (out / "summary.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print_summary(report, out, ignored, args.self_test)
    if args.self_test:
        return 0 if self_test_verdict(report, ignored) else 1
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
