"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { createMoleculeEngine, type MoleculeEngine, type MoleculeMode } from "./molecule/engine";

/* The one WebGL canvas behind the whole site. The engine is created once on mount and survives route changes:
   navigation only switches its mode (journey on the homepage, ambient elsewhere). All per-frame work lives in the
   engine's own RAF loop; this component holds no React state that changes on scroll, so scrolling never re-renders. */

function modeFor(path: string | null): MoleculeMode {
  return path === "/" ? "journey" : "ambient";
}

function scrollFraction() {
  const max = document.documentElement.scrollHeight - innerHeight;
  return max > 0 ? scrollY / max : 0;
}

// three.js logs a console error before it throws when no context can be made; probe first so a no-WebGL visitor
// gets a silent dark background instead.
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
  const [failed, setFailed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Publish the footer's height so the homepage's last stop can share its viewport with it (StopSection `last`).
    const footer = document.getElementById("site-footer");
    const footerObs = new ResizeObserver(() =>
      document.documentElement.style.setProperty("--footer-h", `${footer?.offsetHeight ?? 0}px`));
    if (footer) footerObs.observe(footer);

    const canvas = canvasRef.current;
    if (!canvas || !hasWebGL()) { setFailed(true); return () => footerObs.disconnect(); }
    let engine: MoleculeEngine;
    try {
      engine = createMoleculeEngine(canvas, {
        small: innerWidth < 760,
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
        width: innerWidth,
        height: innerHeight,
        devicePixelRatio: devicePixelRatio,
      });
    } catch {
      setFailed(true);
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
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onPointer);
      removeEventListener("resize", onResize);
      footerObs.disconnect();
      engineRef.current = null;
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setMode(modeFor(pathname));
    engine.setScrollTarget(scrollFraction());
  }, [pathname]);

  if (failed) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 0, pointerEvents: "none", display: "block" }}
    />
  );
}
