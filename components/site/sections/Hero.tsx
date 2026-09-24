"use client";

import { Eye, PackageX, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { Container, CTA } from "@/components/site/ui";
import { EASE_OUT_QUINT } from "@/lib/motion";
import { asset } from "@/lib/basePath";

/* Hero.

   The scroll-scrubbed vial video fills the ENTIRE hero screen, full
   brightness, copy overlaid on top - the animation IS the design here, not
   an illustration next to it. Three corrections to land here (2026-09-23):
   pass one made the video a full-bleed background but darkened it with a
   wide scrim for text legibility, which read as faded; pass two reacted to
   that by boxing the video into a right-side panel, which Kevin then said
   was "still half the page" - he wanted the full screen back, just without
   the fading. This version keeps the full-bleed video from pass one but
   replaces the wide scrim with a single small, localized radial scrim
   sitting only behind the copy block, the same technique already banked in
   the Scroll-Cinema notes for keeping text readable over bright, busy
   footage without darkening the shot itself.

   ARCHITECTURE, matching VerificationScroll.tsx (the only other place this
   site pins a section): GSAP owns the pin and the scroll progress; it never
   touches a node React renders. Unlike VerificationScroll, the per-tick
   update here goes straight to an imperative canvas draw via a ref, not
   React state - 60fps setState churn is fine for toggling a few CSS classes,
   but not for driving a canvas raster inside a React render loop.

   Below 900px (same breakpoint VerificationScroll uses) the pin is dropped
   entirely and mobile plays the source video directly with a plain <video>
   loop - pinned scroll-scrub fights a phone's own scroll handling and address
   bar resize, which is exactly the jank the brief rules out. */

const BADGES = [
  { label: "Four gates checked", icon: ShieldCheck },
  { label: "Zero product sold", icon: PackageX },
  { label: "Every result public", icon: Eye },
] as const;

// Must match public/hero-vial/manifest.json ("frames.target_count").
const FRAME_COUNT = 60;
// Matches manifest.json's "recommended_scroll_height".
const SCROLL_VH = 300;

function framePath(i: number) {
  return asset(`/hero-vial/desktop/frame-${String(i + 1).padStart(4, "0")}.webp`);
}

export default function Hero() {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const drawRef = useRef<(frame: number) => void>(() => {});
  const [firstFrameReady, setFirstFrameReady] = useState(false);

  // Preload frames and set up the imperative draw() the scrub loop calls.
  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    function resize() {
      // Backing store at real pixel size (DPR-capped), CSS size from the
      // parent via Tailwind - a canvas left at its 300x150 default renders
      // blurry, the same bug the scroll-cinema build hit on its capture path.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.parentElement!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw(frame: number) {
      const img = imagesRef.current[frame];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const cw = canvas!.width;
      const ch = canvas!.height;
      // object-fit: cover math, since the viewport's aspect ratio rarely
      // matches the source video's 16:9.
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx!.clearRect(0, 0, cw, ch);
      ctx!.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }
    drawRef.current = draw;

    let cancelled = false;
    let loaded = 0;
    const imgs: HTMLImageElement[] = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = framePath(i);
      img.onload = () => {
        if (cancelled) return;
        loaded += 1;
        if (i === 0) {
          draw(0);
          setFirstFrameReady(true);
        }
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  // Pin the hero and scrub the canvas to scroll position, desktop only.
  useEffect(() => {
    if (reduced || !wrapRef.current) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 900px)", () => {
          ScrollTrigger.create({
            trigger: wrapRef.current!,
            start: "top top",
            end: () => `+=${window.innerHeight * (SCROLL_VH / 100)}`,
            pin: pinRef.current!,
            pinSpacing: true,
            scrub: 0.6,
            onUpdate: (self) => {
              const frame = Math.min(
                FRAME_COUNT - 1,
                Math.round(self.progress * (FRAME_COUNT - 1)),
              );
              drawRef.current(frame);
            },
          });
        });
      }, wrapRef);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className="relative">
      <div ref={pinRef}>
        <section className="relative min-h-[100svh] overflow-hidden bg-[#080f1f]">
          {/* ---------------- the vial: full screen, full brightness ---------------- */}
          <div className="absolute inset-0" aria-hidden="true">
            {reduced ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={framePath(29)} alt="" className="h-full w-full object-cover" />
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  className={`hidden h-full w-full min-[900px]:block transition-opacity duration-500 ${
                    firstFrameReady ? "opacity-100" : "opacity-0"
                  }`}
                />
                <video
                  className="h-full w-full object-cover min-[900px]:hidden"
                  src={asset("/hero-vial/hero-vial.mp4")}
                  poster={asset("/hero-vial/mobile/frame-0001.webp")}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </>
            )}
          </div>

          {/* local scrim, sized to the copy block only - not a wide overlay,
              so the rest of the frame stays at full brightness. Mobile stacks
              the headline, buttons and badges into one tall column, so its
              scrim is a top-down gradient covering that whole column; desktop
              has room to keep it a small radial patch behind just the text. */}
          <div
            className="pointer-events-none absolute inset-0 min-[900px]:hidden"
            style={{
              background:
                "linear-gradient(to bottom, rgba(3, 8, 20, 0.82) 0%, rgba(3, 8, 20, 0.6) 55%, rgba(3, 8, 20, 0.15) 78%, transparent 92%)",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 hidden min-[900px]:block"
            style={{
              background:
                "radial-gradient(60% 55% at 22% 42%, rgba(3, 8, 20, 0.72) 0%, rgba(3, 8, 20, 0.35) 45%, transparent 72%)",
            }}
            aria-hidden="true"
          />

          <Container className="relative flex min-h-[100svh] items-center py-32">
            {/* ---------------- copy ---------------- */}
            <div className="w-full max-w-md">
                <motion.h1
                  className="text-[clamp(2.6rem,6.8vw,4.4rem)] font-semibold leading-[1.03] tracking-[-0.03em] text-white"
                  initial={reduced ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE_OUT_QUINT }}
                >
                  We check what the
                  <br />
                  label can&rsquo;t tell you.
                </motion.h1>

                <motion.p
                  className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-white/80"
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT_QUINT }}
                >
                  Every peptide seller publishes a certificate of analysis. Almost none can show it
                  belongs to the lot in the bottle. We check that link — and we publish the sellers
                  that fail.
                </motion.p>

                <motion.div
                  className="mt-9 flex flex-wrap items-center gap-3"
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.18, ease: EASE_OUT_QUINT }}
                >
                  <CTA href="/vendors">Explore the registry</CTA>
                  {/* Inline style, not the shared CTA "secondary" variant - that
                      variant's classes are tuned for the token-driven page and
                      Tailwind's utility precedence isn't guaranteed to let a
                      passed-in className override them here. */}
                  <Link
                    href="/methodology"
                    className="group inline-flex items-center gap-2 rounded-lg px-5 py-3 text-[15px] font-medium transition-colors duration-200"
                    style={{ border: "1px solid rgba(255,255,255,0.3)", color: "#ffffff" }}
                  >
                    How verification works
                    <svg
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 3l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </motion.div>

                {/* trust badges - real facts, not vendor-style purity/shipping claims */}
                <motion.div
                  className="mt-10 flex flex-wrap gap-3"
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.26, ease: EASE_OUT_QUINT }}
                >
                  {BADGES.map((b) => (
                    <div
                      key={b.label}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2.5 text-[13px] font-medium text-white/90 backdrop-blur-sm"
                    >
                      <b.icon className="h-4 w-4 text-[#78c0ff]" aria-hidden="true" />
                      {b.label}
                    </div>
                  ))}
                </motion.div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}
