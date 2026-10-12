import { describe, expect, test } from "bun:test";
import { Governor, LEVELS } from "./governor";

// Feeds `frames` frames `dt` ms apart, starting at `start`. Returns the frame indices at which the level or the
// pixel ratio stepped down, and the governor's `govern` return values for them.
function run(g: Governor, start: number, dt: number, frames: number, moving = false) {
  const levelSteps: number[] = [], prSteps: number[] = [], resized: number[] = [];
  for (let k = 0; k < frames; k++) {
    const level = g.level, pr = g.pixelRatio;
    if (g.govern(start + k * dt, moving)) resized.push(k);
    if (g.level !== level) levelSteps.push(k);
    if (g.pixelRatio !== pr) prSteps.push(k);
  }
  return { levelSteps, prSteps, resized };
}

// Frames start right at the end of the 1.5 s boot window (bootT = 0). Frame 0 has no previous frame, so its dt is the
// prototype's 16.7 default. At a steady 25 ms (40 fps) the EMA (alpha .08, from 16.7) passes 18.2 on frame 3:
// 16.7 -> 17.364 -> 17.975 -> 18.537. From then each frame adds 25 ms to `slow`, and the level drops once slow > 500,
// i.e. on the 21st slow frame: frame 3 + 20 = 23. That resets the EMA, so the next drop is 23 frames later, at 46.
// At level 0 the pixel ratio steps instead, once slow > 1500 (the 61st slow frame): 46 + 3 + 60 = 109, then every 63.
const BOOT_END = 1500;

describe("Governor", () => {
  test("starts at level 2 (4x supersampling) on desktop and level 0 (none) on small screens", () => {
    expect(new Governor({ small: false, pixelRatio: 2, now: 0 }).level).toBe(2);
    expect(new Governor({ small: true, pixelRatio: 1.5, now: 0 }).level).toBe(0);
    expect(LEVELS).toEqual([1, 2, 4]);
  });

  test("never supersamples while the camera moves", () => {
    for (const small of [false, true]) {
      const g = new Governor({ small, pixelRatio: 1, now: 0 });
      expect(g.samples(true)).toBe(1);
      expect(g.samples(false)).toBe(LEVELS[g.level]);
    }
  });

  test("steps the level down under sustained slow frames, at the prototype's thresholds", () => {
    const g = new Governor({ small: false, pixelRatio: 2, now: 0 });
    const r = run(g, BOOT_END, 25, 109);
    expect(r.levelSteps).toEqual([23, 46]);
    expect(g.level).toBe(0);
    expect(r.prSteps).toEqual([]); // the level goes first
    expect(g.samples(false)).toBe(1);
  });

  test("then steps the pixel ratio down by .25 at level 0, to a floor of 1, asking for a resize each time", () => {
    const g = new Governor({ small: false, pixelRatio: 2, now: 0 });
    const r = run(g, BOOT_END, 25, 400);
    expect(r.levelSteps).toEqual([23, 46]);
    expect(r.prSteps).toEqual([109, 172, 235, 298]);
    expect(r.resized).toEqual(r.prSteps);
    expect(g.pixelRatio).toBe(1);
  });

  test("steps the pixel ratio only at level 0, never while a supersample level is left", () => {
    const g = new Governor({ small: false, pixelRatio: 2, now: 0 });
    const r = run(g, BOOT_END, 25, 400, true); // moving: the level cannot drop, so neither may the pixel ratio
    expect(r.levelSteps).toEqual([]);
    expect(r.prSteps).toEqual([]);
    expect(g.level).toBe(2);
    expect(g.pixelRatio).toBe(2);
  });

  test("a small screen starts at level 0, so its pixel ratio steps first", () => {
    const g = new Governor({ small: true, pixelRatio: 1.5, now: 0 });
    const r = run(g, BOOT_END, 25, 200);
    expect(r.levelSteps).toEqual([]);
    expect(r.prSteps).toEqual([63, 126]); // 3 + 60, then every 63
    expect(g.pixelRatio).toBe(1);
  });

  test("holds at ~55 fps and above: an 18 ms frame time never steps down", () => {
    const g = new Governor({ small: false, pixelRatio: 2, now: 0 });
    const r = run(g, BOOT_END, 18, 2000);
    expect(r.levelSteps).toEqual([]);
    expect(g.level).toBe(2);
    expect(g.fps).toBeGreaterThan(54.9);
  });

  test("ignores the first 1.5 s and any hitch over 250 ms", () => {
    const g = new Governor({ small: false, pixelRatio: 2, now: 0 });
    run(g, 0, 50, 30); // 20 fps, but inside the boot window (0..1450 ms)
    expect(g.ema).toBe(16.7);
    expect(g.slow).toBe(0);
    g.govern(5000, false); // a 3.5 s gap: a hitch, not a frame time
    expect(g.ema).toBe(16.7);
    expect(g.level).toBe(2);
  });
});
