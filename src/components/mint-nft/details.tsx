import React from "react";
import { ExternalIcon, Section } from "@/components/nft-ui/section";
import { HAIRLINE, INK, MUTED } from "@/components/nft-ui/ui";

const ROWS: [label: string, value: string, mono?: boolean][] = [
  ["Contract address", "0x4f2e…92d1", true],
  ["Token standard", "ERC-721"],
  ["Chain", "Ethereum"],
  ["Metadata", "IPFS, frozen"],
];

/** Placeholder mark for the explorer link — a hexagon, so it reads as a chain
 *  logo without borrowing one. */
function ExplorerMark() {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[oklch(0.15_0_0)]">
      <svg viewBox="0 0 16 16" width={14} height={14} aria-hidden="true">
        <path
          d="M8 1.7 13.5 5v6L8 14.3 2.5 11V5z"
          fill="none"
          stroke="white"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Details() {
  return (
    <Section title="Details">
      <dl className="-mt-1">
        {ROWS.map(([label, value, mono], index) => (
          <div key={label}>
            {index > 0 && <div className={`h-px w-full ${HAIRLINE}`} />}
            <div className="flex items-baseline justify-between gap-6 py-4">
              <dt className={`text-[16px] leading-6 ${MUTED}`}>{label}</dt>
              <dd
                className={`text-[16px] leading-6 font-semibold tracking-[-0.01em] ${INK} ${
                  mono ? "font-mono text-[15px] tabular-nums" : ""
                }`}
              >
                {value}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <a
        href="#"
        className={`group mt-2 -ml-3 inline-flex h-11 items-center gap-3 rounded-full px-3 transition-colors duration-150 hover:bg-[oklch(0.96_0_0)]`}
      >
        <ExplorerMark />
        <span
          className={`text-[16px] leading-6 font-semibold tracking-[-0.01em] ${INK}`}
        >
          View on Etherscan
        </span>
        <ExternalIcon
          className={`${MUTED} transition-colors duration-150 group-hover:text-[oklch(0.15_0_0)]`}
        />
      </a>
    </Section>
  );
}
