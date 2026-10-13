import { describe, expect, test } from "bun:test";
import { atFloor, FLOOR_SECONDS, shouldFallBack, type FpsSample } from "./fallback";

const floorSlow: FpsSample = { fps: 20, level: 0, pixelRatio: 1 };
const n = (s: FpsSample, k: number) => Array.from({ length: k }, () => s);

describe("atFloor", () => {
  test("level 0 at pixel ratio 1 is the floor", () => expect(atFloor(floorSlow)).toBe(true));
  test("a supersampling level above 0 is not", () => expect(atFloor({ ...floorSlow, level: 1 })).toBe(false));
  test("a pixel ratio above 1 is not (the governor can still step it down)", () =>
    expect(atFloor({ ...floorSlow, pixelRatio: 1.25 })).toBe(false));
});

describe("shouldFallBack", () => {
  test("five slow seconds at the floor fall back", () => expect(shouldFallBack(n(floorSlow, 5))).toBe(true));
  test("four are not enough", () => expect(shouldFallBack(n(floorSlow, FLOOR_SECONDS - 1))).toBe(false));
  test("no samples, no fallback", () => expect(shouldFallBack([])).toBe(false));
  test("one fast second in the window resets it", () =>
    expect(shouldFallBack([...n(floorSlow, 4), { ...floorSlow, fps: 45 }])).toBe(false));
  test("only the last five count", () =>
    expect(shouldFallBack([{ ...floorSlow, fps: 60 }, ...n(floorSlow, 5)])).toBe(true));
  test("exactly 30 fps is not under 30", () => expect(shouldFallBack(n({ ...floorSlow, fps: 30 }, 5))).toBe(false));
  test("slow but not yet at the lowest level does not fall back", () =>
    expect(shouldFallBack(n({ ...floorSlow, level: 1 }, 10))).toBe(false));
  test("slow at level 0 with pixel ratio still above 1 does not fall back", () =>
    expect(shouldFallBack(n({ ...floorSlow, pixelRatio: 1.5 }, 10))).toBe(false));
  test("reaching the floor mid-run counts only the floor samples", () => {
    const run = [...n({ ...floorSlow, pixelRatio: 1.25 }, 3), ...n(floorSlow, 4)];
    expect(shouldFallBack(run)).toBe(false);
    expect(shouldFallBack([...run, floorSlow])).toBe(true);
  });
});
