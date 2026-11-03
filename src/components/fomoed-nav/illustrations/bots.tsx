import React from "react";
import { motion } from "motion/react";
import { C, pop, draw } from "./shared";

export function Bots() {
  return (
    <>
      <line x1={120} x2={120} y1={84} y2={96} stroke={C.line} />
      <motion.circle
        cx={120}
        cy={80}
        r={4}
        fill={C.accent}
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
      <rect
        x={84}
        y={96}
        width={72}
        height={56}
        rx={14}
        fill={C.surface}
        stroke={C.line}
      />
      {[102, 130].map((x) => (
        <motion.rect
          key={x}
          x={x}
          y={114}
          width={8}
          height={12}
          rx={4}
          fill={C.ink}
          animate={{ scaleY: [1, 0.15, 1] }}
          transition={{
            duration: 0.25,
            repeat: Infinity,
            repeatDelay: 2.6,
            delay: 0.6,
          }}
        />
      ))}
      <rect x={108} y={136} width={24} height={4} rx={2} fill={C.muted} />
      <motion.path
        d="M48 218 L72 204 L92 210 L116 190 L138 196 L164 172 L192 166"
        fill="none"
        stroke={C.accent}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(0.2)}
      />
      {[
        [72, 204],
        [164, 172],
      ].map(([cx, cy], i) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy={cy}
          r={3.5}
          fill={C.surface}
          stroke={C.accent}
          strokeWidth={1.5}
          {...pop(0.5 + i * 0.3)}
        />
      ))}
    </>
  );
}
