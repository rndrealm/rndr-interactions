"use client";
import React, { useMemo, useRef, useState } from "react";
import type { IDemo } from "../demo";
import { animate, motion, useMotionValue } from "motion/react";
import { springFromResponse } from "../physics";
import { SliderRow } from "../slider-row";

const PRESETS = [
  { label: "Default", response: 0.55, dampingRatio: 0.825 },
  { label: "Snappy", response: 0.15, dampingRatio: 0.86 },
  { label: "Bouncy", response: 0.5, dampingRatio: 0.6 },
  { label: "Smooth", response: 0.5, dampingRatio: 1 },
];

const PILL = springFromResponse(0.35, 0.9);

const PLOT_W = 320;
const PLOT_H = 120;
const PLOT_SECONDS = 1.5;
// Ball 48px + the track's px-2 on both sides
const TRACK_INSET = 48 + 16;

// Step response from 0 to 1: integrated every 1ms, sampled every 10ms
const simulate = (stiffness: number, damping: number) => {
  const points: number[] = [];
  const dt = 1 / 1000;
  let position = 0;
  let velocity = 0;
  for (let i = 0; i <= PLOT_SECONDS * 1000; i++) {
    if (i % 10 === 0) points.push(position);
    velocity += (-stiffness * (position - 1) - damping * velocity) * dt;
    position += velocity * dt;
  }
  return points;
};

export function SpringDemo(props: IDemo) {
  const { embedded = false } = props;

  const [response, setResponse] = useState(0.55);
  const [dampingRatio, setDampingRatio] = useState(0.825);

  const trackRef = useRef<HTMLButtonElement>(null);
  const atEnd = useRef(false);
  const x = useMotionValue(0);

  const spring = springFromResponse(response, dampingRatio);

  const path = useMemo(() => {
    const points = simulate(spring.stiffness, spring.damping);
    // Room for overshoot above the target
    const yMin = Math.min(0, ...points);
    const yMax = Math.max(1.1, ...points);
    const toY = (v: number) => PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;
    return {
      line: points
        .map(
          (v, i) =>
            `${i ? "L" : "M"}${((i / (points.length - 1)) * PLOT_W).toFixed(1)} ${toY(v).toFixed(1)}`,
        )
        .join(""),
      targetY: toY(1),
    };
  }, [spring.stiffness, spring.damping]);

  const play = () => {
    const max = trackRef.current!.clientWidth - TRACK_INSET;
    atEnd.current = !atEnd.current;
    animate(x, atEnd.current ? max : 0, spring);
  };

  return (
    <div className="w-full flex items-center justify-center px-4 py-8">
      <div className="flex flex-col max-w-100 w-full gap-6">
        {!embedded && (
          <p className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
            Apple describes a spring with two numbers you can reason about
            instead of mass, stiffness and damping. Response is roughly how long
            it takes; damping ratio is how much it bounces, where 1 means none.
            Every other demo here is built on these. Tap the track to play.
          </p>
        )}

        <div className="flex flex-col gap-3 rounded-2xl bg-[oklch(0.961_0_0)] p-4">
          <svg
            viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
            className="h-32 w-full overflow-visible"
            preserveAspectRatio="none"
            aria-hidden
          >
            <line
              x1={0}
              x2={PLOT_W}
              y1={path.targetY}
              y2={path.targetY}
              stroke="oklch(0.865 0 0)"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={path.line}
              fill="none"
              stroke="rgb(3 47 98)"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="flex justify-between font-mono text-[10px] text-[oklch(0.649_0_0)]">
            <span>0s</span>
            <span>{PLOT_SECONDS}s</span>
          </div>
          <button
            ref={trackRef}
            type="button"
            aria-label="Play the spring"
            onClick={play}
            className="flex h-16 w-full cursor-pointer items-center rounded-full bg-[oklch(0.94_0_0)] px-2 outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.708_0_0)]"
          >
            <motion.span
              style={{ x }}
              className="size-12 rounded-full bg-white shadow-[0_0_0_1px_#0000001C,0_1px_3px_0_#00000017]"
            />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div
            role="group"
            aria-label="Presets"
            className="flex gap-1 rounded-xl bg-[oklch(0.982_0_0)] p-1"
          >
            {PRESETS.map((preset) => {
              // Lit only while the sliders match it exactly
              const isActive =
                preset.response === response &&
                preset.dampingRatio === dampingRatio;
              return (
                <button
                  key={preset.label}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setResponse(preset.response);
                    setDampingRatio(preset.dampingRatio);
                  }}
                  className={`relative flex-1 h-8 cursor-pointer rounded-lg font-geist text-sm leading-5 tracking-[-0.08px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(0.708_0_0)] ${isActive ? "text-[oklch(0.205_0_0)] font-medium" : "text-[oklch(0.556_0_0)] hover:text-[oklch(0.375_0_0)]"}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="spring-preset-pill"
                      transition={PILL}
                      className="absolute inset-0 rounded-lg bg-white shadow-[0_0_0_1px_#0000001C,0_1px_3px_0_#00000017]"
                    />
                  )}
                  <span className="relative">{preset.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-[oklch(0.982_0_0)] px-4 py-3">
            <SliderRow
              label="Response"
              value={response}
              min={0.1}
              max={1.5}
              step={0.01}
              onChange={setResponse}
              format={(v) => `${v.toFixed(2)}s`}
            />
            <SliderRow
              label="Damping ratio"
              value={dampingRatio}
              min={0.1}
              max={1.2}
              step={0.005}
              onChange={setDampingRatio}
              format={(v) => v.toFixed(3)}
            />
            <p className="truncate pt-1.5 font-mono text-xs tabular-nums text-[oklch(0.503_0_0)]">
              stiffness {spring.stiffness.toFixed(1)} · damping{" "}
              {spring.damping.toFixed(2)} · bounce{" "}
              {(1 - dampingRatio).toFixed(2)}
            </p>
          </div>
          <pre className="no-scrollbar overflow-x-auto rounded-xl bg-[oklch(0.982_0_0)] px-4 py-3 font-mono text-xs leading-relaxed text-[rgb(3_47_98)] w-full">
            {
              "stiffness = (2π / response)² · mass\ndamping   = 4π · dampingRatio · mass / response\nbounce    = 1 − dampingRatio"
            }
          </pre>
        </div>
      </div>
    </div>
  );
}
