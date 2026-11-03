import React from "react";
import { motion } from "motion/react";
import { C, EASE } from "./shared";

const STACKS = [3, 5, 4, 6];

export function Hedge() {
  return (
    <>
      <line x1={48} x2={192} y1={216} y2={216} stroke={C.line} />
      {STACKS.map((count, col) =>
        Array.from({ length: count }, (_, row) => {
          const isTop = col === 3 && row === count - 1;
          return (
            <motion.rect
              key={`${col}-${row}`}
              x={62 + col * 32}
              y={196 - row * 18}
              width={24}
              height={14}
              rx={3}
              fill={isTop ? C.accent : C.surface}
              stroke={isTop ? C.accent : C.line}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: col * 0.06 + row * 0.05,
                ease: EASE,
              }}
            />
          );
        }),
      )}
    </>
  );
}
