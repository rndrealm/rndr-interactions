import React from "react";
import { Navigation, Search } from "lucide-react";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./page";
import { SQUIRCLE } from "../mobile-sheet/page";

export function MapsScreen() {
  return (
    <div className="relative w-full h-full bg-[oklch(0.961_0_0)]">
      <svg
        className="absolute inset-0 size-full"
        viewBox={`0 0 ${SCREEN_WIDTH} ${SCREEN_HEIGHT}`}
        aria-hidden
      >
        <path
          d="M0 330 C60 310 90 360 150 350 S240 300 264 310 V420 H0 Z"
          fill="oklch(0.918 0 0)"
        />
        <rect
          x="150"
          y="70"
          width="90"
          height="70"
          rx="10"
          fill="oklch(0.94 0 0)"
        />
        <rect
          x="24"
          y="150"
          width="70"
          height="90"
          rx="10"
          fill="oklch(0.94 0 0)"
        />
        <rect
          x="140"
          y="190"
          width="100"
          height="80"
          rx="14"
          fill="oklch(0.94 0 0)"
        />
        <rect
          x="20"
          y="40"
          width="90"
          height="70"
          rx="12"
          fill="oklch(0.94 0 0)"
        />
        <g stroke="oklch(0.993 0 0)" strokeLinecap="round" fill="none">
          <path d="M-10 130 L280 120" strokeWidth="10" />
          <path d="M120 -10 L125 540" strokeWidth="10" />
          <path d="M-10 270 C80 260 180 290 280 170" strokeWidth="7" />
          <path d="M-10 60 L280 40" strokeWidth="5" />
          <path d="M250 -10 L240 540" strokeWidth="5" />
        </g>
        <path
          d="M125 240 L123 128 L200 124"
          stroke="oklch(0.649 0 0)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle
          cx="200"
          cy="124"
          r="5"
          fill="oklch(0.993 0 0)"
          stroke="oklch(0.649 0 0)"
          strokeWidth="3"
        />
        <circle
          cx="125"
          cy="240"
          r="18"
          fill="oklch(0.649 0 0)"
          opacity="0.15"
        />
        <circle
          cx="125"
          cy="240"
          r="7"
          fill="oklch(0.649 0 0)"
          stroke="oklch(0.993 0 0)"
          strokeWidth="3"
        />
      </svg>

      <div
        className={`absolute top-12 right-3 flex size-9 items-center justify-center rounded-[6px] supports-[corner-shape:squircle]:rounded-[10px] ${SQUIRCLE} bg-[oklch(0.993_0_0)] text-[oklch(0.649_0_0)] shadow-[0_0_0_1px_#0000000A,0_1px_2px_0_#0000000D]`}
      >
        <Navigation size={14} aria-hidden />
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 flex flex-col items-center gap-3 px-4 pt-2 pb-8 rounded-t-[24px] supports-[corner-shape:squircle]:rounded-t-[40px] ${SQUIRCLE} bg-[oklch(0.982_0_0)] shadow-[0_-1px_3px_0_#0000000A]`}
      >
        <div className="w-9 h-1 rounded-full bg-[oklch(0.894_0_0)]"></div>
        <div
          className={`flex w-full items-center gap-2 h-9 px-3 rounded-[7px] supports-[corner-shape:squircle]:rounded-[12px] ${SQUIRCLE} bg-[oklch(0.961_0_0)] text-[oklch(0.649_0_0)]`}
        >
          <Search size={14} aria-hidden />
          <span className="font-geist text-xs tracking-[-0.08px]">
            Search Maps
          </span>
        </div>
      </div>
    </div>
  );
}
