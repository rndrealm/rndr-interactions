import React from "react";
import { motion } from "motion/react";
import { C, EASE, appear } from "./shared";

/**
 * Spinner → check as one path: a full circle, then the check, joined at the
 * circle's leftmost point (which is where the check starts). The circle's
 * bounding box is centred on the button, so `rotate` spins about it.
 */
const R = 4.9;
const CX = 120;
const CY = 193;
const CHECK = [
  [CX - R, CY],
  [118.6, 196.5],
  [124.9, 189.5],
];
const SPINNER_TO_CHECK =
  `M${CX - R} ${CY} A${R} ${R} 0 1 1 ${CX + R} ${CY} A${R} ${R} 0 1 1 ${CX - R} ${CY}` +
  CHECK.slice(1)
    .map(([x, y]) => ` L${x} ${y}`)
    .join("");

const CIRCLE_LENGTH = 2 * Math.PI * R;
const CHECK_LENGTH = CHECK.slice(1).reduce(
  (sum, [x, y], i) => sum + Math.hypot(x - CHECK[i][0], y - CHECK[i][1]),
  0,
);

/** Where the circle ends and the check begins, as a fraction of the path. */
const CIRCLE = CIRCLE_LENGTH / (CIRCLE_LENGTH + CHECK_LENGTH);
/** The loading arc: a quarter of the circle. */
const SPIN_ARC = CIRCLE / 4;

/**
 * While the button fills, the arc spins (whole turns, so it stops back at the
 * start of the path). Then it slides on round the rest of the circle and into
 * the check, growing to exactly the check's length — one unbroken motion.
 */
const SPIN_START = 0.3;
const SPIN_DURATION = 0.8;
const SETTLE = SPIN_START + SPIN_DURATION;

const ORDER_ROWS = [
  { label: "Side", value: "Buy", accent: true },
  { label: "Size", value: "2.5 BTC" },
  { label: "Price", value: "64,210" },
];

export function Execution() {
  return (
    <motion.g {...appear()}>
      <rect
        x={44}
        y={64}
        width={152}
        height={158}
        rx={12}
        fill={C.surface}
        stroke={C.line}
      />
      <text x={58} y={88} fontSize={11} fontWeight={500} fill={C.ink}>
        Market order
      </text>
      {ORDER_ROWS.map((row, i) => (
        <g key={row.label}>
          <text x={58} y={116 + i * 20} fontSize={10} fill={C.muted}>
            {row.label}
          </text>
          <text
            x={182}
            y={116 + i * 20}
            textAnchor="end"
            fontSize={10}
            fontWeight={500}
            fill={row.accent ? C.accent : C.ink}
          >
            {row.value}
          </text>
        </g>
      ))}
      <rect x={56} y={178} width={128} height={30} rx={8} fill={C.line} />
      <motion.rect
        x={56}
        y={178}
        height={30}
        rx={8}
        fill={C.accent}
        initial={{ width: 0 }}
        animate={{ width: 128 }}
        transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
      />
      <motion.path
        d={SPINNER_TO_CHECK}
        fill="none"
        stroke={C.onAccent}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ opacity: 0, rotate: 0, pathOffset: 0, pathLength: SPIN_ARC }}
        animate={{
          opacity: 1,
          rotate: 720,
          pathOffset: CIRCLE,
          pathLength: 1 - CIRCLE,
        }}
        transition={{
          opacity: { duration: 0.01, delay: SPIN_START },
          rotate: { duration: SPIN_DURATION, delay: SPIN_START, ease: "linear" },
          pathOffset: { duration: 0.4, delay: SETTLE, ease: "easeOut" },
          pathLength: { duration: 0.4, delay: SETTLE, ease: "easeOut" },
        }}
      />
    </motion.g>
  );
}
