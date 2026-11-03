import React from "react";
import { motion } from "motion/react";
import { C, appear, pop, draw } from "./shared";

export function Odds() {
  return (
    <>
      <motion.g {...appear()}>
        <text x={40} y={102} fontSize={28} fontWeight={500} fill={C.ink}>
          62¢
        </text>
        <text x={42} y={122} fontSize={10} fontWeight={500} fill={C.accent}>
          +4.1% today
        </text>
      </motion.g>
      <motion.path
        d="M40 204 L60 196 L76 204 L96 182 L116 188 L134 166 L152 172 L172 152 L200 144"
        fill="none"
        stroke={C.accent}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(0.15, 1)}
      />
      <motion.circle cx={200} cy={144} r={3.5} fill={C.accent} {...pop(1.1)} />
      <motion.circle
        cx={200}
        cy={144}
        fill="none"
        stroke={C.accent}
        initial={{ r: 4, opacity: 0 }}
        animate={{ r: 14, opacity: [0.6, 0] }}
        transition={{
          duration: 1.4,
          delay: 1.2,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    </>
  );
}
