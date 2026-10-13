/* When the molecule gives way to the still image on a slow device (spec §5, "governor floor").

   MoleculeCanvas samples the engine's stats() once a second. The governor first drops supersampling to level 0, then
   steps the pixel ratio down to 1; past that it has nothing left to give. If the frame rate stays under FLOOR_FPS for
   FLOOR_SECONDS samples in a row with the governor at that floor, the device cannot carry the scene. Pure, so it is
   unit-tested without a GPU. */

export const FLOOR_FPS = 30;
export const FLOOR_SECONDS = 5;

export interface FpsSample {
  fps: number;
  level: number;
  pixelRatio: number;
}

/** The governor has stepped down as far as it goes: no supersampling and a pixel ratio of 1. */
export function atFloor(s: FpsSample): boolean {
  return s.level === 0 && s.pixelRatio <= 1;
}

/** True when each of the last FLOOR_SECONDS once-a-second samples is at the floor and under FLOOR_FPS. */
export function shouldFallBack(samples: readonly FpsSample[]): boolean {
  if (samples.length < FLOOR_SECONDS) return false;
  return samples.slice(-FLOOR_SECONDS).every((s) => atFloor(s) && s.fps < FLOOR_FPS);
}
