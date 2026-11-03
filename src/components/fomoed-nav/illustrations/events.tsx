import React from "react";
import { motion } from "motion/react";
import { C, EASE, appear } from "./shared";

const OUTCOMES = [
  { label: "Yes", share: 0.7, accent: true },
  { label: "No", share: 0.3 },
];

export function Events() {
  return (
    <motion.g {...appear()}>
      <rect
        x={32}
        y={72}
        width={176}
        height={142}
        rx={12}
        fill={C.surface}
        stroke={C.line}
      />
      <text x={46} y={98} fontSize={11} fontWeight={500} fill={C.ink}>
        BTC above $70k by Friday?
      </text>
      {OUTCOMES.map((outcome, i) => {
        const y = 128 + i * 32;
        return (
          <g key={outcome.label}>
            <text x={46} y={y} fontSize={10} fill={C.muted}>
              {outcome.label}
            </text>
            <text
              x={194}
              y={y}
              textAnchor="end"
              fontSize={10}
              fontWeight={500}
              fill={outcome.accent ? C.accent : C.ink}
            >
              {Math.round(outcome.share * 100)}%
            </text>
            <rect x={46} y={y + 7} width={148} height={6} rx={3} fill={C.line} />
            <motion.rect
              x={46}
              y={y + 7}
              height={6}
              rx={3}
              fill={outcome.accent ? C.accent : C.muted}
              initial={{ width: 0 }}
              animate={{ width: 148 * outcome.share }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: EASE }}
            />
          </g>
        );
      })}
      <text x={46} y={200} fontSize={9} fill={C.muted}>
        $1.2M volume
      </text>
    </motion.g>
  );
}
