import React from "react";
import { motion } from "motion/react";
import { C, pop } from "./shared";

export function Sports() {
  return (
    <>
      <motion.g {...pop(0)}>
        <rect
          x={84}
          y={44}
          width={72}
          height={20}
          rx={10}
          fill={C.surface}
          stroke={C.line}
        />
        <motion.circle
          cx={97}
          cy={54}
          r={3}
          fill={C.accent}
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <text
          x={126}
          y={57.5}
          textAnchor="middle"
          fontSize={10}
          fontWeight={500}
          fill={C.ink}
        >
          2 : 1
        </text>
      </motion.g>
      <motion.g
        fill="none"
        stroke={C.line}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <rect x={40} y={78} width={160} height={132} rx={8} />
        <line x1={120} x2={120} y1={78} y2={210} />
        <circle cx={120} cy={144} r={22} />
        <rect x={40} y={116} width={22} height={56} />
        <rect x={178} y={116} width={22} height={56} />
      </motion.g>
      <motion.circle
        r={4}
        fill={C.accent}
        initial={{ cx: 120, cy: 144 }}
        animate={{
          cx: [120, 152, 98, 176, 120],
          cy: [144, 112, 172, 140, 144],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}
