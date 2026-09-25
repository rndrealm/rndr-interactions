const REFERENCE_FPS = 60;
const MAX_FRAME_DELTA = 100;

/**
 * Frame-rate independent lerp factor.
 *
 * A fixed per-frame ease converges twice as fast on a 120hz screen as on a
 * 60hz one, so scale it by how much time actually elapsed. `ease` keeps its
 * original meaning: the value that produced this feel at 60fps.
 *
 * `deltaMs` is milliseconds — r3f's useFrame hands out seconds, so multiply
 * that by 1000 at the call site.
 */
export function lerpFactor(ease: number, deltaMs: number) {
  const frames = Math.min(deltaMs, MAX_FRAME_DELTA) / (1000 / REFERENCE_FPS);

  return 1 - Math.pow(1 - ease, frames);
}
