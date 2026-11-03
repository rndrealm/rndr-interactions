import React from "react";
import { motion } from "motion/react";
import { C, pop, Avatar } from "./shared";

export function Pvp() {
  return (
    <>
      <motion.g {...pop(0)}>
        <Avatar cx={72} cy={110} r={22} ring />
      </motion.g>
      <motion.g {...pop(0.08)}>
        <Avatar cx={168} cy={110} r={22} />
      </motion.g>
      <text
        x={120}
        y={114}
        textAnchor="middle"
        fontSize={11}
        fontWeight={500}
        fill={C.muted}
      >
        VS
      </text>
      <rect x={40} y={164} width={160} height={10} rx={5} fill={C.line} />
      <motion.rect
        x={40}
        y={164}
        height={10}
        rx={5}
        fill={C.accent}
        initial={{ width: 0 }}
        animate={{ width: [0, 92, 70, 104, 80, 92] }}
        transition={{
          duration: 5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />
      <rect x={119} y={160} width={2} height={18} rx={1} fill={C.ink} />
    </>
  );
}
