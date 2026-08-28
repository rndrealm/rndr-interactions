"use client";
import { cn } from "@/lib/utils";
import React, { useCallback, useRef, useState } from "react";
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
const STAGGER_MS = 100;

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
  const [isStaggering, setIsStaggering] = useState(false);
  const staggerTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

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
    if (isStaggering) return;
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleAll = () => {
    if (isStaggering) return;

    const allSelected = tokens.every((t) => selectedTags.includes(t));
    const selecting = !allSelected;

    const toToggle = tokens
      .filter((t) =>
        selecting ? !selectedTags.includes(t) : selectedTags.includes(t),
      )
      .sort(() => Math.random() - 0.5);

    if (toToggle.length === 0) return;

    setIsStaggering(true);
    staggerTimers.current.forEach(clearTimeout);
    staggerTimers.current = [];

    toToggle.forEach((tag, i) => {
      const timer = setTimeout(() => {
        setSelectedTags((prev) =>
          selecting ? [...prev, tag] : prev.filter((t) => t !== tag),
        );
        if (i === toToggle.length - 1) setIsStaggering(false);
      }, i * STAGGER_MS);
      staggerTimers.current.push(timer);
    });
  };

  return (
    <main
      className="w-screen h-screen flex items-center justify-center"
      style={{ background: THEME.page }}
    >
      <div className="flex flex-col items-start">
        {/* Rows need more clearance than columns: the ambient shadow reaches ~16px, so
            at an even 8px gap it lands on the pills in the next row instead of on the
            page. */}
        <div className="flex flex-wrap max-w-140 gap-x-2 gap-y-4">
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
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              onClick={() => toggleTag(token)}
              className={cn(
                "pl-4.5 pr-3.5 py-1.5 rounded-full border-none cursor-pointer flex items-center whitespace-nowrap overflow-hidden",
                "transition-colors duration-200 ease-out",
                isSelected ? PILL_SURFACE.selected : PILL_SURFACE.idle,
                isStaggering && "pointer-events-none",
              )}
              style={{
                color: isSelected ? THEME.textActive : THEME.text,
                boxShadow: PILL_SHADOW,
              }}
            >
              <span className="text-sm font-medium">{token}</span>
              <div className="w-0 shrink-0 overflow-visible">
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden
                  className="ml-2 size-3 transition-opacity duration-200"
                  style={{ opacity: isSelected ? 1 : 0 }}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6 1C8.7614 1 11 3.23858 11 6C11 8.7614 8.7614 11 6 11C3.23858 11 1 8.7614 1 6C1 3.23858 3.23858 1 6 1ZM7.7793 4.08545C7.55025 3.9313 7.2397 3.99178 7.08545 4.22071L5.23635 6.9668L4.35352 6.084C4.15826 5.8887 3.84175 5.8887 3.64649 6.084C3.45122 6.27925 3.45122 6.59575 3.64649 6.791L4.95899 8.1035C5.06465 8.20915 5.21215 8.26195 5.36085 8.24755C5.5094 8.2331 5.64365 8.1531 5.72705 8.0293L7.91455 4.7793C8.0687 4.55028 8.00825 4.23969 7.7793 4.08545Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </motion.button>
          );
        })}
        </div>

        {/* mt-20 rather than a column gap: the grid's ambient shadow already reaches
            ~16px past its last row, so the 80px is measured from the pills themselves. */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          onClick={toggleAll}
          className={cn(
            "mt-20 px-4.5 py-1.5 rounded-full border-none cursor-pointer whitespace-nowrap",
            "transition-colors duration-200 ease-out",
            PILL_SURFACE.idle,
            isStaggering && "pointer-events-none",
          )}
          style={{
            color: THEME.text,
            boxShadow: PILL_SHADOW,
          }}
        >
          <span className="text-sm font-medium">
            {tokens.every((t) => selectedTags.includes(t))
              ? "Deselect All"
              : "Select All"}
          </span>
        </motion.button>
      </div>
    </main>
  );
};

export default GroupTags;
