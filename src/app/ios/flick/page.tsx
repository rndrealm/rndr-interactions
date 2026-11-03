"use client";
import React, { useRef, useState } from "react";
import { useMotionValue, motion, animate, AnimatePresence } from "motion/react";
import { useDrag } from "../use-drag";
import { ToggleRow } from "../toggle-row";
import { PictureInPicture, PictureInPicture2 } from "lucide-react";
import {
  applyRubberBand,
  nearestPoint,
  project,
  springFromResponse,
} from "../physics";

const PADDING = 16;
const SNAP = springFromResponse(0.45, 0.8);
// Enter/exit PiP: a touch softer than the snap, with only a hint of bounce
const MORPH = springFromResponse(0.5, 0.88);

const LABEL_IN = {
  duration: 0.12,
  delay: 0.08,
  ease: [0.25, 0.1, 0.25, 1],
} as const;
const LABEL_OUT = { duration: 0.06, ease: [0.25, 0.1, 0.25, 1] } as const;

export default function Page() {
  const [useProjection, setUseProjection] = useState(true);
  const [handoff, setHandoff] = useState(true);
  const [isPictureInPicture, setIsPictureInPicture] = useState(true);

  const stageRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const origin = useRef({ x: 0, y: 0 });
  const x = useMotionValue(PADDING);
  const y = useMotionValue(PADDING);

  const getCorners = () => {
    const maxX =
      stageRef.current!.clientWidth - boxRef.current!.offsetWidth - PADDING;
    const maxY =
      stageRef.current!.clientHeight - boxRef.current!.offsetHeight - PADDING;
    return [
      { x: PADDING, y: PADDING },
      { x: maxX, y: PADDING },
      { x: PADDING, y: maxY },
      { x: maxX, y: maxY },
    ];
  };

  const drag = useDrag({
    onStart: () => {
      x.stop();
      y.stop();
      origin.current = { x: x.get(), y: y.get() };
      // Hide the controls until the pointer leaves the box (set on the DOM, no re-render)
      boxRef.current!.dataset.dragging = "true";
    },
    onMove: (delta) => {
      const stage = stageRef.current!;
      const maxX = stage.clientWidth - boxRef.current!.offsetWidth;
      const maxY = stage.clientHeight - boxRef.current!.offsetHeight;
      x.set(
        applyRubberBand(origin.current.x + delta.x, 0, maxX, stage.clientWidth),
      );
      y.set(
        applyRubberBand(
          origin.current.y + delta.y,
          0,
          maxY,
          stage.clientHeight,
        ),
      );
    },
    onEnd: (velocity) => {
      const from = { x: x.get(), y: y.get() };
      const landing = useProjection
        ? { x: from.x + project(velocity.x), y: from.y + project(velocity.y) }
        : from;
      const target = nearestPoint(landing, getCorners());

      animate(x, target.x, { ...SNAP, velocity: handoff ? velocity.x : 0 });
      animate(y, target.y, { ...SNAP, velocity: handoff ? velocity.y : 0 });
    },
  });

  return (
    <div className="h-screen w-full flex items-center justify-center px-4 relative">
      <div ref={stageRef} className="fixed inset-0 pointer-events-none"></div>
      <div className="flex flex-col gap-6 max-w-100 w-full">
        <p className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
          Picture-in-picture corner snapping. On release, Apple works out where
          a flick <em>would</em> land and snaps to the corner nearest that point
          (the dashed outline). The spring starts at the finger’s speed so the
          motion never jerks. Turn either off to feel the difference.
        </p>
        <div className="max-w-100 w-full h-70 bg-[oklch(0.982_0_0)] rounded-xl border border-dashed border-[oklch(0.918_0_0)] relative group/stage">
          <AnimatePresence>
            {!isPictureInPicture && (
              <motion.div
                layoutId="app_picture_in_picture"
                transition={MORPH}
                className="w-full h-full rounded-xl bg-[oklch(0.865_0_0)]"
              ></motion.div>
            )}
          </AnimatePresence>
          {!isPictureInPicture && (
            <button
              type="button"
              aria-label="Enter picture in picture"
              onClick={() => setIsPictureInPicture(true)}
              className="absolute bottom-2 right-2 opacity-0 group-hover/stage:opacity-100 flex size-8 cursor-pointer items-center justify-center rounded-lg bg-white text-[oklch(0.375_0_0)] shadow-[0_0_0_1px_#0000000A,0_1px_2px_0_#0000000D] outline-none transition-[color,opacity] duration-75 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 hover:text-[oklch(0.205_0_0)] focus-visible:ring-2 focus-visible:ring-[oklch(0.708_0_0)]"
            >
              <PictureInPicture2 size={16} strokeWidth={2} aria-hidden />
            </button>
          )}
        </div>

        {/* // Outer: positioned with an x/y transform (cheap, no layout). Inner:
            // the layoutId element. Motion ignores an element's own transform
            // when measuring it, but in a shared layoutId transition it does
            // apply its ancestors' transforms, so the wrapper's x/y counts and
            // the animation starts/ends at the real position. */}
        {isPictureInPicture && (
          <motion.div
            ref={boxRef}
            {...drag}
            onPointerLeave={() => delete boxRef.current?.dataset.dragging}
            style={{ x, y }}
            className="group/pip w-60 h-42 fixed top-0 left-0 z-10 cursor-grab touch-none select-none active:cursor-grabbing"
          >
            <motion.div
              layoutId="app_picture_in_picture"
              transition={MORPH}
              className="relative w-full h-full rounded-xl bg-[oklch(0.865_0_0)] flex justify-center items-center"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: LABEL_IN }}
                exit={{ opacity: 0, transition: LABEL_OUT }}
                className="font-geist text-xs leading-4 font-medium text-[oklch(0.375_0_0)]"
              >
                Flick me
              </motion.p>
              <button
                type="button"
                aria-label="Exit picture in picture"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => {
                  setIsPictureInPicture(false);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover/pip:opacity-100 group-data-[dragging=true]/pip:opacity-0! flex size-8 cursor-pointer items-center justify-center rounded-lg bg-white text-[oklch(0.375_0_0)] shadow-[0_0_0_1px_#0000000A,0_1px_2px_0_#0000000D] outline-none transition-[color,opacity] duration-75 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 hover:text-[oklch(0.205_0_0)] focus-visible:ring-2 focus-visible:ring-[oklch(0.708_0_0)]"
              >
                <PictureInPicture size={16} strokeWidth={2} aria-hidden />
              </button>
            </motion.div>
          </motion.div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex flex-col rounded-xl bg-[oklch(0.982_0_0)] px-3 py-1.5">
            <ToggleRow
              label="Use projection"
              checked={useProjection}
              onChange={setUseProjection}
            />
            <ToggleRow
              label="Velocity handoff"
              checked={handoff}
              onChange={setHandoff}
            />
          </div>
          <pre className="overflow-x-auto rounded-xl bg-[oklch(0.982_0_0)] px-4 py-3 font-mono text-xs leading-relaxed text-[rgb(3_47_98)] w-full">
            {
              "projection = (velocity / 1000) · rate / (1 − rate)   // rate = 0.998\ntarget = nearest corner to (position + projection)\nspring.initialVelocity = gestureVelocity"
            }
          </pre>
        </div>
      </div>
    </div>
  );
}
