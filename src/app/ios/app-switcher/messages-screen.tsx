import React from "react";
import { ArrowUp, ChevronLeft, Plus } from "lucide-react";
import { SQUIRCLE } from "../mobile-sheet/page";

const MESSAGES = [
  { from: "them", text: "Are we still on for tonight?" },
  { from: "me", text: "Yes! 7 at the usual place" },
  { from: "them", text: "Perfect, I'll grab a table" },
  { from: "me", text: "See you there" },
];

// Quick Messages mock: one conversation, bubbles and the compose bar
export function MessagesScreen() {
  return (
    <div className="relative w-full h-full flex flex-col bg-[oklch(0.982_0_0)]">
      <div className="flex flex-col items-center gap-1 px-4 pt-10 pb-3 bg-[oklch(0.961_0_0)] relative">
        <ChevronLeft
          size={18}
          className="absolute left-3 top-14 text-[oklch(0.649_0_0)]"
          aria-hidden
        />
        <div className="size-9 rounded-full bg-[oklch(0.894_0_0)]"></div>
        <span className="font-geist text-[10px] font-medium leading-4 tracking-[-0.08px] text-[oklch(0.503_0_0)]">
          Ada
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-1.5 px-3 pb-3">
        {MESSAGES.map((message, index) => {
          const isMe = message.from === "me";
          return (
            <p
              key={index}
              className={`max-w-[75%] px-3 py-1.5 rounded-[11px] supports-[corner-shape:squircle]:rounded-[18px] ${SQUIRCLE} font-geist text-[11px] leading-4 tracking-[-0.08px] ${isMe ? "self-end bg-[oklch(0.894_0_0)] text-[oklch(0.375_0_0)]" : "self-start bg-[oklch(0.94_0_0)] text-[oklch(0.503_0_0)]"}`}
            >
              {message.text}
            </p>
          );
        })}
      </div>

      <div className="flex items-center gap-2 px-3 pt-1 pb-9">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[oklch(0.94_0_0)] text-[oklch(0.649_0_0)]">
          <Plus size={14} aria-hidden />
        </div>
        <div className="flex h-7 flex-1 items-center justify-between rounded-full pl-3 pr-0.5 shadow-[0_0_0_1px_#0000000A] bg-[oklch(0.993_0_0)]">
          <span className="font-geist text-[11px] tracking-[-0.08px] text-[oklch(0.649_0_0)]">
            iMessage
          </span>
          <div className="flex size-6 items-center justify-center rounded-full bg-[oklch(0.865_0_0)] text-[oklch(0.993_0_0)]">
            <ArrowUp size={12} strokeWidth={2.5} aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
