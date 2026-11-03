import React from "react";
import { motion } from "motion/react";
import { C, GROW, draw, pop } from "./shared";

/** [open, close, high, low] in canvas y — lower is a higher price. */
const RAW_CANDLES = [
  [180, 165, 158, 188],
  [165, 172, 160, 178],
  [172, 150, 144, 176],
  [150, 156, 142, 162],
  [156, 134, 128, 160],
  [134, 140, 126, 146],
  [140, 118, 110, 144],
  [118, 124, 112, 130],
  [124, 100, 94, 128],
];

/** Stretches the price range vertically about the chart's middle. */
const Y_SCALE = 1.2;
const MID_Y = 141;
const CANDLES = RAW_CANDLES.map((candle) =>
  candle.map((y) => MID_Y + (y - MID_Y) * Y_SCALE),
);

const [, LAST_CLOSE, LAST_HIGH] = CANDLES[CANDLES.length - 1];
/** The % tag sits clear above the last candle's high. */
const TAG_Y = LAST_HIGH - 22;

const BODY_WIDTH = 11;
const SPACING = 20;
/** Centres the row of candles on the 240-wide canvas. */
const START_X =
  (240 - ((CANDLES.length - 1) * SPACING + BODY_WIDTH)) / 2;

const STAGGER = 0.025;
const GROW_DURATION = 0.35;
/** Wicks start once the body is mostly grown. */
const WICK_DELAY = 0.2;
const WICK_DURATION = 0.25;
/** The price line and tag land as the last candle finishes. */
const SETTLED = (CANDLES.length - 1) * STAGGER + GROW_DURATION;

export function Terminal() {
  return (
    <>
      <motion.line
        x1={32}
        x2={208}
        y1={LAST_CLOSE}
        y2={LAST_CLOSE}
        stroke={C.accent}
        strokeOpacity={0.5}
        strokeDasharray="3 3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: SETTLED - 0.1, duration: 0.25 }}
      />
      {CANDLES.map(([open, close, high, low], i) => {
        const x = START_X + i * SPACING;
        const color = close < open ? C.accent : C.muted;
        const top = Math.min(open, close);
        const height = Math.max(Math.abs(open - close), 2);
        const delay = i * STAGGER;

        // The body grows out of its centre, then the wicks draw outward from
        // its edges — each wick starts at the body, so pathLength runs away
        // from it.
        return (
          <g key={i}>
            {[
              [top, high],
              [top + height, low],
            ].map(([from, to]) => (
              <motion.line
                key={to}
                x1={x + BODY_WIDTH / 2}
                x2={x + BODY_WIDTH / 2}
                y1={from}
                y2={to}
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                {...draw(delay + WICK_DELAY, WICK_DURATION)}
              />
            ))}
            <motion.rect
              x={x}
              y={top}
              width={BODY_WIDTH}
              height={height}
              rx={2}
              fill={color}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: GROW_DURATION, delay, ease: GROW }}
            />
          </g>
        );
      })}
      <motion.g {...pop(SETTLED)}>
        <rect x={162} y={TAG_Y} width={42} height={16} rx={4} fill={C.accent} />
        <text
          x={183}
          y={TAG_Y + 11}
          textAnchor="middle"
          fontSize={9}
          fontWeight={500}
          fill={C.onAccent}
        >
          +12.4%
        </text>
      </motion.g>
    </>
  );
}
