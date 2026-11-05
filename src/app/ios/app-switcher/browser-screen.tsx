import React from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
  Lock,
  Share,
} from "lucide-react";
import { SQUIRCLE } from "../squircle";

// Quick Browser mock: a placeholder article and Safari's bottom address bar
export function BrowserScreen() {
  return (
    <div className="relative w-full h-full flex flex-col bg-[oklch(0.982_0_0)]">
      <div className="flex flex-1 flex-col gap-4 overflow-hidden px-5 pt-12">
        <div
          className={`w-full aspect-video rounded-[10px] supports-[corner-shape:squircle]:rounded-[16px] ${SQUIRCLE} bg-[oklch(0.94_0_0)]`}
        ></div>
        <div className="flex flex-col gap-2">
          <div className="h-3 w-4/5 rounded-full bg-[oklch(0.894_0_0)]"></div>
          <div className="h-3 w-1/2 rounded-full bg-[oklch(0.894_0_0)]"></div>
        </div>
        <div className="flex flex-col gap-1.5">
          {[
            "w-full",
            "w-full",
            "w-11/12",
            "w-full",
            "w-3/4",
            "w-full",
            "w-5/6",
          ].map((width, index) => (
            <div
              key={index}
              className={`h-2 ${width} rounded-full bg-[oklch(0.94_0_0)]`}
            ></div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-3 pt-2 pb-9 bg-[oklch(0.961_0_0)] shadow-[0_-1px_0_0_#0000000A]">
        <div
          className={`flex h-9 items-center justify-center gap-1.5 rounded-[7px] supports-[corner-shape:squircle]:rounded-[12px] ${SQUIRCLE} bg-[oklch(0.993_0_0)] shadow-[0_0_0_1px_#0000000A,0_1px_2px_0_#0000000D] text-[oklch(0.649_0_0)]`}
        >
          <Lock size={10} aria-hidden />
          <span className="font-geist text-xs tracking-[-0.08px] text-[oklch(0.503_0_0)]">
            rndrealm.com
          </span>
        </div>
        <div className="flex items-center justify-between px-2 text-[oklch(0.649_0_0)]">
          <ChevronLeft size={18} aria-hidden />
          <ChevronRight size={18} className="opacity-40" aria-hidden />
          <Share size={16} aria-hidden />
          <BookOpen size={16} aria-hidden />
          <Copy size={16} aria-hidden />
        </div>
      </div>
    </div>
  );
}
