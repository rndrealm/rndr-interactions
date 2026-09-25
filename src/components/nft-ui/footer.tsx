import React from "react";
import { HAIRLINE, MUTED } from "./ui";

const META = ["Gas estimate: 24 gwei", "Contract: 0x4f2e…92d1"];

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className={`h-px w-full ${HAIRLINE}`} />
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-8 gap-y-2 px-6 py-6 md:px-10">
        <p className={`text-[13px] leading-5 ${MUTED}`}>
          rndr realm &copy; 2026
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          {META.map((item) => (
            <p key={item} className={`text-[13px] leading-5 tabular-nums ${MUTED}`}>
              {item}
            </p>
          ))}
        </div>
      </div>
    </footer>
  );
}
