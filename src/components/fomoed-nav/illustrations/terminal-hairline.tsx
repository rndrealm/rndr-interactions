import React, { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { C } from "./shared";

/**
 * Trading Terminal in the Hairline look: nine round candles over a long tray,
 * drawn as outlines in the 2:1 isometric view, solids filled with the slot's
 * own colour. The session "prints" as the entrance: every candle starts as a
 * stub on the tray and rises to its prices, left to right. The latest candle
 * holds the one bright edge.
 *
 * The row runs straight across the screen and heights run straight up, so
 * each candle is just a cylinder: two sides, a back arc on top, a front arc
 * underneath, and its top face's ellipse as the crease.
 */

/** [open, close, high, low] as canvas y in the flat Terminal, lower is dearer. */
const SRC = [
  [180, 165, 158, 188], [165, 172, 160, 178], [172, 150, 144, 176],
  [150, 156, 142, 162], [156, 134, 128, 160], [134, 140, 126, 146],
  [140, 118, 110, 144], [118, 124, 112, 130], [124, 100, 94, 128],
];
/** The flat version's 1.2× stretch, then canvas y to height above the tray. */
const Z = (y: number) => (206 - (141 + (y - 141) * 1.2)) * 0.95;

const N = SRC.length;
/** Where the tray's top face is centred: candles stand on this line. */
const GROUND = 196;
const GAP = 21;
const X0 = 120 - ((N - 1) / 2) * GAP;
/** A candle's radius; the 2:1 view halves it in depth. */
const RX = 7;
const RY = RX / 2;
/** The crease sits this far inside the top's edge. */
const CB = 1.5;
/** A candle not yet printed: a flat disc on the tray. */
const STUB = 2.5;

const TRAY = { x0: 18, x1: 222, top: GROUND - 9, face: GROUND + 9, depth: 6, rx: 10 };

/** Hairline's lift curve and timing: a 700ms ease-out, staggered along the row. */
const LIFT = [0.32, 0.72, 0, 1] as const;
const DURATION = 0.7;
const STAGGER = 0.05;

const y = (z: number) => GROUND - z;

function cylinder(cx: number, zBottom: number, zTop: number) {
  const t = y(zTop), b = y(zBottom);
  return (
    `M${cx - RX} ${t} L${cx - RX} ${b} A${RX} ${RY} 0 0 0 ${cx + RX} ${b}` +
    ` L${cx + RX} ${t} A${RX} ${RY} 0 0 0 ${cx - RX} ${t}Z`
  );
}

function ellipse(cx: number, cy: number, rx: number, ry: number) {
  return `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
}

/** The tray's silhouette: its top face, extruded down by its depth. */
function traySilhouette() {
  const { x0, x1, top, face, depth, rx } = TRAY, ry = rx / 2, bottom = face + depth;
  return (
    `M${x0 + rx} ${top} L${x1 - rx} ${top} A${rx} ${ry} 0 0 1 ${x1} ${top + ry}` +
    ` L${x1} ${bottom - ry} A${rx} ${ry} 0 0 1 ${x1 - rx} ${bottom}` +
    ` L${x0 + rx} ${bottom} A${rx} ${ry} 0 0 1 ${x0} ${bottom - ry}` +
    ` L${x0} ${top + ry} A${rx} ${ry} 0 0 1 ${x0 + rx} ${top}Z`
  );
}

/** The crease: the front edge of the tray's top face. */
function trayCrease() {
  const { x0, x1, face, rx } = TRAY, ry = rx / 2;
  return `M${x0} ${face - ry} A${rx} ${ry} 0 0 0 ${x0 + rx} ${face} L${x1 - rx} ${face} A${rx} ${ry} 0 0 0 ${x1} ${face - ry}`;
}

interface ICandle {
  index: number;
  candle: number[];
  bright: boolean;
}

function Candle({ index, candle, bright }: ICandle) {
  const [open, close, high, low] = candle;
  const cx = X0 + index * GAP;
  const b0 = Z(Math.max(open, close)), b1 = Z(Math.min(open, close));

  /** How printed it is: 0 is a stub on the tray, 1 stands at its prices. */
  const p = useMotionValue(0);
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  const z0 = useTransform(p, (k) => lerp(0, b0, k));
  const z1 = useTransform(p, (k) => Math.max(lerp(0, b0, k) + 1, lerp(STUB, b1, k)));

  const body = useTransform([z0, z1], ([a, b]: number[]) => cylinder(cx, a, b));
  const crease = useTransform(z1, (z) => ellipse(cx, y(z), RX - CB, RY - CB / 2));
  const wick = useTransform(p, (k) => `M${cx} ${y(lerp(0, Z(low), k))} L${cx} ${y(lerp(STUB, Z(high), k))}`);

  useEffect(() => {
    const controls = animate(p, 1, { duration: DURATION, delay: index * STAGGER, ease: LIFT });
    return () => controls.stop();
  }, [p, index]);

  const edge = bright ? C.ink : C.muted;

  // The wick first, so the body covers its middle.
  return (
    <g>
      <motion.path d={wick} fill="none" stroke={edge} strokeLinecap="round" />
      <motion.path d={body} fill={C.plate} stroke={edge} strokeLinejoin="round" />
      <motion.path d={crease} fill="none" stroke={C.line} />
    </g>
  );
}

export function TerminalHairline() {
  return (
    <g strokeWidth={1}>
      <path d={traySilhouette()} fill={C.plate} stroke={C.muted} />
      <path d={trayCrease()} fill="none" stroke={C.line} />
      {SRC.map((candle, i) => (
        <Candle key={i} index={i} candle={candle} bright={i === N - 1} />
      ))}
    </g>
  );
}
