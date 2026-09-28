"use client";
import React from "react";
import { TextMorph } from "torph/react";
import { useListing, type PurchaseStatus } from "./listing-state";

const LABEL: Record<PurchaseStatus, string> = {
  idle: "Buy Now",
  confirming: "Confirming",
  owned: "Owned",
};

export function BuyButton() {
  const { status, buy } = useListing();

  return (
    <button
      type="button"
      onClick={buy}
      disabled={status !== "idle"}
      aria-busy={status === "confirming"}
      className={`h-14 w-full rounded-full bg-[oklch(0.15_0_0)] transition-[background-color,scale] duration-150 not-disabled:cursor-pointer not-disabled:hover:bg-[oklch(0.25_0_0)] not-disabled:active:scale-[0.96] disabled:cursor-default ${
        status === "confirming" ? "opacity-70" : ""
      }`}
    >
      {/* One TextMorph instance for every status — remount it and the label
          hard-swaps instead of morphing. */}
      <TextMorph
        as="span"
        className="block text-center text-[16px] leading-6 font-semibold tracking-[-0.01em] text-white"
        scale={false}
        duration={320}
      >
        {LABEL[status]}
      </TextMorph>
    </button>
  );
}
