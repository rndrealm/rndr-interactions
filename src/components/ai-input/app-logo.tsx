"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
}

export default function AppLogo({ className }: AppLogoProps) {
  const [hoverKey, setHoverKey] = useState(0);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn("size-8 overflow-hidden cursor-pointer", className)}
      onMouseEnter={() => {
        setHovered(true);
        setHoverKey((k) => k + 1);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        key={hoverKey}
        className="flex gap-[2px] h-full items-center"
        initial={{ x: 0 }}
        animate={hovered ? { x: [0, -5, 0] } : { x: 0 }}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
        }}
      >
        <div className="w-[3px] h-full shrink-0 rounded-[2px] bg-[#f9f9f9]" />
        <div className="w-[15px] h-full shrink-0 rounded-[2px] bg-[#f9f9f9]" />
        <div className="w-[15px] h-full shrink-0 rounded-[2px] bg-[#f9f9f9]" />
        <div className="w-[3px] h-full shrink-0 rounded-[2px] bg-[#f9f9f9]" />
      </motion.div>
    </div>
  );
}
