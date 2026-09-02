"use client";

import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
}

export default function Loader({ className }: LoaderProps) {
  return (
    <div
      className={cn(
        "w-6.25 h-5 overflow-hidden text-[#f9f9f9]",
        className,
      )}
    >
      <div className="flex gap-[2px] h-full animate-[loader-slide_1.4s_ease-in-out_infinite]">
        <div className="w-[3px] h-full shrink-0 bg-current" />
        <div className="w-[15px] h-full shrink-0 bg-current" />
        <div className="w-[15px] h-full shrink-0 bg-current" />
        <div className="w-[3px] h-full shrink-0 bg-current" />
      </div>
    </div>
  );
}
