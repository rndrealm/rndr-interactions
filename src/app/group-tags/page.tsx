"use client";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
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
    <main className="w-screen h-screen flex items-center justify-center bg-[#0B0B0B]">
      <div className="flex flex-wrap max-w-[500px] gap-2">
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
              layout
              initial={false}
              animate={{ width: targetWidth }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              onClick={() => toggleTag(token)}
              className={cn(
                "pl-4.5 pr-3.5 py-1.5 rounded-full border cursor-pointer flex items-center whitespace-nowrap overflow-hidden",
                isSelected
                  ? "border-[#4CAF82]/80 text-[#4CAF82]"
                  : "border-[#262626] text-white/80",
              )}
              style={{
                background: isSelected
                  ? "#4CAF8218"
                  : "linear-gradient(180deg, #171717 0%, #141414 106.94%)",
              }}
            >
              <span className="text-sm font-medium">{token}</span>
              <div className="w-0 shrink-0 overflow-visible">
                <div
                  className="ml-2 size-3 rounded-full p-0.5 flex items-center justify-center bg-[#4CAF82]"
                  style={{ opacity: isSelected ? 1 : 0 }}
                >
                  <Check className="stroke-[#262626]" strokeWidth={4} />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </main>
  );
};

export default GroupTags;
