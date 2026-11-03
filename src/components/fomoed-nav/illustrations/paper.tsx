import React from "react";
import { motion } from "motion/react";
import { C, EASE, pop, draw } from "./shared";

/**
 * Each sheet falls a few pixels onto the stack, back to front. It starts a
 * touch larger and over-rotated, so it reads as settling down rather than
 * sliding in.
 */
function drop(index: number, rotate = 0) {
  return {
    initial: { opacity: 0, y: -10, scale: 1.04, rotate: rotate * 1.4 },
    animate: { opacity: 1, y: 0, scale: 1, rotate },
    transition: {
      default: { duration: 0.45, delay: index * 0.08, ease: EASE },
      opacity: { duration: 0.15, delay: index * 0.08 },
    },
  };
}

export function Paper() {
  const sheet = { x: 60, y: 68, width: 120, height: 150, rx: 10 };

  return (
    <>
      {[-9, 5].map((rotate, i) => (
        <motion.rect
          key={rotate}
          {...sheet}
          fill={C.surface}
          stroke={C.line}
          {...drop(i, rotate)}
        />
      ))}
      <motion.g {...drop(2)}>
        <rect {...sheet} fill={C.surface} stroke={C.line} />
        <rect x={74} y={84} width={44} height={6} rx={3} fill={C.ink} />
        <rect x={74} y={96} width={28} height={6} rx={3} fill={C.muted} />
        <motion.g {...pop(0.55)}>
          <rect x={134} y={82} width={32} height={14} rx={7} fill={C.line} />
          <text
            x={150}
            y={92}
            textAnchor="middle"
            fontSize={8}
            fontWeight={500}
            fill={C.muted}
          >
            SIM
          </text>
        </motion.g>
        <motion.path
          d="M74 192 L90 180 L104 186 L120 160 L134 166 L150 134 L166 122"
          fill="none"
          stroke={C.accent}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...draw(0.5)}
        />
      </motion.g>
    </>
  );
}
