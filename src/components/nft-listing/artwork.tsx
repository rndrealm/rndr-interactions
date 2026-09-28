"use client";
import React from "react";
import { useMotionValue } from "motion/react";
import { NftCanvas } from "@/components/mint-nft/nft-canvas";
import { SWEEPS } from "@/components/mint-nft/mint-progress";

/**
 * The same piece as the mint page, pinned at SWEEPS so it renders fully revealed
 * — nothing on a secondary listing animates the reveal, the token already exists.
 * A motion value rather than a number because that is what the canvas reads per
 * frame; this one simply never changes.
 */
export function Artwork() {
  const progress = useMotionValue(SWEEPS);

  return (
    <div className="relative h-[clamp(320px,58vh,620px)] w-full overflow-hidden rounded-[28px] bg-[oklch(0.96_0_0)] shadow-[0_0_0_1px_oklch(0.15_0_0/0.06),0_30px_70px_-40px_oklch(0.15_0_0/0.45)]">
      <NftCanvas progress={progress} />
    </div>
  );
}
