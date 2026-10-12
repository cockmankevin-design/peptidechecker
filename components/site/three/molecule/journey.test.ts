import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { STOPS, cameraAt, ease, stepProgress } from "./journey";

// The approved prototype is the source of truth. Read it at test time so a change on either side fails here.
const PROTOTYPE = join(import.meta.dir, "../../../../docs/superpowers/specs/assets/2026-10-09-molecule-prototype-b.html");
const html = readFileSync(PROTOTYPE, "utf8");
const evalJs = (src: string) => new Function(`return (${src});`)();
const extract = (re: RegExp) => {
  const m = html.match(re);
  if (!m) throw new Error(`not found in the prototype: ${re}`);
  return m[1];
};

describe("drift guard against the prototype", () => {
  test("STOPS deep-equals the prototype's `const stops=[...]` literal", () => {
    expect(STOPS).toEqual(evalJs(extract(/const stops=(\[[^;]*\]);/)));
  });

  test("ease matches the prototype's `ease` expression at 1001 points", () => {
    const protoEase = evalJs(extract(/ease=(t=>[^;]+);/)) as (t: number) => number;
    for (let k = 0; k <= 1000; k++) expect(ease(k / 1000)).toBe(protoEase(k / 1000));
  });

  test("stepProgress uses the prototype's smoothing factor", () => {
    expect(Number(extract(/prog\+=\(target-prog\)\*([.\d]+);/))).toBe(.06);
  });
});

describe("cameraAt", () => {
  test("lands exactly on each stop at fractions 0, .25, .5, .75 and 1", () => {
    [0, .25, .5, .75, 1].forEach((f, i) => {
      expect(cameraAt(f)).toEqual({ pos: [...STOPS[i][0]], look: [...STOPS[i][1]] });
    });
  });

  test("at .125 it is the eased midpoint of stops 1 and 2", () => {
    // .125 * 4 segments = 0.5 into segment 0; ease(.5) = 1 - (-2*.5 + 2)^3 / 2 = .5, so the plain midpoint:
    // pos ((0 + -9) / 2, (1.5 + .6) / 2, (24 + 4.6) / 2) = (-4.5, 1.05, 14.3); look ((0 + -9.5) / 2, 0, 0) = (-4.75, 0, 0).
    expect(ease(.5)).toBe(.5);
    const { pos, look } = cameraAt(.125);
    [-4.5, 1.05, 14.3].forEach((v, c) => expect(pos[c]).toBeCloseTo(v, 12));
    [-4.75, 0, 0].forEach((v, c) => expect(look[c]).toBeCloseTo(v, 12));
  });

  test("reuses `out` when given one", () => {
    const out = { pos: [0, 0, 0] as [number, number, number], look: [0, 0, 0] as [number, number, number] };
    expect(cameraAt(.5, out)).toBe(out);
    expect(out.pos).toEqual([2, 3.5, 11]);
  });
});

describe("stepProgress", () => {
  test("matches prog + (target - prog) * .06", () => {
    for (const [prog, target] of [[0, 1], [1, 0], [.3, .7], [.25, .25], [.9, .1]]) {
      expect(stepProgress(prog, target)).toBe(prog + (target - prog) * .06);
    }
  });
});
