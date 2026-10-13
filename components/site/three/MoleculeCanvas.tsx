"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { asset } from "@/lib/basePath";

import { shouldFallBack, type FpsSample } from "./fallback";
import { createMoleculeEngine, type MoleculeEngine, type MoleculeMode } from "./molecule/engine";

/* The one WebGL canvas behind the whole site. The engine is created once on mount and survives route changes:
   navigation only switches its mode (journey on the homepage, ambient elsewhere). All per-frame work lives in the
   engine's own RAF loop; this component holds no React state that changes on scroll, so scrolling never re-renders.
   The still: a pre-rendered stop-1 frame (public/molecule/, captured by `check3d.py --capture-stills`) replaces the
   canvas when there is no WebGL, the engine cannot be created, the context is lost, or the governor is at its floor
   and still under 30 fps (fallback.ts). Reduced motion keeps the engine's own still frame instead. */

function modeFor(path: string | null): MoleculeMode {
  return path === "/" ? "journey" : "ambient";
}

// The journey runs from the top of the page to the top of the last stop section (StopSection `last`), which on
// desktop is the bottom of the page and on phones, where the footer is taller, is just above it.
function scrollFraction() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const last = document.querySelector("[data-stop-last]");
  const end = last ? Math.min(max, last.getBoundingClientRect().top + scrollY) : max;
  return end > 0 ? scrollY / end : 0;
}

// three.js logs a console error before it throws when no context can be made; probe first so a no-WebGL visitor
// gets the still image instead.
function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function MoleculeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<MoleculeEngine | null>(null);
  const [still, setStill] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Publish the footer's height so the homepage's last stop can share its viewport with it (StopSection `last`).
    const footer = document.getElementById("site-footer");
    const footerObs = new ResizeObserver(() =>
      document.documentElement.style.setProperty("--footer-h", `${footer?.offsetHeight ?? 0}px`));
    if (footer) footerObs.observe(footer);

    const canvas = canvasRef.current;
    if (!canvas || !hasWebGL()) { setStill(true); return () => footerObs.disconnect(); }
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let engine: MoleculeEngine;
    try {
      engine = createMoleculeEngine(canvas, {
        small: innerWidth < 760, // decided once at mount; crossing 760px later only resizes (a reload switches mode)
        reducedMotion,
        width: innerWidth,
        height: innerHeight,
        devicePixelRatio: devicePixelRatio,
      });
    } catch {
      setStill(true);
      return () => footerObs.disconnect();
    }
    engineRef.current = engine; // the pathname effect below (declared later, so run later) sets the mode
    engine.setScrollTarget(scrollFraction());
    engine.start();

    const onScroll = () => engine.setScrollTarget(scrollFraction());
    const onPointer = (e: PointerEvent) => engine.setPointer(e.clientX / innerWidth - .5, e.clientY / innerHeight - .5);
    const onResize = () => engine.resize(innerWidth, innerHeight);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onPointer, { passive: true });
    addEventListener("resize", onResize, { passive: true });

    // Polls the governor once a second; reduced motion stops the RAF loop on its still frame, so it is not polled.
    const samples: FpsSample[] = [];
    const poll = reducedMotion ? 0 : window.setInterval(() => {
      const { fps, level, pixelRatio } = engine.stats();
      samples.push({ fps, level, pixelRatio });
      if (samples.length > 10) samples.shift();
      if (shouldFallBack(samples)) fallBack();
    }, 1000);

    let torn = false;
    function teardown() {
      if (torn) return;
      torn = true;
      window.clearInterval(poll);
      canvas!.removeEventListener("webglcontextlost", fallBack);
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onPointer);
      removeEventListener("resize", onResize);
      engineRef.current = null;
      engine.dispose();
    }
    function fallBack() {
      teardown();
      setStill(true);
    }
    canvas.addEventListener("webglcontextlost", fallBack);

    return () => {
      footerObs.disconnect();
      teardown();
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setMode(modeFor(pathname));
    engine.setScrollTarget(scrollFraction());
  }, [pathname]);

  const layer = { position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 0, pointerEvents: "none", display: "block" } as const;
  return (
    <>
      {still ? (
        <picture data-molecule-still="">
          <source media="(max-width: 759px)" srcSet={asset("/molecule/still-390.webp")} />
          {/* eslint-disable-next-line @next/next/no-img-element -- a fixed decorative layer, not a content image */}
          <img src={asset("/molecule/still-1440.webp")} alt="" aria-hidden="true" style={{ ...layer, objectFit: "cover" }} />
        </picture>
      ) : (
        <canvas ref={canvasRef} aria-hidden="true" style={layer} />
      )}
      {/* The ambient veil: off the homepage the molecule stays visible but dimmed, so no inner-page text ever sits
          on the raw 3D. Later in the DOM than the canvas at the same z-index, so it paints above the canvas and
          below <main> (z-[1]). Fully transparent on "/", where the journey is the content. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background: "var(--color-bg)", opacity: modeFor(pathname) === "ambient" ? 0.8 : 0,
        }}
      />
    </>
  );
}
