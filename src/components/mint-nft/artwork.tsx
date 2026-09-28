"use client";
import React from "react";
import { NftCanvas } from "./nft-canvas";
import { useMintProgress } from "./mint-progress";

/**
 * The piece as it appears on the mint page: driven by the mint sequence, so it
 * starts unrevealed and fills in a layer per sweep. A fixed clamped height rather
 * than an aspect ratio, so the frame keeps the proportions the shader's cover-fit
 * expects at any width and never grows past the fold on a short window.
 */
export function Artwork() {
  const { progress } = useMintProgress();

  return (
    <div className="relative h-[clamp(320px,58vh,620px)] w-full overflow-hidden rounded-[28px] bg-[oklch(0.96_0_0)] shadow-[0_0_0_1px_oklch(0.15_0_0/0.06),0_30px_70px_-40px_oklch(0.15_0_0/0.45)]">
      <NftCanvas progress={progress} />
    </div>
  );
}
