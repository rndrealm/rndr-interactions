import React from "react";

export function Footer() {
  return (
    <div className="px-6 py-3 flex items-center justify-between border-t border-b border-[oklch(0.75_0.005_240)]">
      <div className="w-50 h-3 bg-[oklch(0.918_0_0)]"></div>
      <p className="uppercase text-[oklch(0.4_0.005_240)] text-[10px] leading-3 tracking-wider">
        Gas Estimate: 24 Gwei
      </p>

      <p className="uppercase text-[oklch(0.4_0.005_240)] text-[10px] leading-3 tracking-wider">
        Contract: 0x4f...92d1
      </p>
    </div>
  );
}
