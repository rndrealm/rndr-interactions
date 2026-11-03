import React from "react";
import {
  ChevronDown,
  Ellipsis,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { SQUIRCLE } from "../mobile-sheet/page";

// Quick Music mock: the full-screen Now Playing player
export function MusicScreen() {
  return (
    <div className="relative w-full h-full flex flex-col px-6 pt-12 pb-10 bg-[oklch(0.982_0_0)]">
      <div className="flex items-center justify-between text-[oklch(0.649_0_0)]">
        <ChevronDown size={18} aria-hidden />
        <span className="font-geist text-[10px] font-medium leading-4 tracking-[-0.08px] text-[oklch(0.503_0_0)]">
          Now Playing
        </span>
        <Ellipsis size={18} aria-hidden />
      </div>

      <div
        className={`mt-8 w-full aspect-square rounded-[14px] supports-[corner-shape:squircle]:rounded-[24px] ${SQUIRCLE} bg-[oklch(0.918_0_0)] shadow-[0_8px_24px_0_#0000000D]`}
      ></div>

      <div className="mt-7 flex flex-col gap-0.5">
        <p className="font-geist text-sm font-medium leading-5 tracking-[-0.08px] text-[oklch(0.503_0_0)]">
          Slow Morning
        </p>
        <p className="font-geist text-xs leading-4 tracking-[-0.08px] text-[oklch(0.649_0_0)]">
          The Quiet Hours
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-1.5">
        <div className="h-1 w-full rounded-full bg-[oklch(0.918_0_0)]">
          <div className="h-full w-[38%] rounded-full bg-[oklch(0.649_0_0)]"></div>
        </div>
        <div className="flex justify-between font-geist text-[9px] leading-3 tabular-nums text-[oklch(0.649_0_0)]">
          <span>1:24</span>
          <span>-2:16</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-center gap-10 text-[oklch(0.503_0_0)]">
        <SkipBack size={20} fill="currentColor" aria-hidden />
        <Play size={28} fill="currentColor" aria-hidden />
        <SkipForward size={20} fill="currentColor" aria-hidden />
      </div>
    </div>
  );
}
