"use client";
import React from "react";
import { HandleChip } from "@/components/nft-ui/identity";
import { OutlinePill } from "@/components/nft-ui/pill-button";
import { CARD_SHADOW, HAIRLINE, INK, MUTED } from "@/components/nft-ui/ui";
import { BuyButton } from "./buy-button";
import { BUY_NOW_ETH, RESERVE_ETH, eth, useListing } from "./listing-state";

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

export function ListingCard() {
  const { owner } = useListing();

  return (
    <div className="flex flex-col">
      <div className={`rounded-3xl bg-white ${CARD_SHADOW}`}>
        <div className="flex flex-col sm:flex-row">
          <Quote label="Buy Now" value={eth(BUY_NOW_ETH)}>
            <BuyButton />
          </Quote>

          {/* Hairline only where the two quotes actually sit side by side. */}
          <div className={`hidden w-px self-stretch sm:block ${HAIRLINE}`} />
          <div className={`h-px w-full sm:hidden ${HAIRLINE}`} />

          <Quote label="Reserve" value={eth(RESERVE_ETH)}>
            <OutlinePill size="lg">Place bid</OutlinePill>
          </Quote>
        </div>

        <div className={`h-px w-full ${HAIRLINE}`} />

        <div className="flex items-center justify-between gap-4 p-6">
          <p className={`text-[15px] leading-5 ${MUTED}`}>Minted 9 months ago</p>
          <OutlinePill>Make offer</OutlinePill>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        <p className={`text-[15px] leading-5 font-semibold ${INK}`}>Owned by</p>
        {/* Keyed on the handle so the chip — avatar included — swaps outright
            when the sale clears rather than morphing one face into another. */}
        <HandleChip key={owner} handle={owner} />
      </div>
    </div>
  );
}
