import React, { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { C, EASE, GROW } from "./shared";
import { box, camera, cylinder, pawn, type Vec3 } from "./iso";

/**
 * Trading Competition in the Hairline look: a three-step podium seen in the
 * 2:1 isometric view. Each step holds a pawn, the player, at its back and a
 * stack of coins, the winnings, at its front: three for 1st, two for 2nd, one
 * for 3rd. The winner's pawn holds the one bright edge.
 *
 * The steps grow up from the ground in order 3rd, 2nd, 1st; each pawn drops
 * onto its step as that step lands, and the coins arrive together once the
 * last one has.
 */

const W = 26;
const D = 30;
const R = 3;
const CB = 1.6;

/** Back to front along x, so appending is painting back to front. */
const STEPS = [
  { place: 2, x: -W, height: 30, coins: 2, order: 1 },
  { place: 1, x: 0, height: 44, coins: 3, order: 2 },
  { place: 3, x: W, height: 20, coins: 1, order: 0 },
];

const PAWN = { r: 4.2, base: 6, head: 3.8 };
const COIN = { r: 5, h: 1.8, gap: 0.4 };

const STAGGER = 0.12;
const GROW_DURATION = 0.5;
const ALL_LANDED = Math.max(...STEPS.map((s) => s.order)) * STAGGER + GROW_DURATION;

const footprint = (x: number): [number, number, number, number] => [x - W / 2, -D / 2, x + W / 2, D / 2];
/**
 * On each step: the pawn at the back, the coins at the front, so the coins
 * paint over it. Both keep to the low-x side, away from the next step, which
 * would otherwise cover them.
 */
const pawnAt = (x: number): [number, number] => [x - 5, -6];
const coinsAt = (x: number): [number, number] => [x - 5, 8];

const CAM = camera(
  2.4,
  STEPS.flatMap(({ x, height }): Vec3[] => {
    const [x0, y0, x1, y1] = footprint(x);
    return [[x0, y0, 0], [x1, y1, 0], [x0, y1, 0], [x1, y0, 0], [...pawnAt(x), height + PAWN.base + PAWN.head * 2]];
  }),
);

interface IStep {
  x: number;
  height: number;
  delay: number;
}

/** A step growing in height out of the ground, its top rising and its foot planted. */
function Step({ x, height, delay }: IStep) {
  const z = useMotionValue(0);
  const solid = useTransform(z, (h) => box(CAM, footprint(x), R, CB, 0, Math.max(h, 0.5)));
  const sil = useTransform(solid, (s) => s.sil);
  const crease = useTransform(solid, (s) => s.crease);

  useEffect(() => {
    const controls = animate(z, height, { duration: GROW_DURATION, delay, ease: GROW });
    return () => controls.stop();
  }, [z, height, delay]);

  return (
    <g>
      <motion.path d={sil} fill={C.plate} stroke={C.muted} strokeLinejoin="round" />
      <motion.path d={crease} fill="none" stroke={C.line} strokeLinejoin="round" />
    </g>
  );
}

function Pawn({ x, z, bright }: { x: number; z: number; bright: boolean }) {
  const { base, head } = pawn(CAM, ...pawnAt(x), z, PAWN);
  const edge = bright ? C.ink : C.muted;
  return (
    <g>
      <path d={base.sil} fill={C.plate} stroke={edge} strokeLinejoin="round" />
      <circle {...head} fill={C.plate} stroke={edge} />
    </g>
  );
}

function Coins({ x, z, count }: { x: number; z: number; count: number }) {
  const [cx, cy] = coinsAt(x);
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const z0 = z + i * (COIN.h + COIN.gap);
        const coin = cylinder(CAM, cx, cy, COIN.r, 1.2, z0, z0 + COIN.h);
        return (
          <g key={i}>
            <path d={coin.sil} fill={C.plate} stroke={C.muted} strokeLinejoin="round" />
            {i === count - 1 && <path d={coin.crease} fill="none" stroke={C.line} />}
          </g>
        );
      })}
    </g>
  );
}

export function CompetitionHairline() {
  return (
    <g strokeWidth={1}>
      {STEPS.map(({ place, x, height, coins, order }) => {
        const delay = order * STAGGER;
        const landed = delay + GROW_DURATION;
        return (
          <g key={place}>
            <Step x={x} height={height} delay={delay} />
            <motion.g
              // Falls onto its step and bounces as it lands.
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                y: { type: "spring", visualDuration: 0.4, bounce: 0.35, delay: landed },
                opacity: { duration: 0.12, delay: landed },
              }}
            >
              <Pawn x={x} z={height} bright={place === 1} />
            </motion.g>
            <motion.g
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: ALL_LANDED, ease: EASE }}
            >
              <Coins x={x} z={height} count={coins} />
            </motion.g>
          </g>
        );
      })}
    </g>
  );
}
