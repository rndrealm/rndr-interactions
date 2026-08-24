"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";
import Image from "next/image";
import { CursorIcon } from "@/components/icons/cursor";

interface Company {
  name: string;
  cursorColor: string;
  icon: string;
}

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `rgb(${r}, ${g}, ${b})`;
}

const companies: Company[] = [
  {
    name: "Claude",
    cursorColor: "#3B82F6",
    icon: "/cursor-tooltips/claude-color.svg",
  },
  {
    name: "Figma",
    cursorColor: "#16A34A",
    icon: "/cursor-tooltips/figma-color.svg",
  },
  {
    name: "GitHub",
    cursorColor: "#6366F1",
    icon: "/cursor-tooltips/github.svg",
  },
  {
    name: "Mistral",
    cursorColor: "#0EA5E9",
    icon: "/cursor-tooltips/mistral-color.svg",
  },
  {
    name: "Vercel",
    cursorColor: "#8B5CF6",
    icon: "/cursor-tooltips/vercel.svg",
  },
];

export default function CursorTooltips() {
  const [active, setActive] = useState<Company | null>(null);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cursorX = useSpring(mouseX, { stiffness: 600, damping: 28, mass: 0.5 });
  const cursorY = useSpring(mouseY, { stiffness: 600, damping: 28, mass: 0.5 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    },
    [mouseX, mouseY],
  );

  const handleEnter = useCallback((company: Company) => {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
    setActive(company);
  }, []);

  const handleLeave = useCallback(() => {
    leaveTimeout.current = setTimeout(() => {
      setActive(null);
    }, 80);
  }, []);

  return (
    <main
      className="w-screen h-screen flex flex-col items-center justify-center bg-white overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      style={{ cursor: active ? "none" : "auto" }}
    >
      <div className="flex items-center gap-12">
        {companies.map((company) => (
          <div
            key={company.name}
            onMouseEnter={() => handleEnter(company)}
            onMouseLeave={handleLeave}
            className="relative w-10 h-10 md:w-12 md:h-12"
            style={{ cursor: "none" }}
          >
            <Image
              src={company.icon}
              alt={company.name}
              width={48}
              height={48}
              draggable={false}
            />
          </div>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            key="cursor-group"
            className="fixed top-0 left-0 pointer-events-none z-50"
            style={{ x: cursorX, y: cursorY }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              initial={{ scale: 0, originX: 0, originY: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="relative"
            >
              <div className="absolute -top-3.5 -left-2 z-10">
                <CursorIcon color={active.cursorColor} />
              </div>
              <div
                className="pl-5 pr-4 py-1.5 text-[13px] font-semibold whitespace-nowrap"
                style={{
                  backgroundColor: active.cursorColor,
                  color: "#fff",
                  border: `2px solid ${darken(active.cursorColor, 20)}`,
                  borderRadius: "0 9999px 9999px 9999px",
                  marginTop: 10,
                  marginLeft: 4,
                }}
              >
                {active.name}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
