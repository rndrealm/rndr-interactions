"use client";
import React, { useId } from "react";

interface ISliderRow {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

// Same slider as the rubber band demo: a label and mono readout above a
// thin track. The input is 44px tall for touch, pulled back with -my so it
// only takes the track's space in the layout.
export function SliderRow(props: ISliderRow) {
  const { label, value, min, max, step, onChange, format } = props;
  const id = useId();

  return (
    <div className="flex flex-col gap-3 py-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]"
        >
          {label}
        </label>
        <span className="font-mono text-xs tabular-nums text-[rgb(3_47_98)]">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="-my-4.75 h-11 w-full cursor-pointer touch-none appearance-none rounded-full bg-transparent outline-none focus-visible:ring-2 [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[oklch(0.865_0_0)] [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[oklch(0.865_0_0)] [&::-webkit-slider-thumb]:-mt-1.25 focus-visible:ring-[oklch(0.708_0_0)] focus-visible:ring-offset-2 [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_0_0_1px_#0000001C,0_1px_3px_0_#00000017] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_#0000001C,0_1px_3px_0_#00000017]"
      />
    </div>
  );
}
