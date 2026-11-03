import React from "react";
import { motion } from "motion/react";
import { C, EASE, appear, Avatar } from "./shared";

const LEADERS = [112, 88, 64, 44];

export function Leaderboard() {
  return (
    <>
      {LEADERS.map((width, i) => {
        const y = 92 + i * 34;
        const isFirst = i === 0;
        return (
          <motion.g key={i} {...appear(i * 0.07)}>
            <text
              x={44}
              y={y + 4}
              textAnchor="middle"
              fontSize={10}
              fontWeight={500}
              fill={isFirst ? C.accent : C.muted}
            >
              {i + 1}
            </text>
            <Avatar cx={68} cy={y} r={10} ring={isFirst} />
            <rect x={86} y={y - 7} width={52} height={5} rx={2.5} fill={C.muted} />
            <motion.rect
              x={86}
              y={y + 3}
              height={5}
              rx={2.5}
              fill={isFirst ? C.accent : C.ink}
              initial={{ width: 0 }}
              animate={{ width }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.07, ease: EASE }}
            />
            {i < LEADERS.length - 1 && (
              <line x1={36} x2={204} y1={y + 17} y2={y + 17} stroke={C.line} />
            )}
          </motion.g>
        );
      })}
    </>
  );
}
