"use client";
import React from "react";
import { motion } from "motion/react";
import { springFromResponse } from "./physics";

const KNOB = springFromResponse(0.3, 0.9);

interface IToggleRow {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

// The whole row is the switch, so the hit area is the full row, not just the
// small track on the right.
export function ToggleRow(props: IToggleRow) {
  const { label, checked, onChange } = props;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex h-9 w-full cursor-pointer items-center justify-between rounded-lg px-1 outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.708_0_0)]"
    >
      <span className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
        {label}
      </span>
      <span
        className={`flex h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors ${checked ? "justify-end bg-[oklch(0.375_0_0)]" : "justify-start bg-[oklch(0.865_0_0)]"}`}
      >
        <motion.span
          layout
          transition={KNOB}
          className="size-4 rounded-full bg-white shadow-[0_0_0_1px_#0000001C,0_1px_3px_0_#00000017]"
        />
      </span>
    </button>
  );
}
