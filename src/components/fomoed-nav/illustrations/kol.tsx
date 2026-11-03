import React from "react";
import { motion } from "motion/react";
import { C, pop, Avatar } from "./shared";

export function Kol() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={120}
          cy={143}
          fill="none"
          stroke={C.accent}
          initial={{ r: 24, opacity: 0.6 }}
          animate={{ r: 86, opacity: 0 }}
          transition={{
            duration: 2.4,
            delay: i * 0.8,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = ((i * 60 - 60) * Math.PI) / 180;
        return (
          <motion.g key={i} {...pop(0.15 + i * 0.06)}>
            <Avatar
              cx={Math.round(120 + Math.cos(angle) * 74)}
              cy={Math.round(143 + Math.sin(angle) * 74)}
              r={8}
            />
          </motion.g>
        );
      })}
      <Avatar cx={120} cy={143} r={24} ring />
    </>
  );
}
