"use client";
import React from "react";
import { AmountSelector } from "./amount-selector";
import { MintButton } from "./mint-button";
import { HandleChip } from "@/components/nft-ui/identity";
import { PRICE_ETH, useMintProgress } from "./mint-progress";
import { OutlinePill } from "@/components/nft-ui/pill-button";
import { CARD_SHADOW, HAIRLINE, INK, MUTED } from "@/components/nft-ui/ui";

function Quote({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <p className={`text-[15px] leading-5 ${MUTED}`}>{label}</p>
        <p
          className={`text-[32px] leading-10 font-semibold tabular-nums tracking-[-0.035em] ${INK}`}
        >
          {value}
        </p>
      </div>
      {children}
    </div>
  );
}

export function TradeCard() {
  const { total } = useMintProgress();

  return (
    <div className="flex flex-col">
      <div className={`rounded-3xl bg-white ${CARD_SHADOW}`}>
        <div className="flex flex-col sm:flex-row">
          <Quote label="Mint price" value={PRICE_ETH.toFixed(2) + " ETH"}>
            <MintButton />
          </Quote>

          {/* Hairline only where the two quotes actually sit side by side. */}
          <div className={`hidden w-px self-stretch sm:block ${HAIRLINE}`} />
          <div className={`h-px w-full sm:hidden ${HAIRLINE}`} />

          <Quote label="Total" value={total}>
            <AmountSelector />
          </Quote>
        </div>

        <div className={`h-px w-full ${HAIRLINE}`} />

        <div className="flex items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-2.5">
            <span className="size-1.5 rounded-full bg-[oklch(0.72_0.16_150)]" />
            <p className={`text-[15px] leading-5 ${MUTED}`}>
              Mainnet &middot; 24 gwei
            </p>
          </div>

          <OutlinePill href="#">View contract</OutlinePill>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        <p className={`text-[15px] leading-5 font-semibold ${INK}`}>Deployed by</p>
        <HandleChip handle="rndrealm" />
      </div>
    </div>
  );
}
