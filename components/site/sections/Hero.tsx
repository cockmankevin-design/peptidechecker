"use client";

import { Eye, PackageX, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { Container, CTA } from "@/components/site/ui";
import { EASE_OUT_QUINT } from "@/lib/motion";
import { asset } from "@/lib/basePath";

/* Hero.

   Full-bleed scroll-scrubbed vial video, replacing the flat SVG illustration
   and the boxed dark band from the previous (light-theme) design. Kevin's
   brief after approving the Higgs Field video (2026-09-23): the whole site
   goes dark and cohesive with it, and the front page's scroll should be what
   moves the vial - "scroll down and that's what moves the image."

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
          {/* ---------------- background: video / scrubbed canvas ---------------- */}
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

          {/* readability scrim - the video is bright and busy enough (splashing
              water, moving highlights) that copy needs real help sitting on it,
              not just a dark tint */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050a16] via-[#050a16]/75 to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a16] via-[#050a16]/10 to-transparent"
            aria-hidden="true"
          />

          <Container className="relative flex min-h-[100svh] items-center py-32">
            <div className="max-w-xl">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm"
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT_QUINT }}
              >
                Independent COA verification
              </motion.div>

              <motion.h1
                className="mt-6 text-[clamp(2.6rem,6.8vw,4.4rem)] font-semibold leading-[1.03] tracking-[-0.03em] text-white"
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.06, ease: EASE_OUT_QUINT }}
              >
                A list that can afford
                <br />
                to say no.
              </motion.h1>

              <motion.p
                className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-white/80"
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.16, ease: EASE_OUT_QUINT }}
              >
                Every peptide seller publishes a certificate of analysis. Almost none can show it
                belongs to the lot in the bottle. We check that link — and we publish the sellers
                that fail.
              </motion.p>

              <motion.div
                className="mt-9 flex flex-wrap items-center gap-3"
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.24, ease: EASE_OUT_QUINT }}
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
                transition={{ duration: 0.6, delay: 0.32, ease: EASE_OUT_QUINT }}
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

              <motion.p
                className="mt-8 font-mono text-[11.5px] leading-relaxed text-white/50"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                We sell nothing. We run no laboratory. We commission no testing.
              </motion.p>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}
