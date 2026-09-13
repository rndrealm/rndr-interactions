"use client";
import React from "react";
import { TextMorph } from "torph/react";
import { useMintProgress, type MintStatus } from "./mint-progress";

const LABEL: Record<MintStatus, string> = {
  idle: "MINT NOW",
  loading: "MINTING",
  success: "MINTED SUCCESSFULLY",
};

export function MintButton() {
  const { status, mint } = useMintProgress();

  return (
    <button
      type="button"
      onClick={mint}
      disabled={status !== "idle"}
      aria-busy={status === "loading"}
      className={status === "idle" ? "cursor-pointer" : "cursor-default"}
    >
      <div className="w-full h-12 bg-[oklch(0.2_0.003_240)] flex justify-between items-center px-4">
        {/* One TextMorph instance for every status — remount it and the label
            hard-swaps instead of morphing. */}
        <TextMorph
          as="p"
          className="text-[oklch(0.982_0_0)] text-base leading-5.5"
          scale={false}
          duration={320}
        >
          {LABEL[status]}
        </TextMorph>
        <div className="w-5 h-5 bg-[oklch(0.918_0_0)]"></div>
      </div>
    </button>
  );
}
