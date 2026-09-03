"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// One 15px panel + gap (2px). The row comes to 42px inside a 25px window, so
// this is also the full overflow — the slide lands flush with the end.
const PANEL_OFFSET = 15 + 2;

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

export function RowButton({ isActive, onClick, className }: IProps) {
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
      <div className="w-6.25 h-5 overflow-hidden">
        <motion.div
          className="flex gap-[2px] h-full"
          variants={{
            idle: { x: 0 },
            // Gate on the value, not on `whileHover` itself — dropping the prop
            // detaches the hover listener and leaves the hover state stuck on.
            hovered: { x: isActive ? 0 : -PANEL_OFFSET },
          }}
          transition={SLIDE}
        >
          <div className="w-[3px] h-full shrink-0 bg-current"></div>
          <div className="w-[15px] h-full shrink-0 bg-current"></div>
          <div className="w-[15px] h-full shrink-0 bg-current"></div>
          <div className="w-[3px] h-full shrink-0 bg-current"></div>
        </motion.div>
      </div>
    </motion.button>
  );
}
