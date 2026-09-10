"use client";
import React, { useRef, useState } from "react";

const DEFAULT_OPTIONS = [1, 2, 3];

type AmountSelectorProps = {
  /** Selectable mint amounts. Defaults to 1–3, matching the per-wallet limit. */
  options?: number[];
  defaultValue?: number;
};

export function AmountSelector({
  options = DEFAULT_OPTIONS,
  defaultValue = DEFAULT_OPTIONS[0],
}: AmountSelectorProps) {
  const [selected, setSelected] = useState(defaultValue);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

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
    const next = (index + step + options.length) % options.length;
    setSelected(options[next]);
    buttonsRef.current[next]?.focus();
  }

  return (
    <div role="radiogroup" aria-label="Select amount" className="flex gap-2">
      {options.map((option, index) => {
        const isSelected = option === selected;

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
            onClick={() => setSelected(option)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`rounded-[20px] text-xs leading-4 tracking-0 h-6.5 w-12 border cursor-pointer transition-colors ${
              isSelected
                ? "bg-[oklch(0.2_0.003_240)] border-[oklch(0.2_0.003_240)] text-[oklch(0.982_0_0)]"
                : "border-[oklch(0.4_0.005_240)] text-[oklch(0.4_0.005_240)] hover:border-[oklch(0.2_0.003_240)] hover:text-[oklch(0.2_0.003_240)]"
            }`}
          >
            {String(option).padStart(2, "0")}
          </button>
        );
      })}
    </div>
  );
}
