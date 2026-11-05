export type Point = { x: number; y: number };

// ?VelocityTracker works out how fast the pointer is moving at the moment you let go, in pixels per second. That release speed drives the momentum, projection and spring handoff in the other demos.

// ?The browser doesn't give you a velocity, only a stream of positions from pointermove events. The tracker turns recent positions into a speed.

export class VelocityTracker {
  private samples: { t: number; x: number; y: number }[] = [];

  reset() {
    this.samples = [];
  }

  // ?Only the last 100ms of movement is kept. Earlier movement doesn't matter: if you dragged slowly and then flicked, you want the flick's speed, not the average of the whole drag.
  add(x: number, y: number) {
    const t = performance.now();
    this.samples.push({ t, x, y });
    this.samples = this.samples.filter((s) => t - s.t < 100);
  }

  get(): Point {
    const now = performance.now();
    const recent = this.samples.filter((s) => now - s.t < 100);
    if (recent.length < 2) return { x: 0, y: 0 };
    const first = recent[0];
    const last = recent[recent.length - 1];
    const dt = (last.t - first.t) / 1000;
    if (dt === 0) return { x: 0, y: 0 };
    return { x: (last.x - first.x) / dt, y: (last.y - first.y) / dt };
  }
}

const RUBBER_BAND_C = 0.55;

export const rubberBand = (x: number, d: number, c = RUBBER_BAND_C) =>
  (1 - 1 / ((c * x) / d + 1)) * d;

export const rubberBandInverse = (
  offset: number,
  d: number,
  c = RUBBER_BAND_C,
) => (offset >= d ? Infinity : (offset * d) / (c * (d - offset)));

export const applyRubberBand = (
  value: number,
  min: number,
  max: number,
  d: number,
  c = RUBBER_BAND_C,
) => {
  if (value < min) return min - rubberBand(min - value, d, c);
  if (value > max) return max + rubberBand(value - max, d, c);
  return value;
};

export const springFromResponse = (
  response: number,
  dampingRatio: number,
  mass = 1,
) => ({
  type: "spring" as const,
  stiffness: Math.pow((2 * Math.PI) / response, 2) * mass,
  damping: (4 * Math.PI * dampingRatio * mass) / response,
  mass,
});

export type Spring = ReturnType<typeof springFromResponse>;

// The same spring with no overshoot: damping raised to critical (2√(k·m)).
// Keeps the response and the velocity handoff, loses only the bounce.
export const noBounce = (spring: Spring): Spring => ({
  ...spring,
  damping: Math.max(
    spring.damping,
    2 * Math.sqrt(spring.stiffness * spring.mass),
  ),
});

// Reduced motion's stand-in for a big movement: a short fade in place
export const FADE = { duration: 0.2, ease: "easeOut" } as const;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const DECELERATION = { normal: 0.998, fast: 0.99 };

export const project = (velocity: number, rate = DECELERATION.normal) =>
  ((velocity / 1000) * rate) / (1 - rate);

export const nearestPoint = (point: Point, points: Point[]) => {
  const distance = (p: Point) => Math.hypot(p.x - point.x, p.y - point.y);
  return points.reduce((best, p) => (distance(p) < distance(best) ? p : best));
};

export const stretch = (delta: number, d: number) =>
  Math.sign(delta) * rubberBand(Math.abs(delta), d);

export const nearest = (value: number, points: number[]) =>
  points.reduce((best, p) =>
    Math.abs(p - value) < Math.abs(best - value) ? p : best,
  );
