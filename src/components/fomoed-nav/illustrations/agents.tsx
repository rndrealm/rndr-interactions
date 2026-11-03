import React from "react";
import { motion } from "motion/react";
import { C, pop, draw } from "./shared";

const AGENT_NODES = [-90, -18, 54, 126, 198].map((deg) => {
  const angle = (deg * Math.PI) / 180;
  return [
    Math.round(120 + Math.cos(angle) * 72),
    Math.round(143 + Math.sin(angle) * 72),
  ];
});

export function Agents() {
  return (
    <>
      <circle
        cx={120}
        cy={143}
        r={72}
        fill="none"
        stroke={C.line}
        strokeDasharray="2 4"
      />
      {AGENT_NODES.map(([x, y], i) => (
        <motion.line
          key={i}
          x1={120}
          y1={143}
          x2={x}
          y2={y}
          stroke={C.line}
          {...draw(i * 0.05, 0.5)}
        />
      ))}
      {AGENT_NODES.map(([x, y], i) => (
        <motion.circle
          key={i}
          r={2.5}
          fill={C.accent}
          initial={{ cx: x, cy: y, opacity: 0 }}
          animate={{ cx: [x, 120], cy: [y, 143], opacity: [0, 1, 0] }}
          transition={{
            duration: 1.4,
            delay: 0.5 + i * 0.35,
            repeat: Infinity,
            repeatDelay: 0.6,
            ease: "easeIn",
          }}
        />
      ))}
      {AGENT_NODES.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={7}
          fill={C.surface}
          stroke={C.muted}
          {...pop(0.2 + i * 0.05)}
        />
      ))}
      <circle cx={120} cy={143} r={12} fill={C.accent} />
      <motion.circle
        cx={120}
        cy={143}
        fill="none"
        stroke={C.accent}
        initial={{ r: 12, opacity: 0.6 }}
        animate={{ r: 24, opacity: 0 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      />
    </>
  );
}
