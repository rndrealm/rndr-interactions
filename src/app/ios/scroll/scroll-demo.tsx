"use client";
import React, { useEffect, useRef, useState } from "react";
import type { IDemo } from "../demo";
import { useDrag } from "../use-drag";
import { animate, useMotionValue, motion } from "motion/react";
import {
  applyRubberBand,
  clamp,
  DECELERATION,
  project,
  springFromResponse,
} from "../physics";

const bgs = ["oklch(0.982 0 0)", "oklch(0.961 0 0)", "oklch(0.94 0 0)"];

const GAP = 24;
const BOUNCE = springFromResponse(0.5, 1);
const PAGE = springFromResponse(0.4, 1);

type Mode = "normal" | "fast" | "paging";

const MODES: { value: Mode; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "fast", label: "Fast" },
  { value: "paging", label: "Paging" },
];

const PILL = springFromResponse(0.35, 0.9);

export function ScrollDemo(props: IDemo) {
  const { embedded = false } = props;

  const [mode, setMode] = useState<Mode>("normal");

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const origin = useRef(0);
  const frame = useRef<number>(null);

  const getMin = () =>
    Math.min(
      0,
      containerRef.current!.clientWidth - trackRef.current!.scrollWidth,
    );

  const x = useMotionValue(0);

  const stop = () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    x.stop();
  };

  // eslint-disable-next-line
  useEffect(() => stop, []);

  // position(t) = p0 + v0 · (rate^t − 1) / (1000 · ln(rate))
  const coast = (v0: number, rate: number) => {
    const min = getMin();
    const p0 = x.get();
    const t0 = performance.now();
    const lnRate = Math.log(rate);

    const tick = () => {
      const t = performance.now() - t0;
      const decay = Math.pow(rate, t);
      const position = p0 + (v0 * (decay - 1)) / (1000 * lnRate);
      const velocity = v0 * decay;

      // Hit an edge mid-flight: hand the remaining speed to a spring so it bounces
      if (position > 0 || position < min) {
        const edge = clamp(position, min, 0);
        x.set(edge);
        animate(x, edge, { ...BOUNCE, velocity });
        return;
      }

      x.set(position);
      if (Math.abs(velocity) > 10) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
  };

  const drag = useDrag({
    onStart: () => {
      stop();
      origin.current = x.get();
    },
    onMove: (delta) => {
      x.set(
        applyRubberBand(
          origin.current + delta.x,
          getMin(),
          0,
          containerRef.current!.clientWidth,
        ),
      );
    },

    onEnd: (velocity) => {
      const min = getMin();
      const position = x.get();

      if (position > 0 || position < min) {
        animate(x, clamp(position, min, 0), {
          ...BOUNCE,
          velocity: velocity.x,
        });
        return;
      }

      if (mode === "paging") {
        const step = cardRef.current!.clientWidth + GAP;
        const landing = position + project(velocity.x, DECELERATION.fast);
        const target = clamp(Math.round(landing / step) * step, min, 0);
        animate(x, target, { ...PAGE, velocity: velocity.x });
        return;
      }

      const rate = mode === "fast" ? DECELERATION.fast : DECELERATION.normal;
      coast(velocity.x, rate);
    },
  });

  return (
    <div className="w-full flex items-center justify-center px-4 py-8">
      <div className="flex flex-col gap-6 max-w-100 w-full">
        {!embedded && (
          <p className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
            A custom scroller with Apple-style scroll friction. Speed is
            multiplied by the rate every millisecond. “Fast” stops sooner.
            “Paging” projects the flick and snaps to the nearest card, like App
            Store carousels. Both ends rubber band and bounce.
          </p>
        )}
        <div
          ref={containerRef}
          {...drag}
          className="relative cursor-grab touch-none select-none overflow-hidden rounded-2xl border border-white/10  py-6 active:cursor-grabbing max-w-100 w-full bg-[oklch(0.865_0_0)]"
        >
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="w-max flex px-6 gap-6"
          >
            {Array(16)
              .fill(0)
              .map((_, index) => {
                return (
                  <div
                    ref={index === 0 ? cardRef : undefined}
                    onClick={() => {}}
                    key={index}
                    className="flex h-56 shrink-0 items-end rounded-xl p-4 text-sm font-medium text-white/90"
                    style={{
                      width: 120,
                      background: bgs[index % bgs.length],
                    }}
                  >
                    <p className="text-xs leading-3.5 text-[oklch(0.503_0_0)]">
                      {index + 1}
                    </p>
                  </div>
                );
              })}
          </motion.div>
        </div>

        <div className="flex flex-col gap-2">
          <div
            role="group"
            aria-label="Scroll mode"
            className="flex gap-1 rounded-xl bg-[oklch(0.982_0_0)] p-1"
          >
            {MODES.map((item) => {
              const isActive = item.value === mode;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setMode(item.value)}
                  className={`relative flex-1 h-8 cursor-pointer rounded-lg font-geist text-sm leading-5 tracking-[-0.08px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(0.708_0_0)] ${isActive ? "text-[oklch(0.205_0_0)] font-medium" : "text-[oklch(0.556_0_0)] hover:text-[oklch(0.375_0_0)]"}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="scroll-mode-pill"
                      transition={PILL}
                      className="absolute inset-0 rounded-lg bg-white shadow-[0_0_0_1px_#0000001C,0_1px_3px_0_#00000017]"
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </button>
              );
            })}
          </div>
          <pre className="no-scrollbar overflow-x-auto rounded-xl bg-[oklch(0.982_0_0)] px-4 py-3 font-mono text-xs leading-relaxed text-[rgb(3_47_98)] w-full">
            {
              "velocity(t) = v0 · rate^t\nposition(t) = p0 + v0 · (rate^t − 1) / (1000 · ln rate)\nrate: 0.998 normal, 0.99 fast"
            }
          </pre>
        </div>
      </div>
    </div>
  );
}
