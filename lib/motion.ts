/* Shared motion vocabulary.

   Every animated component imports from here rather than inventing its own
   timings. Without a single source, a site accumulates six slightly different
   fade-ups and reads as assembled rather than designed.

   Division of labour, per the brief:
   - Motion handles UI: entrances, hover, stagger, expand/collapse.
   - GSAP + ScrollTrigger handles only scroll storytelling that Motion cannot
     express well (pinned sections, scrubbed timelines). It is deliberately NOT
     used for ordinary reveals.

   All transforms here are `y` and `opacity` only. Both are compositor
   properties, so they never trigger layout and hold 60fps on a phone. */

import type { Transition, Variants } from "motion/react";

/** The site's one easing curve, matching --ease-out-quint in globals.css. */
export const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;

/** Used where something should feel physical rather than timed - a chip
    settling, a panel opening. Kept low-bounce; this is a trust site, not a toy. */
export const SPRING: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 0.9,
};

export const DURATION = {
  fast: 0.18,
  base: 0.42,
  slow: 0.72,
} as const;

/** The standard entrance. 14px is deliberately small: a large travel distance
    reads as a slideshow, and at this scale the eye registers arrival rather
    than movement. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT_QUINT },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.slow, ease: EASE_OUT_QUINT } },
};

/** Parent for staggered groups. Children should use `fadeUp`.
    `delayChildren` gives the eye a beat to land on the group before its
    contents start arriving. */
export function stagger(step = 0.06, delayChildren = 0.04): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: step, delayChildren },
    },
  };
}

/** Shared viewport config so sections all trigger at the same point.
    `once` matters: re-animating on every scroll-past is the single most
    common way a site starts feeling cheap. `amount: 0.25` fires when a
    quarter of the element is visible, which suits tall sections. */
export const VIEWPORT = { once: true, amount: 0.25 } as const;

/** Narrower trigger for tall elements that would otherwise never reach 25%. */
export const VIEWPORT_TALL = { once: true, amount: 0.1 } as const;
