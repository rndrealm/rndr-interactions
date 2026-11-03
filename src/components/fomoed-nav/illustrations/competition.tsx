import React from "react";
import { motion } from "motion/react";
import { C, pop, draw, Avatar } from "./shared";

export function Competition() {
  return (
    <>
      <motion.path
        d="M40 196 C70 150 100 160 130 150 S170 140 200 132"
        fill="none"
        stroke={C.muted}
        strokeWidth={1.5}
        strokeLinecap="round"
        {...draw(0, 1.1)}
      />
      <motion.path
        d="M40 196 C80 190 90 120 130 130 S180 90 200 84"
        fill="none"
        stroke={C.accent}
        strokeWidth={1.5}
        strokeLinecap="round"
        {...draw(0.1, 1.1)}
      />
      <circle cx={40} cy={196} r={3} fill={C.ink} />
      <motion.g {...pop(1)}>
        <Avatar cx={200} cy={84} r={11} ring />
        <rect x={174} y={62} width={22} height={13} rx={6.5} fill={C.accent} />
        <text
          x={185}
          y={71.5}
          textAnchor="middle"
          fontSize={8}
          fontWeight={500}
          fill={C.onAccent}
        >
          #1
        </text>
      </motion.g>
      <motion.g {...pop(1.1)}>
        <Avatar cx={200} cy={132} r={11} />
      </motion.g>
    </>
  );
}
