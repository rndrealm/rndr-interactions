import React from "react";
import { motion } from "motion/react";
import { C, appear, pop } from "./shared";

const FUNNEL = [160, 124, 88, 52];

export function Funnels() {
  return (
    <>
      {FUNNEL.map((width, i) => {
        const isLast = i === FUNNEL.length - 1;
        return (
          <motion.rect
            key={width}
            x={120 - width / 2}
            y={72 + i * 30}
            width={width}
            height={22}
            rx={6}
            fill={isLast ? C.accent : C.surface}
            stroke={isLast ? C.accent : C.line}
            {...appear(i * 0.06)}
          />
        );
      })}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={120}
          r={3}
          fill={C.ink}
          initial={{ cy: 56, opacity: 0 }}
          animate={{ cy: [56, 196], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 1.8,
            delay: 0.3 + i * 0.6,
            repeat: Infinity,
            ease: "easeIn",
          }}
        />
      ))}
      <motion.g {...pop(0.4)}>
        <rect
          x={92}
          y={204}
          width={56}
          height={18}
          rx={9}
          fill={C.surface}
          stroke={C.line}
        />
        <text
          x={120}
          y={216.5}
          textAnchor="middle"
          fontSize={10}
          fontWeight={500}
          fill={C.accent}
        >
          4.2%
        </text>
      </motion.g>
    </>
  );
}
