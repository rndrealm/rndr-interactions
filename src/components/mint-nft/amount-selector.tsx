"use client";
import React, { useRef } from "react";
import { AMOUNTS, useMintProgress } from "./mint-progress";

/**
 * Sits in the slot a marketplace would give "Place bid", so the pills match that
 * button's height — three of them fill the same 56px row the mint button occupies
 * opposite. Selection lives in the mint context because the card quotes a total
 * and the provenance row quotes it again after a successful mint.
 */
export function AmountSelector() {
  const { amount, setAmount, status } = useMintProgress();
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const disabled = status !== "idle";

  /** Arrow keys move the selection, the way a radio group is expected to behave. */
  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (step === 0) return;

    event.preventDefault();
    const next = (index + step + AMOUNTS.length) % AMOUNTS.length;
    setAmount(AMOUNTS[next]);
    buttonsRef.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label="Amount to mint"
      className="flex gap-2"
    >
      {AMOUNTS.map((option, index) => {
        const isSelected = option === amount;

        return (
          <button
            key={option}
            ref={(node) => {
              buttonsRef.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            disabled={disabled}
            onClick={() => setAmount(option)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`h-14 flex-1 rounded-full text-[16px] leading-6 font-semibold tabular-nums tracking-[-0.01em] transition-[background-color,color,box-shadow,scale] duration-150 not-disabled:active:scale-[0.96] disabled:cursor-default disabled:opacity-40 ${
              isSelected
                ? "bg-[oklch(0.15_0_0)] text-white shadow-[0_1px_2px_oklch(0.15_0_0/0.20)]"
                : "bg-white text-[oklch(0.35_0_0)] shadow-[0_0_0_1px_oklch(0.15_0_0/0.10)] not-disabled:hover:shadow-[0_0_0_1px_oklch(0.15_0_0/0.24)] not-disabled:hover:text-[oklch(0.15_0_0)]"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
