import React, { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { C, EASE } from "./shared";
import { box, camera, turn, type Vec3 } from "./iso";

/**
 * Paper Trading in the Hairline look: a stack of three thin sheets lying on
 * the desk, the two underneath fanned out. The top sheet carries a header and
 * a rising chart, drawn on its face; the chart holds the one bright edge.
 *
 * Each sheet falls a little way onto the stack, back to front, over-rotated
 * so it settles rather than slides. The chart draws once the top has landed.
 *
 * A sheet's own axes are u across and v down the page, as in the flat
 * version, laid on the desk turned by FACE_SCREEN.
 */

const W = 84;
const H = 108;
const THICK = 1.4;
const R = 6;
const CB = 1.6;
/**
 * The stack's turn on the desk. At -60° the page's across runs nearly
 * straight right on screen and its up runs up, so the chart climbs at about
 * 35°. At -45° the page squares up to the screen and loses its depth; at 0 or
 * -90° across and up fight each other and the chart reads flat or vertical.
 */
const FACE_SCREEN = -60;

/** Bottom to top; `fan` is how far it's turned off the top sheet. */
const SHEETS = [{ fan: -9 }, { fan: 5 }, { fan: 0 }];

const DROP = 14;
const DURATION = 0.45;
const STAGGER = 0.08;
const TOP_LANDED = (SHEETS.length - 1) * STAGGER + DURATION;

/** The flat version's page was 120 × 150 at (60, 68); its marks, in page units. */
const toPage = ([x, y]: number[]) => [((x - 120) / 120) * W, ((y - 143) / 150) * H];
const CHART = [[74, 192], [90, 180], [104, 186], [120, 160], [134, 166], [150, 134], [166, 122]].map(toPage);
const RULES = [
  [[74, 87], [118, 87]],
  [[74, 99], [102, 99]],
].map((rule) => rule.map(toPage));

const zOf = (i: number) => i * THICK;
/** A point on a sheet's face, turned with it, at height z. */
const onFace = (u: number, v: number, deg: number): [number, number] => turn(u, v, 0, 0, FACE_SCREEN + deg);

const CAM = camera(
  1.65,
  SHEETS.flatMap(({ fan }, i): Vec3[] =>
    [[-W / 2, -H / 2], [W / 2, -H / 2], [W / 2, H / 2], [-W / 2, H / 2]].map(([u, v]) => [...onFace(u, v, fan), zOf(i)]),
  ),
  120,
  150,
);

const line = (pts: number[][], deg: number, z: number) =>
  "M" + pts.map(([u, v]) => CAM.P(...onFace(u, v, deg), z).join(" ")).join("L");

interface ISheet {
  index: number;
  fan: number;
  top: boolean;
}

function Sheet({ index, fan, top }: ISheet) {
  /** 0 is held above the stack, over-rotated; 1 has landed. */
  const t = useMotionValue(0);
  const z = useTransform(t, (k) => zOf(index) + DROP * (1 - k));
  const deg = useTransform(t, (k) => fan * (1.4 - 0.4 * k));
  const solid = useTransform([z, deg], ([zz, d]: number[]) =>
    box(CAM, [-W / 2, -H / 2, W / 2, H / 2], R, CB, zz, zz + THICK, FACE_SCREEN + d),
  );
  const sil = useTransform(solid, (s) => s.sil);
  const crease = useTransform(solid, (s) => s.crease);
  // Both header rules as one path, each its own subpath.
  const rules = useTransform([z, deg], ([zz, d]: number[]) => RULES.map((rule) => line(rule, d, zz + THICK)).join(""));
  const chart = useTransform([z, deg], ([zz, d]: number[]) => line(CHART, d, zz + THICK));

  useEffect(() => {
    const controls = animate(t, 1, { duration: DURATION, delay: index * STAGGER, ease: EASE });
    return () => controls.stop();
  }, [t, index]);

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, delay: index * STAGGER }}
    >
      <motion.path d={sil} fill={C.plate} stroke={C.muted} strokeLinejoin="round" />
      <motion.path d={crease} fill="none" stroke={C.line} strokeLinejoin="round" />
      {top && (
        <>
          <motion.path d={rules} fill="none" stroke={C.muted} strokeWidth={2} strokeLinecap="round" />
          <motion.path
            d={chart}
            fill="none"
            stroke={C.ink}
            strokeWidth={1.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 0.9, delay: TOP_LANDED, ease: EASE },
              opacity: { duration: 0.01, delay: TOP_LANDED },
            }}
          />
        </>
      )}
    </motion.g>
  );
}

export function PaperHairline() {
  return (
    <g strokeWidth={1}>
      {SHEETS.map(({ fan }, i) => (
        <Sheet key={i} index={i} fan={fan} top={i === SHEETS.length - 1} />
      ))}
    </g>
  );
}
