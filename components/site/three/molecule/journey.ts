// Camera journey, ported verbatim from the B · Cinema prototype
// (docs/superpowers/specs/assets/2026-10-09-molecule-prototype-b.html, `stops`, `ease` and `tick`).
// Pure: no THREE import, so it is unit-testable in Bun.

export type Vec3 = [number, number, number];
/** One camera stop: [camera position, look-at point]. */
export type Stop = readonly [Readonly<Vec3>, Readonly<Vec3>];

/** The prototype's `stops`, copied exactly. journey.test.ts re-reads the prototype to guard against drift. */
export const STOPS: readonly Stop[] = [
  [[0, 1.5, 24], [0, 0, 0]],
  [[-9, .6, 4.6], [-9.5, 0, 0]],
  [[2, 3.5, 11], [2, 0, 0]],
  [[9.5, 1.5, 8], [9, -.5, 0]],
  [[0, 5, 34], [0, 0, 0]],
];

/** The prototype's cubic in-out easing. */
export const ease = (t: number): number => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** One frame of scroll smoothing: the prototype's `prog += (target - prog) * .06`. */
export const stepProgress = (prog: number, target: number): number => prog + (target - prog) * .06;

export interface CameraPose {
  pos: Vec3;
  look: Vec3;
}

/**
 * Camera pose at journey progress `f` (0..1), the segment interpolation in the prototype's `tick`:
 * `f*(stops-1)` picks the segment, `ease` shapes it, and both ends are lerped the way THREE's
 * `Vector3.lerpVectors` does (`a + (b - a) * k`). Mouse parallax is applied by the engine on top.
 * Pass `out` to reuse an object every frame.
 */
export function cameraAt(f: number, out: CameraPose = { pos: [0, 0, 0], look: [0, 0, 0] }): CameraPose {
  const s = f * (STOPS.length - 1);
  const i = Math.min(Math.floor(s), STOPS.length - 2);
  const k = ease(s - i);
  const [p0, l0] = STOPS[i];
  const [p1, l1] = STOPS[i + 1];
  for (let c = 0; c < 3; c++) {
    out.pos[c] = p0[c] + (p1[c] - p0[c]) * k;
    out.look[c] = l0[c] + (l1[c] - l0[c]) * k;
  }
  return out;
}
