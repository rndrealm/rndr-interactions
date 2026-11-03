import React, { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { Avatar, C, EASE, GROW } from "./shared";

const BASELINE = 216;

/** Left to right on the canvas; `order` is when each one rises — 3rd, 2nd, 1st. */
const PODIUMS = [
  { place: 2, x: 38, height: 68, order: 1 },
  { place: 1, x: 94, height: 96, order: 2 },
  { place: 3, x: 150, height: 48, order: 0 },
];

const WIDTH = 52;

const STAGGER = 0.12;
const GROW_DURATION = 0.5;

/** Tokens all arrive together, once the last bar has finished. */
const ALL_LANDED =
  Math.max(...PODIUMS.map((p) => p.order)) * STAGGER + GROW_DURATION;

interface IToken {
  cx: number;
  cy: number;
  winner: boolean;
}

/** A generic coin: a filled disc with a diamond mark cut out of it. */
function Token({ cx, cy, winner }: IToken) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={9} fill={winner ? C.accent : C.muted} />
      <path
        d={`M${cx} ${cy - 5} L${cx + 4} ${cy} L${cx} ${cy + 5} L${cx - 4} ${cy}Z`}
        fill={winner ? C.onAccent : C.surface}
      />
    </g>
  );
}

interface IBar {
  x: number;
  height: number;
  delay: number;
  stroke: string;
}

/**
 * Grows in height out of the baseline. One 0→1 progress value drives the y
 * and height attributes, rather than scaleY, so the rounded corners and
 * stroke stay crisp instead of squashing while the bar is short.
 */
function Bar({ x, height, delay, stroke }: IBar) {
  const progress = useMotionValue(0);
  const h = useTransform(progress, (p) => height * p);
  const y = useTransform(progress, (p) => BASELINE - height * p);

  useEffect(() => {
    const controls = animate(progress, 1, {
      duration: GROW_DURATION,
      delay,
      ease: GROW,
    });
    return () => controls.stop();
  }, [progress, delay]);

  return (
    <motion.rect
      x={x}
      y={y}
      width={WIDTH}
      height={h}
      rx={6}
      fill={C.surface}
      stroke={stroke}
    />
  );
}

export function CompetitionPodium() {
  return (
    <>
      {PODIUMS.map(({ place, x, height, order }) => {
        const top = BASELINE - height;
        const cx = x + WIDTH / 2;
        const delay = order * STAGGER;
        /** When this bar has finished growing — its avatar drops then. */
        const landed = delay + GROW_DURATION;
        const winner = place === 1;

        return (
          <g key={place}>
            <Bar
              x={x}
              height={height}
              delay={delay}
              stroke={winner ? C.accent : C.line}
            />
            <motion.g
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: ALL_LANDED, ease: EASE }}
            >
              <Token cx={cx} cy={top + 22} winner={winner} />
            </motion.g>
            <motion.g
              // Falls onto the podium and bounces as it lands.
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                y: {
                  type: "spring",
                  visualDuration: 0.4,
                  bounce: 0.35,
                  delay: landed,
                },
                opacity: { duration: 0.12, delay: landed },
              }}
            >
              <Avatar cx={cx} cy={top - 20} r={14} ring={winner} />
            </motion.g>
          </g>
        );
      })}
    </>
  );
}
