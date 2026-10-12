#!/usr/bin/env python3
"""check3d.py - the verification gate for the PeptideChecker 3D rework.

Builds the static export, serves out/ on a private local port, drives Chromium on
the real GPU, screenshots every route at a desktop and a mobile viewport, steps
the homepage through its scroll stops, measures homepage fps, and fails on any
uncaught page error, console error or HTTP response >= 400.

    py -3 scripts/check3d.py [--no-build] [--routes all|home] [--out DIR] [--min-fps N]
                             [--fps-at 0,0.25] [--stops 0,0.25,0.5,0.75,1]
                             [--reduced-motion] [--no-webgl] [--self-test]

Exit 0 = pass, 1 = fail. Results land in --out (default
.superpowers/check3d/<YYYYmmdd-HHMMSS>/): screenshots plus summary.json.

--self-test runs the same pipeline against scripts/check3d_fixture/ and proves
the gate catches a broken page while ignoring Next's harmless prefetch 404s.

The local server is stopped through its own Popen handle only. Never kill
processes by name here: a previous agent did and took down unrelated services.
"""

import argparse
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
                print(f"[{i:>2}/{len(routes)}] {route:<44} errors {' '.join(counts)}")
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
    sys.stdout.reconfigure(line_buffering=True)
    args = parse_args()
    if args.out:
        out = Path(args.out).resolve()
    else:
        out = ROOT / ".superpowers" / "check3d" / datetime.now().strftime("%Y%m%d-%H%M%S")
    out.mkdir(parents=True, exist_ok=True)

    report = {
        "gpu": None,
        "mode": {"reduced_motion": args.reduced_motion, "no_webgl": args.no_webgl},
        "routes": [],
        "screenshots": [],
        "fps": [],
        "errors": [],
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
