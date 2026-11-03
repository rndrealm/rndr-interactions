"use client";
import React, { useRef, useState } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { useDrag } from "../use-drag";
import { ToggleRow } from "../toggle-row";
import { rubberBand, springFromResponse, stretch } from "../physics";

type Axis = "x" | "y" | "free" | null;

const SETTLE = springFromResponse(0.4, 0.85);

const LOCK_THRESHOLD = 10;
const LOCK_RATIO = 2;

// const AXIS_LABEL: Record<Exclude<Axis, null>, string> = {
//   x: "Horizontal",
//   y: "Vertical",
//   free: "Free",
// };

export default function Page() {
  // const [axisLabel, setAxisLabel] = useState<Axis>(null);
  const [enabled, setEnabled] = useState(true);

  const axis = useRef<Axis>(null);
  const lockOrigin = useRef({ x: 0, y: 0 });
  const boundaryRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const drag = useDrag({
    onStart: () => {
      x.stop();
      y.stop();
      axis.current = enabled ? null : "free";
      lockOrigin.current = { x: 0, y: 0 };
      // setAxisLabel(axis.current);
    },
    onMove: (delta) => {
      if (
        axis.current === null &&
        Math.hypot(delta.x, delta.y) > LOCK_THRESHOLD
      ) {
        const ax = Math.abs(delta.x);
        const ay = Math.abs(delta.y);
        axis.current =
          ax > ay * LOCK_RATIO ? "x" : ay > ax * LOCK_RATIO ? "y" : "free";
        lockOrigin.current = { x: delta.x, y: delta.y };
        // setAxisLabel(axis.current);
      }

      if (axis.current === null) return;

      const stage = boundaryRef.current!;
      const dx = delta.x - lockOrigin.current.x;
      const dy = delta.y - lockOrigin.current.y;
      x.set(axis.current === "y" ? 0 : stretch(dx, stage.clientWidth));
      y.set(axis.current === "x" ? 0 : stretch(dy, stage.clientHeight));
    },
    onEnd: (velocity) => {
      animate(x, 0, {
        ...SETTLE,
        velocity: axis.current === "y" ? 0 : velocity.x,
      });
      animate(y, 0, {
        ...SETTLE,
        velocity: axis.current === "x" ? 0 : velocity.y,
      });
    },
  });

  return (
    <div className="min-h-dvh w-full flex items-center justify-center px-4">
      <div className="flex flex-col max-w-100 w-full gap-6">
        <p className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
          Drag the box. After 10pt it locks to whichever axis clearly wins, so
          it moves in a straight line. Diagonal drags stay free. This is why
          scrolling a list doesn’t drift sideways, even though your thumb never
          moves perfectly straight.
        </p>
        <div
          ref={boundaryRef}
          className="max-w-100 w-full h-70 bg-[oklch(0.865_0_0)] rounded-2xl relative"
        >
          <motion.div
            style={{ x, y }}
            {...drag}
            className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] h-20 w-20 bg-[oklch(0.961_0_0)] rounded-xl cursor-grab active:cursor-grabbing touch-none select-none"
          ></motion.div>

          <div className="opacity-40 absolute top-0 left-[50%] translate-x-[-50%] w-px h-full bg-[oklch(0.982_0_0)]"></div>
          <div className="opacity-40 absolute top-[50%] left-0 translate-y-[-50%] w-full h-px bg-[oklch(0.982_0_0)]"></div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col rounded-xl bg-[oklch(0.982_0_0)] px-3 py-1.5">
            <ToggleRow
              label="Direction lock"
              checked={enabled}
              onChange={setEnabled}
            />
            {/* <div className="flex h-9 items-center justify-between px-1">
              <span className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
                Locked axis
              </span>
              <span
                aria-live="polite"
                className="font-mono text-xs tabular-nums text-[rgb(3_47_98)]"
              >
                {axisLabel === null ? "Deciding…" : AXIS_LABEL[axisLabel]}
              </span>
            </div> */}
          </div>
          <pre className="overflow-x-auto rounded-xl bg-[oklch(0.982_0_0)] px-4 py-3 font-mono text-xs leading-relaxed text-[rgb(3_47_98)] w-full">
            {
              "after 10pt: |dx| > 2·|dy| → lock x;  |dy| > 2·|dx| → lock y;  else free\noffset = sign(dx) · rubberBand(|dx|, d)"
            }
          </pre>
        </div>
      </div>
    </div>
  );
}
