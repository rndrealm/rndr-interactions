/**
 * Replay: a candlestick chart, nine round candles on a long tray, each body a
 * solid with its wick as a rod through it. The pointer is the scrub head: the
 * candles up to the one under it stand printed, the ones after sink to flat
 * stubs on the tray, staggered outwards from the pointer on the lift curve. At
 * rest the whole session is printed and the last candle, the latest price,
 * holds the bright edge. The slider is the stagger, in ms.
 *
 * The row runs along x = -y, so it reads left to right across the screen and
 * every candle sits at the same depth: no candle ever covers another.
 */
const {
  Cam, circ, facing, fit, lerp, prism, proj, rrect, seg,
  tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

/** [open, close, high, low] as canvas y in the source drawing, lower is dearer. */
const SRC = [
  [180, 165, 158, 188], [165, 172, 160, 178], [172, 150, 144, 176],
  [150, 156, 142, 162], [156, 134, 128, 160], [134, 140, 126, 146],
  [140, 118, 110, 144], [118, 124, 112, 130], [124, 100, 94, 128],
];
/** The source's own 1.2× stretch, then canvas y to world height. */
const Z = (y) => (206 - (141 + (y - 141) * 1.2)) * 0.7;

const N = SRC.length, STEP = 10, R = 4.6, CB = 1.1, STUB = 1.6;
const TL = ((N - 1) / 2) * STEP * Math.SQRT2 + 13, TW = 11, TR = 8, PB = 4;
const S2 = Math.SQRT1_2;

/** Candle i's place on the ground: the row runs along x = -y. */
const at = (i) => [(i - (N - 1) / 2) * STEP, -(i - (N - 1) / 2) * STEP];
const shift = (ring, dx, dy) => ring.map((q) => ({ ...q, u: q.u + dx, v: q.v + dy }));
/** Turns a ring 45° so its long axis lies along the row. */
const turn = (ring) =>
  ring.map((q) => ({ ...q, u: (q.u + q.v) * S2, v: (q.v - q.u) * S2, nu: (q.nu + q.nv) * S2, nv: (q.nv - q.nu) * S2 }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  const candles = SRC.map(([o, c, h, l], i) => {
    const [cx, cy] = at(i);
    return { cx, cy, b0: Z(Math.max(o, c)), b1: Z(Math.min(o, c)), lo: Z(l), hi: Z(h) };
  });
  const top = Math.max(...candles.map((c) => c.hi));

  const C = Cam(45, 0.5, 2.0);
  const ends = [-TL, TL].flatMap((u) => [-TW, TW].map((v) => [(u + v) * S2, (v - u) * S2, -PB]));
  fit(C, [...ends, [...at(N - 1), top], [...at(0), top]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const tray = turn(rrect(-TL, -TW, TL, TW, TR, 6));
  const trayIn = turn(rrect(-TL + 2.2, -TW + 2.2, TL - 2.2, TW - 2.2, TR - 2.2, 6));
  put(solid(g), prism(P, front, tray, trayIn, -PB, 0));

  // Same depth for every candle, so paint order between them doesn't matter;
  // within one, the wick goes first and the body covers its middle.
  const ring = circ(R, 20), inner = circ(R - CB, 20);
  candles.forEach((cd) => {
    cd.wick = mk("path", { class: "nf" }, g);
    cd.el = solid(g);
    cd.ring = shift(ring, cd.cx, cd.cy);
    cd.inner = shift(inner, cd.cx, cd.cy);
    cd.p = tween(1);
    cd.drawn = NaN;
  });

  /** p is how printed the candle is: 1 stands at its prices, 0 is a stub on the tray. */
  function draw(cd, p) {
    if (p === cd.drawn) return;
    cd.drawn = p;
    const z0 = lerp(0, cd.b0, p), z1 = Math.max(z0 + 0.8, lerp(STUB, cd.b1, p));
    put(cd.el, prism(P, front, cd.ring, cd.inner, z0, z1));
    const lo = lerp(0, cd.lo, p), hi = lerp(STUB, cd.hi, p);
    cd.wick.setAttribute("d", seg(P(cd.cx, cd.cy, lo), P(cd.cx, cd.cy, hi)));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const cd of candles) { draw(cd, tval(cd.p, now)); if (!tdone(cd.p, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // Hit test on the rest pose: the candle whose foot is nearest the pointer's
  // screen x. Feet never move, so a candle sinking can't flip the choice.
  const feet = candles.map((cd) => P(cd.cx, cd.cy, 0)[0]);
  const hit = ([x]) => feet.reduce((best, fx, i) => (Math.abs(fx - x) < Math.abs(feet[best] - x) ? i : best), 0);

  function bright(a) {
    const k = a < 0 ? N - 1 : a;
    candles.forEach((cd, i) => {
      cd.el.sil.classList.toggle("hi", i === k);
      cd.wick.classList.toggle("hi", i === k);
    });
  }

  let act = -1;
  /** Scrubs to candle a (-1 prints the whole session). Spreads out from the scrub point, or the one let go. */
  function scrub(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    candles.forEach((cd, i) => tset(cd.p, a < 0 || i <= a ? 1 : 0, now, Math.abs(i - from) * stag));
    bright(a);
    read.textContent = a < 0 ? "rest" : `candle ${a + 1}`;
    B.wake();
  }

  bright(-1);
  bag.add(pointer(stage, { move: (p) => scrub(hit(p)), leave: () => scrub(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "replay",
  means: "A candlestick chart on a tray: the pointer scrubs the session, and the candles after it sink back to unprinted stubs.",
  rules: [1, 2, 5, 9],
  range: [20, 45, 80],
  tour: [[115, 166], [200, 150], [285, 140], null],
  mount,
});
