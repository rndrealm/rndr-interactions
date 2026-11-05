"use client";
import React, { useRef, useState } from "react";
import { useMotionPreference } from "../use-motion-preference";
import type { IDemo } from "../demo";
import { animate, motion, useMotionValue } from "motion/react";
import { useDrag } from "../use-drag";
import {
  applyRubberBand,
  nearest,
  project,
  springFromResponse,
} from "../physics";

// Slow on purpose, so it's easy to catch mid-flight
const SPRING = springFromResponse(0.9, 0.85);
// Ball 48px + the lane's px-2 on both sides
const LANE_INSET = 48 + 16;

interface ILane {
  interruptible: boolean;
  label: string;
}

function Lane(props: ILane) {
  const { interruptible, label } = props;
  // Reduced motion: springs settle without overshooting; dragging is unchanged
  const { spring } = useMotionPreference();

  const laneRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const animating = useRef(false);
  const dragging = useRef(false);
  const origin = useRef(0);
  // Only changes on a refused grab, never per frame
  const [ignored, setIgnored] = useState(0);

  const getMax = () => laneRef.current!.clientWidth - LANE_INSET;

  const run = (target: number, velocity = 0) => {
    animating.current = true;
    animate(x, target, {
      ...spring(SPRING),
      velocity,
      onComplete: () => (animating.current = false),
    });
  };

  const drag = useDrag({
    onStart: () => {
      if (!interruptible && animating.current) {
        dragging.current = false;
        setIgnored((n) => n + 1);
        return;
      }
      dragging.current = true;
      animating.current = false;
      // Stop exactly where it is on screen, no jump
      x.stop();
      origin.current = x.get();
    },
    onMove: (delta) => {
      if (!dragging.current) return;
      x.set(
        applyRubberBand(
          origin.current + delta.x,
          0,
          getMax(),
          laneRef.current!.clientWidth,
        ),
      );
    },
    onEnd: (velocity) => {
      if (!dragging.current) return;
      dragging.current = false;
      run(nearest(x.get() + project(velocity.x), [0, getMax()]), velocity.x);
    },
  });

  return (
    // select-none: dragging a ball past the edge of its lane would
    // otherwise start selecting the labels
    <div className="flex flex-col gap-2 select-none">
      <div className="flex items-center justify-between">
        <span className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
          {label}
        </span>
        {/* Kept in the layout on both lanes so they line up */}
        <span
          className={`font-mono text-xs tabular-nums text-[oklch(0.649_0_0)] ${interruptible ? "invisible" : ""}`}
        >
          ignored grabs: {ignored}
        </span>
      </div>
      <div
        ref={laneRef}
        onPointerDown={(e) => {
          // The ball's drag stops propagation, so this is a tap on the lane
          if (e.target !== e.currentTarget) return;
          if (!interruptible && animating.current) {
            setIgnored((n) => n + 1);
            return;
          }
          run(x.get() > getMax() / 2 ? 0 : getMax());
        }}
        className="flex h-16 cursor-pointer items-center rounded-full bg-[oklch(0.94_0_0)] px-2"
      >
        <motion.div
          style={{ x }}
          {...drag}
          className={`size-12 shrink-0 cursor-grab touch-none select-none rounded-full shadow-[0_0_0_1px_#0000001C,0_1px_3px_0_#00000017] active:cursor-grabbing ${interruptible ? "bg-white" : "bg-[oklch(0.894_0_0)]"}`}
        />
      </div>
    </div>
  );
}

export function InterruptibleDemo(props: IDemo) {
  const { embedded = false } = props;

  return (
    <div className="w-full flex items-center justify-center px-4 py-8">
      <div className="flex flex-col max-w-100 w-full gap-6">
        {!embedded && (
          <p className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
            Tap a lane to send the ball across, then grab it mid-flight. The top
            one stops right where it is and follows your finger; let go and it
            carries your speed to the nearest end. The bottom one ignores you
            until it finishes, like a timed animation that has to play out
            first.
          </p>
        )}

        <div className="flex flex-col gap-5 rounded-2xl bg-[oklch(0.961_0_0)] p-4">
          <Lane interruptible label="Interruptible" />
          <Lane interruptible={false} label="Not interruptible" />
        </div>

        <pre className="no-scrollbar overflow-x-auto rounded-xl bg-[oklch(0.982_0_0)] px-4 py-3 font-mono text-xs leading-relaxed text-[rgb(3_47_98)] w-full">
          {
            "onTouchDown: animation.stop(), origin = value on screen\nonRelease:   animate(nearest(x + projection(v)), { velocity: v })"
          }
        </pre>
      </div>
    </div>
  );
}
