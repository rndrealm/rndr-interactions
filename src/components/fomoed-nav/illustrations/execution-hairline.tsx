import React, { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { C, appear } from "./shared";
import { box, camera, turn, type Vec3 } from "./iso";

/**
 * Trade Execution in the Hairline look: an order ticket lying on the desk,
 * its details as ruled lines, with a raised button on it. The button presses
 * as the order goes in; a loading arc runs round its top and settles into a
 * tick, which holds the one bright edge.
 *
 * The spinner can't be a screen rotation, as the button's top is seen in
 * perspective. So one path runs three laps of the button's circle and then
 * the tick: the arc travels two laps while loading, then slides on through
 * the third and into the tick, growing to exactly the tick's length.
 */

/** Same desk angle as Paper Trading, so the two read as one set. */
const DESK = -60;
const W = 96;
const H = 120;
const THICK = 2.4;
const R = 7;
const CB = 1.6;

/** The button, in the card's own (u across, v down) units. */
const BTN = { u: 0, v: 30, w: 68, h: 24, r: 7, height: 6 };
const SPIN_R = 5.9;
/** The tick, relative to the button's centre; it starts on the circle's left. */
const TICK = [[-SPIN_R, 0], [-1.7, 4.2], [5.9, -4.2]];
const LAPS = 3;

const ROWS = [-30, -16, -2];

const PRESS_AT = 0.3;
const SPIN = 0.8;
const SETTLE = 0.4;

/** A point on the card's face, turned with it. */
const onFace = (u: number, v: number): [number, number] => turn(u, v, 0, 0, DESK);

const CAM = camera(
  1.6,
  [[-W / 2, -H / 2], [W / 2, -H / 2], [W / 2, H / 2], [-W / 2, H / 2]].map(
    ([u, v]): Vec3 => [...onFace(u, v), 0],
  ),
  120,
  150,
);

const line = (pts: number[][], z: number) => "M" + pts.map(([u, v]) => CAM.P(...onFace(u, v), z).join(" ")).join("L");

const card = box(CAM, [-W / 2, -H / 2, W / 2, H / 2], R, CB, 0, THICK, DESK);
const title = line([[-36, -46], [4, -46]], THICK);
const rows = ROWS.map((v) => line([[-36, v], [-20, v]], THICK) + line([[12, v], [36, v]], THICK)).join("");

/** Three laps of the spinner's circle, clockwise from its left, then the tick. */
const SPINNER = [
  ...Array.from({ length: LAPS * 36 + 1 }, (_, i) => {
    const a = Math.PI + (i * Math.PI * 2) / 36;
    return [BTN.u + SPIN_R * Math.cos(a), BTN.v + SPIN_R * Math.sin(a)];
  }),
  ...TICK.slice(1).map(([u, v]) => [BTN.u + u, BTN.v + v]),
];

/** Fractions of the spinner path, measured on screen, where pathLength works. */
const screenLength = (pts: number[][]) =>
  pts.slice(1).reduce((sum, [u, v], i) => {
    const [x0, y0] = CAM.P(...onFace(pts[i][0], pts[i][1]), 0);
    const [x1, y1] = CAM.P(...onFace(u, v), 0);
    return sum + Math.hypot(x1 - x0, y1 - y0);
  }, 0);
const TOTAL = screenLength(SPINNER);
const LAP = screenLength(SPINNER.slice(0, 37)) / TOTAL;
const ARC = LAP / 4;

export function ExecutionHairline() {
  /** The button's top: it presses as the order goes in, then comes back up. */
  const top = useMotionValue(THICK + BTN.height);

  const button = useTransform(top, (z) =>
    box(
      CAM,
      (() => {
        const [cx, cy] = onFace(BTN.u, BTN.v);
        return [cx - BTN.w / 2, cy - BTN.h / 2, cx + BTN.w / 2, cy + BTN.h / 2];
      })(),
      BTN.r,
      CB,
      THICK,
      z,
      DESK,
    ),
  );
  const buttonSil = useTransform(button, (s) => s.sil);
  const buttonCrease = useTransform(button, (s) => s.crease);
  const spinner = useTransform(top, (z) => line(SPINNER, z));

  useEffect(() => {
    const rest = THICK + BTN.height;
    const controls = animate(top, [rest, THICK + BTN.height * 0.45, rest], {
      duration: 0.5,
      delay: PRESS_AT - 0.05,
      times: [0, 0.3, 1],
      ease: ["easeOut", "easeInOut"],
    });
    return () => controls.stop();
  }, [top]);

  return (
    <motion.g strokeWidth={1} {...appear()}>
      <path d={card.sil} fill={C.plate} stroke={C.muted} strokeLinejoin="round" />
      <path d={card.crease} fill="none" stroke={C.line} strokeLinejoin="round" />
      <path d={title} fill="none" stroke={C.muted} strokeWidth={2.25} strokeLinecap="round" />
      <path d={rows} fill="none" stroke={C.line} strokeWidth={2} strokeLinecap="round" />

      <motion.path d={buttonSil} fill={C.plate} stroke={C.muted} strokeLinejoin="round" />
      <motion.path d={buttonCrease} fill="none" stroke={C.line} strokeLinejoin="round" />

      <motion.path
        d={spinner}
        fill="none"
        stroke={C.ink}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ opacity: 0, pathOffset: 0, pathLength: ARC }}
        animate={{
          opacity: 1,
          pathOffset: [0, (LAPS - 1) * LAP, LAPS * LAP],
          pathLength: [ARC, ARC, 1 - LAPS * LAP],
        }}
        transition={{
          opacity: { duration: 0.01, delay: PRESS_AT },
          default: {
            duration: SPIN + SETTLE,
            delay: PRESS_AT,
            times: [0, SPIN / (SPIN + SETTLE), 1],
            ease: ["linear", "easeOut"],
          },
        }}
      />
    </motion.g>
  );
}
