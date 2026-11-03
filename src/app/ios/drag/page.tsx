"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { motion, useMotionValue } from "motion/react";
import { useDrag } from "../use-drag";
import { applyRubberBand, clamp, springFromResponse } from "../physics";
import { animate } from "motion";

const PADDING = 16;
const SETTLE = springFromResponse(0.5, 0.8);

// Keep in sync with w-100 h-70 (container) and w-20 h-20 (box) below. The
// centre is computed up front so the server-rendered HTML is already centred.
const CONTAINER_WIDTH = 400;
const CONTAINER_HEIGHT = 280;
const BOX_SIZE = 80;

export default function Page() {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const origin = useRef({ x: 0, y: 0 });
  const [c, setC] = useState(0.55);
  const sliderId = useId();

  const x = useMotionValue((CONTAINER_WIDTH - BOX_SIZE) / 2);
  const y = useMotionValue((CONTAINER_HEIGHT - BOX_SIZE) / 2);

  // Kill the page bounce / pull-to-refresh while this demo is mounted, so a drag
  // that hits the edge doesn't turn into a page overscroll on mobile.
  useEffect(() => {
    const root = document.documentElement;
    const prevRoot = root.style.overscrollBehavior;
    const prevBody = document.body.style.overscrollBehavior;
    root.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";
    return () => {
      root.style.overscrollBehavior = prevRoot;
      document.body.style.overscrollBehavior = prevBody;
    };
  }, []);

  const getBounds = () => ({
    maxX: boundaryRef.current!.clientWidth - boxRef.current!.offsetWidth,
    maxY: boundaryRef.current!.clientHeight - boxRef.current!.offsetHeight,
    containerWidth: boundaryRef.current!.clientWidth,
    containerHeight: boundaryRef.current!.clientHeight,
  });

  const drag = useDrag({
    onStart: () => {
      x.stop();
      y.stop();
      origin.current = { x: x.get(), y: y.get() };
    },
    onMove: (point) => {
      const { maxX, maxY, containerHeight, containerWidth } = getBounds();

      x.set(
        applyRubberBand(origin.current.x + point.x, 0, maxX, containerWidth, c),
      );

      y.set(
        applyRubberBand(
          origin.current.y + point.y,
          0,
          maxY,
          containerHeight,
          c,
        ),
      );
    },

    onEnd: () => {
      const { maxX, maxY } = getBounds();
      animate(x, clamp(x.get(), PADDING, maxX - PADDING), SETTLE);
      animate(y, clamp(y.get(), PADDING, maxY - PADDING), SETTLE);
    },
  });

  return (
    <div className="min-h-dvh w-full flex items-center justify-center px-4">
      <div className="flex flex-col max-w-100 w-full gap-6">
        <p className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
          Pull the box past the edge of its container. It tracks 1:1 inside,
          then resists harder the further you pull, and can never go more than d
          past the edge.
        </p>
        <div
          ref={boundaryRef}
          className="max-w-100 w-full h-70 bg-[oklch(0.865_0_0)] rounded-2xl"
        >
          <motion.div
            ref={boxRef}
            style={{ x, y }}
            {...drag}
            className="w-20 h-20 bg-[oklch(0.961_0_0)] rounded-xl cursor-grab active:cursor-grabbing touch-none select-none"
          ></motion.div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-3 rounded-xl bg-[oklch(0.982_0_0)] px-4 py-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor={sliderId}
                className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]"
              >
                Resistance (c)
              </label>
              <span className="font-mono text-xs tabular-nums text-[rgb(3_47_98)]">
                {c.toFixed(2)}
              </span>
            </div>
            <input
              id={sliderId}
              type="range"
              min={0.05}
              max={1.5}
              step={0.01}
              value={c}
              onChange={(e) => setC(Number(e.target.value))}
              className="-my-4.75 h-11 w-full cursor-pointer touch-none appearance-none rounded-full bg-transparent outline-none focus-visible:ring-2 [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[oklch(0.865_0_0)] [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[oklch(0.865_0_0)] [&::-webkit-slider-thumb]:-mt-1.25 focus-visible:ring-[oklch(0.708_0_0)] focus-visible:ring-offset-2 [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_0_0_1px_#0000001C,0_1px_3px_0_#00000017] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_#0000001C,0_1px_3px_0_#00000017]"
            />
          </div>
          <pre className="overflow-x-auto rounded-xl bg-[oklch(0.982_0_0)] px-4 py-3 font-mono text-xs leading-relaxed text-[rgb(3_47_98)] w-full">
            {
              "offset = (1 − 1 / (c · x / d + 1)) · d\nx = distance past the edge, d = boundary width (x axis) or height (y axis)"
            }
          </pre>
        </div>
      </div>
    </div>
  );
}
