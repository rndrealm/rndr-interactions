"use client";
import { cn } from "@/lib/utils";
import React, { useCallback, useState } from "react";
import { motion } from "motion/react";

const tokens = [
  "NFT",
  "Trading Bots",
  "DeFi",
  "Staking",
  "Layer 2",
  "DAOs",
  "Yield Farming",
  "Metaverse",
  "Web3",
  "Smart Contracts",
  "Tokenomics",
  "Cross-Chain",
  "ZK Proofs",
  "Airdrops",
  "Governance",
  "Liquidity Pools",
];

const ICON_SPACE = 20;

// Pill and page are the same white — the stroke, contact shadow and ambient shadow are
// the only things drawing the pill, so it reads as raised paper rather than a fill.
// The pill surfaces themselves live in PILL_SURFACE below, as classes, for hover.
const THEME = {
  page: "#ffffff",
  text: "oklch(64.34% 0 0)",
  textActive: "#1f1f1f",
};

// Hover and selected are both a hair off white — hover the lighter of the two, so
// pointing at a pill never looks further along than committing to it. Kept as literal
// classes rather than inline style so hover stays in CSS and costs no re-render.
const PILL_SURFACE = {
  idle: "bg-white hover:bg-[#f9f9f9]",
  selected: "bg-[#f8f8f8]",
};

// 1px stroke, contact shadow, soft ambient — stacked tightest-to-widest. The two
// shadow layers run 30% lighter than the reference; the stroke is left at full weight
// since it is the pill's edge, not its shadow, and it is all that holds the shape on
// a white page.
const PILL_SHADOW = [
  "0 0 0 1px rgba(0, 0, 0, 0.07)",
  "0 1px 2px rgba(0, 0, 0, 0.042)",
  "0 6px 16px rgba(0, 0, 0, 0.056)",
].join(", ");

// The selected pill turned inside out: its #f8f8f8 surface and black label swapped for
// each other's inverse. Only the stroke flips with them — it is part of the surface, so
// a black stroke on a black pill would vanish. The contact and ambient layers are cast
// onto the white page rather than drawn on the pill, so they stay dark.
const GroupTags = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [widths, setWidths] = useState<Map<string, number>>(new Map());

  const buttonRef = useCallback(
    (token: string) => (el: HTMLButtonElement | null) => {
      if (el) {
        setWidths((prev) => {
          if (prev.has(token)) return prev;
          const next = new Map(prev);
          next.set(token, el.getBoundingClientRect().width);
          return next;
        });
      }
    },
    [],
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <main
      className="w-screen h-screen flex items-center justify-center"
      style={{ background: THEME.page }}
    >
      {/* Rows need more clearance than columns: the ambient shadow reaches ~16px, so at
          an even 8px gap it lands on the pills in the next row instead of on the page. */}
      <div className="flex flex-wrap max-w-125 gap-x-2 gap-y-4">
        {tokens.map((token) => {
          const isSelected = selectedTags.includes(token);
          const baseWidth = widths.get(token);
          const targetWidth = baseWidth
            ? isSelected
              ? baseWidth + ICON_SPACE
              : baseWidth
            : "auto";

          return (
            <motion.button
              key={token}
              ref={buttonRef(token)}
              layout="size"
              initial={false}
              animate={{ width: targetWidth }}
              // 0.96 is the floor for a press — below 0.95 it stops reading as tactile
              // and starts reading as a bounce. Driven by the same spring as the width
              // so a release mid-press is interrupted rather than queued.
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              onClick={() => toggleTag(token)}
              className={cn(
                "pl-4.5 pr-3.5 py-1.5 rounded-full border-none cursor-pointer flex items-center whitespace-nowrap overflow-hidden",
                "transition-colors duration-200 ease-out",
                isSelected ? PILL_SURFACE.selected : PILL_SURFACE.idle,
              )}
              style={{
                color: isSelected ? THEME.textActive : THEME.text,
                boxShadow: PILL_SHADOW,
              }}
            >
              <span className="text-sm font-medium">{token}</span>
              <div className="w-0 shrink-0 overflow-visible">
                {/* One filled disc with the tick knocked out of it via evenodd, so the
                    check is a hole showing the pill surface rather than a second shape
                    that has to be kept in sync with it. */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="ml-2 size-3 transition-opacity duration-200"
                  style={{ opacity: isSelected ? 1 : 0 }}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM15.667 8.12695C15.3228 7.89661 14.8574 7.98889 14.627 8.33301L10.4482 14.5723L8.28125 12.3945C7.98911 12.1009 7.51434 12.0995 7.2207 12.3916C6.92733 12.6838 6.9267 13.1586 7.21875 13.4521L10.0312 16.2793C10.1897 16.4384 10.4112 16.5177 10.6348 16.4961C10.8584 16.4744 11.0605 16.3537 11.1855 16.167L15.873 9.16699C16.1034 8.82283 16.0111 8.35739 15.667 8.12695Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </motion.button>
          );
        })}
      </div>
    </main>
  );
};

export default GroupTags;
