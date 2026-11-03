import React from "react";
import { motion } from "motion/react";
import { C, appear, pop, useSvgId } from "./shared";

export function Create() {
  const clipId = useSvgId();

  return (
    <motion.g {...appear()}>
      <rect
        x={32}
        y={82}
        width={176}
        height={112}
        rx={12}
        fill={C.surface}
        stroke={C.line}
      />
      <text x={46} y={104} fontSize={9} fill={C.muted}>
        Your question
      </text>
      <rect
        x={46}
        y={112}
        width={148}
        height={28}
        rx={6}
        fill="none"
        stroke={C.line}
      />
      <clipPath id={clipId}>
        <motion.rect
          x={54}
          y={112}
          height={28}
          initial={{ width: 0 }}
          animate={{ width: 136 }}
          transition={{ duration: 1.1, delay: 0.25, ease: "linear" }}
        />
      </clipPath>
      <text
        x={54}
        y={130}
        fontSize={11}
        fill={C.ink}
        clipPath={`url(#${clipId})`}
      >
        Will it rain in Lagos?
      </text>
      <motion.g {...pop(1.35)}>
        <rect x={46} y={154} width={64} height={24} rx={6} fill={C.accent} />
        <text
          x={78}
          y={169.5}
          textAnchor="middle"
          fontSize={10}
          fontWeight={500}
          fill={C.onAccent}
        >
          Create
        </text>
      </motion.g>
      {["Yes", "No"].map((label, i) => (
        <motion.g key={label} {...pop(1.45 + i * 0.06)}>
          <rect
            x={118 + i * 40}
            y={154}
            width={34}
            height={24}
            rx={6}
            fill="none"
            stroke={C.line}
          />
          <text
            x={135 + i * 40}
            y={169.5}
            textAnchor="middle"
            fontSize={10}
            fill={C.muted}
          >
            {label}
          </text>
        </motion.g>
      ))}
    </motion.g>
  );
}
