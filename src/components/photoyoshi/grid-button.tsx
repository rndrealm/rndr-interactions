"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const COLUMNS = 5;
const ROWS = 3;
const CELL = 5.6;
const GAP = 1.6;
const WINDOW = 20;

// Slide by exactly what overflows the window, so the hover lands flush with the
// last column no matter how many columns there are.
const CONTENT = COLUMNS * CELL + (COLUMNS - 1) * GAP;
const SLIDE_X = Math.max(0, CONTENT - WINDOW);

// SwiftUI's `.smooth`: critically damped, so it eases in and out with no
// overshoot at all. Unlike a tween it keeps its velocity through an
// interruption, so hovering in and out quickly stays fluid instead of
// restarting the curve mid-slide.
const SLIDE = { type: "spring", duration: 0.65, bounce: 0 } as const;

// Same shape, shorter — a press should feel immediate both ways.
const PRESS = { type: "spring", duration: 0.3, bounce: 0 } as const;

interface IProps {
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export function GridButton({ isActive, onClick, className }: IProps) {
  return (
    <motion.button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={cn(
        "w-10 h-10 flex items-center justify-center cursor-pointer transition-colors duration-300",
        isActive ? "text-[#151617]" : "text-[#151617]/50",
        className,
      )}
      initial="idle"
      animate="idle"
      whileHover="hovered"
      whileTap={{ scale: 0.95 }}
      transition={PRESS}
    >
      <div className="h-5 overflow-hidden" style={{ width: WINDOW }}>
        <motion.div
          className="flex"
          style={{ gap: GAP }}
          variants={{
            idle: { x: 0 },
            // Gate on the value, not on `whileHover` itself — dropping the prop
            // detaches the hover listener and leaves the hover state stuck on.
            hovered: { x: isActive ? 0 : -SLIDE_X },
          }}
          transition={SLIDE}
        >
          {Array(COLUMNS)
            .fill(0)
            .map((_, key) => {
              return (
                <div
                  key={key}
                  className="flex flex-col"
                  style={{ gap: GAP }}
                >
                  {Array(ROWS)
                    .fill(0)
                    .map((_, index) => {
                      return (
                        <div
                          key={index}
                          className="shrink-0 bg-current"
                          style={{ width: CELL, height: CELL }}
                        ></div>
                      );
                    })}
                </div>
              );
            })}
        </motion.div>
      </div>
    </motion.button>
  );
}
