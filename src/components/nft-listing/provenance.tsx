"use client";
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar } from "@/components/nft-ui/identity";
import { ExternalIcon, Section } from "@/components/nft-ui/section";
import { HAIRLINE, INK, MUTED } from "@/components/nft-ui/ui";
import { BUY_NOW_ETH, eth, useListing } from "./listing-state";

type Entry = {
  id: string;
  action: string;
  handle: string;
  date: string;
  value?: string;
};

/** Fixed strings rather than formatted Dates — the server and the client have to
 *  agree on these, and a relative "9 months ago" would drift between them. */
const HISTORY: Entry[] = [
  {
    id: "price",
    action: "Buy Now price set by",
    handle: "rndrealm",
    date: "Jan 27, 2026 at 11:45am",
    value: eth(BUY_NOW_ETH),
  },
  {
    id: "listed",
    action: "Listed by",
    handle: "rndrealm",
    date: "Oct 29, 2025 at 2:04pm",
    value: "0.05 ETH",
  },
  {
    id: "minted",
    action: "Minted by",
    handle: "rndrealm",
    date: "Oct 29, 2025 at 2:02pm",
  },
];

function Row({ entry }: { entry: Entry }) {
  return (
    <div className="flex items-center gap-4 py-5">
      <Avatar seed={entry.handle} size={44} />
      <div className="min-w-0 flex-1">
        <p className={`text-[16px] leading-6 font-semibold tracking-[-0.01em] ${INK}`}>
          {entry.action} <span className={MUTED}>@{entry.handle}</span>
        </p>
        <p className={`text-[14px] leading-5 ${MUTED}`}>{entry.date}</p>
      </div>
      {entry.value && (
        <p
          className={`text-[17px] leading-6 font-semibold tabular-nums tracking-[-0.01em] ${INK}`}
        >
          {entry.value}
        </p>
      )}
      <a
        href="#"
        aria-label="View transaction"
        // 40x40 target around a 16px icon, per the minimum hit area.
        className={`grid size-10 place-items-center rounded-full transition-colors duration-150 hover:bg-[oklch(0.96_0_0)] ${MUTED} hover:text-[oklch(0.15_0_0)]`}
      >
        <ExternalIcon />
      </a>
    </div>
  );
}

export function Provenance() {
  const { status } = useListing();

  return (
    <Section title="Provenance">
      <div className="-mt-5">
        {/* initial={false} so the settled history doesn't animate on page load —
            only the row the sale itself adds. */}
        <AnimatePresence initial={false}>
          {status === "owned" && (
            <motion.div
              key="bought"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            >
              <Row
                entry={{
                  id: "bought",
                  action: "Bought by",
                  handle: "you",
                  date: "Just now",
                  value: eth(BUY_NOW_ETH),
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {HISTORY.map((entry, index) => (
          <div key={entry.id}>
            {(index > 0 || status === "owned") && (
              <div className={`h-px w-full ${HAIRLINE}`} />
            )}
            <Row entry={entry} />
          </div>
        ))}
      </div>
    </Section>
  );
}
