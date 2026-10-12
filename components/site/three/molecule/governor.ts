// Quality governor, ported line for line from the B · Cinema prototype's `govern(now, moving)`.
// Supersample only when the camera has settled; step the supersample level down, then the pixel ratio,
// when this machine cannot hold ~55 fps. The prototype's `?ssaa` forcing switch is removed.
// Pure: time is injected (`now` in ms, the requestAnimationFrame timebase); nothing here reads a clock.

/** Supersamples per frame at each level: the prototype's `LEVELS`. */
export const LEVELS = [1, 2, 4] as const;

export class Governor {
  /** Index into LEVELS. Desktop starts at 2 (4x supersampling), small screens at 0 (none). */
  level: number;
  pixelRatio: number;
  /** Smoothed frame time in ms. */
  ema = 16.7;
  /** Accumulated ms spent above the slow threshold. */
  slow = 0;
  private lastNow = 0;
  private readonly bootT: number;

  constructor(opts: { small: boolean; pixelRatio: number; now: number }) {
    this.level = opts.small ? 0 : 2;
    this.pixelRatio = opts.pixelRatio;
    this.bootT = opts.now;
  }

  /** Call once per frame. Returns true when the pixel ratio stepped down, so the caller must resize. */
  govern(now: number, moving: boolean): boolean {
    const dt = this.lastNow ? now - this.lastNow : 16.7;
    this.lastNow = now;
    if (dt > 250 || now - this.bootT < 1500) return false; // ignore shader-compile / asset-load hitches
    this.ema += (dt - this.ema) * .08;
    if (this.ema > 18.2) {
      this.slow += dt;
      if (!moving && this.level > 0 && this.slow > 500) {
        this.level--;
        this.slow = 0;
        this.ema = 16.7;
      } else if (this.level === 0 && this.slow > 1500 && this.pixelRatio > 1) {
        this.pixelRatio = Math.max(1, this.pixelRatio - .25);
        this.slow = 0;
        this.ema = 16.7;
        return true;
      }
    } else this.slow = 0;
    return false;
  }

  /** Renders to average this frame: none while the camera moves, else the current level's count. */
  samples(moving: boolean): number {
    return moving ? 1 : LEVELS[this.level];
  }

  /** Frame rate implied by the smoothed frame time. */
  get fps(): number {
    return 1000 / this.ema;
  }
}
