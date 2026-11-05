"use client";
import React, { useLayoutEffect, useRef, useState } from "react";
import type { IDemo } from "../demo";
import {
  animate,
  motion,
  Point,
  useMotionValue,
  useTransform,
} from "motion/react";
import { FADE, project, springFromResponse, VelocityTracker } from "../physics";
import { useMotionPreference } from "../use-motion-preference";
import { SQUIRCLE } from "../squircle";
import { ToggleRow } from "../toggle-row";
import { ROOT, SettingsPage } from "./settings-pages";

const SCREEN_HEIGHT = 956 * 0.6;
const SCREEN_WIDTH = 440 * 0.65;
const EDGE = 24;
const LOCK = 10;
// The page underneath sits this far left and slides in at a third of the
// speed, like UINavigationController
const PARALLAX = SCREEN_WIDTH * 0.3;

interface IGesture {
  pointerId: number | null;
  start: Point;
  phase: "pending" | "dragging";
  origin: number;
  lockOffset: number;
}

const DEFAULT_GESTURE: IGesture = {
  pointerId: null,
  start: { x: 0, y: 0 },
  phase: "pending",
  origin: 0,
  lockOffset: 0,
};

const NAV = springFromResponse(0.35, 1);

export function SwipeCloseDemo(props: IDemo) {
  const { embedded = false } = props;
  // Reduced motion: no parallax, and tapped navigation fades instead of
  // sliding. The edge swipe still follows the finger.
  const { reduceMotion } = useMotionPreference();
  const pageOpacity = useMotionValue(1);

  const [stack, setStack] = useState([ROOT]);
  const [useProjection, setUseProjection] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<IGesture>({ ...DEFAULT_GESTURE });
  const velocityTrackerRef = useRef(new VelocityTracker());
  const prevLengthRef = useRef(stack.length);

  // How far the top page has slid right: 0 showing, SCREEN_WIDTH gone
  const x = useMotionValue(0);
  const underX = useTransform(
    x,
    [0, SCREEN_WIDTH],
    [reduceMotion ? 0 : -PARALLAX, 0],
  );
  const dim = useTransform(x, [0, SCREEN_WIDTH], [0.06, 0]);

  // x is only reset once React has swapped the pages, before paint, so the
  // outgoing page never flashes back to 0 for a frame
  useLayoutEffect(() => {
    const pushed = stack.length > prevLengthRef.current;
    prevLengthRef.current = stack.length;

    if (pushed && reduceMotion) {
      // The new page appears in place
      x.set(0);
      pageOpacity.set(0);
      animate(pageOpacity, 1, FADE);
    } else if (pushed) {
      // The new page starts offscreen right and slides in
      x.set(SCREEN_WIDTH);
      animate(x, 0, NAV);
    } else {
      x.set(0);
      pageOpacity.set(1);
    }
  }, [stack.length, x, pageOpacity, reduceMotion]);

  // Read from x itself rather than a flag, so it can't get stuck: Motion
  // skips onComplete when one animation replaces another
  const isMoving = () =>
    x.isAnimating() || x.get() !== 0 || pageOpacity.isAnimating();

  const open = (to: string) => {
    // A tap that lands while a page is moving would stack pages mid-slide
    if (isMoving() || gestureRef.current.phase === "dragging") return;
    setStack((s) => [...s, to]);
  };

  const resetGesture = () => {
    gestureRef.current = { ...DEFAULT_GESTURE };
  };

  // Puts a page left part-way back on one side or the other
  const settle = (velocity: number) => {
    const landing = x.get() + (useProjection ? project(velocity) : 0);
    if (landing > SCREEN_WIDTH / 2) goBack(velocity);
    else stayHere(velocity);
  };

  const startDragging = (
    e: React.PointerEvent<HTMLDivElement>,
    lockOffset: number,
  ) => {
    // Only take the pointer once it's ours, so taps on rows still work.
    // Throws if the pointer is already gone; then there's no drag to run.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      resetGesture();
      settle(0);
      return false;
    }
    gestureRef.current.phase = "dragging";
    gestureRef.current.lockOffset = lockOffset;
    return true;
  };

  const goBack = (velocity: number) => {
    animate(x, SCREEN_WIDTH, {
      ...NAV,
      velocity,
      onComplete: () => {
        // The layout effect resets x once the page is gone. Never pop the root.
        setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
      },
    });
  };

  // The back button. Reduced motion fades the page out instead of sliding it.
  const tapBack = () => {
    if (!reduceMotion) return goBack(0);
    animate(pageOpacity, 0, {
      ...FADE,
      // The layout effect restores the opacity once the page is gone
      onComplete: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    });
  };

  const stayHere = (velocity: number) => {
    animate(x, 0, { ...NAV, velocity });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || stack.length < 2) return;

    const previous = gestureRef.current.pointerId;
    if (previous !== null && previous !== e.pointerId) {
      // A second finger while one is genuinely dragging: ignore it
      if (containerRef.current!.hasPointerCapture(previous)) return;
      // Otherwise the last touch ended without telling us (its target was
      // re-rendered away, or the system took the touch). Drop it instead of
      // refusing every drag from now on.
      resetGesture();
    }

    const rect = containerRef.current!.getBoundingClientRect();
    const fromEdge = e.clientX - rect.left;
    const midFlight = x.get() > 0;
    if (!midFlight && fromEdge > EDGE) return;

    gestureRef.current = {
      pointerId: e.pointerId,
      start: { x: e.clientX, y: e.clientY },
      phase: "pending",
      origin: 0,
      lockOffset: 0,
    };

    velocityTrackerRef.current.reset();
    velocityTrackerRef.current.add(e.clientX, e.clientY);

    if (midFlight) {
      // Caught while sliding: grab it right where it is
      x.stop();
      gestureRef.current.origin = x.get();
      startDragging(e, 0);
    }
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const currentGesture = gestureRef.current;
    if (e.pointerId !== currentGesture.pointerId) return;
    velocityTrackerRef.current.add(e.clientX, e.clientY);

    const dx = e.clientX - currentGesture.start.x;
    const dy = e.clientY - currentGesture.start.y;

    if (currentGesture.phase === "pending") {
      if (Math.hypot(dx, dy) < LOCK) return;
      if (dx > 0 && Math.abs(dx) > Math.abs(dy)) {
        if (!startDragging(e, dx)) return;
      } else {
        resetGesture();
        return;
      }
    }

    // Stops at the left edge: there's nothing to the right to reveal
    x.set(Math.max(0, currentGesture.origin + dx - currentGesture.lockOffset));
  };
  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const currentGesture = gestureRef.current;
    if (e.pointerId !== currentGesture.pointerId) return;
    const wasDragging = currentGesture.phase === "dragging";
    // Fully reset, phase too, so nothing from this drag leaks into the next
    resetGesture();
    if (!wasDragging) return;

    // A cancel or lost capture is the system taking the touch, not a flick:
    // just settle
    // where it is rather than projecting the speed
    settle(e.type === "pointerup" ? velocityTrackerRef.current.get().x : 0);
  };

  const top = stack[stack.length - 1];
  const under = stack[stack.length - 2];

  return (
    <div className="w-full flex items-center justify-center px-4 py-8">
      <div className="flex flex-col gap-6 max-w-100 w-full">
        {!embedded && (
          <p className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
            The back swipe from any iOS navigation stack. Tap a row to go
            deeper, then drag from the left edge: the page tracks your finger
            while the one underneath follows at a third of the speed. On release
            the flick is projected, so a quick flick goes back from a short
            drag. Catch a page mid-slide to take it over.
          </p>
        )}
        <div
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onLostPointerCapture={(e) => {
            // On touch the row under the finger holds the pointer first, and
            // its lostpointercapture bubbles up here when we take it. That's
            // not a release, so only our own loss of capture ends the drag.
            if (e.target === e.currentTarget) onPointerEnd(e);
          }}
          className={`relative mx-auto touch-pan-y select-none overflow-hidden rounded-[29px] supports-[corner-shape:squircle]:rounded-[48px] ${SQUIRCLE} bg-[oklch(0.94_0_0)]`}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
        >
          {under && (
            <motion.div
              key={stack.length - 2}
              style={{ x: underX }}
              className="absolute inset-0"
            >
              <SettingsPage
                name={under}
                back={stack[stack.length - 3]}
                onOpen={open}
                onBack={tapBack}
              />
              <motion.div
                style={{ opacity: dim }}
                className="pointer-events-none absolute inset-0 bg-black"
              />
            </motion.div>
          )}
          <motion.div
            key={stack.length - 1}
            style={{ x, opacity: pageOpacity }}
            className="absolute inset-0 shadow-[0_0_24px_0_#00000014]"
          >
            <SettingsPage
              name={top}
              back={under}
              onOpen={open}
              onBack={tapBack}
            />
          </motion.div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col rounded-xl bg-[oklch(0.982_0_0)] px-3 py-1.5">
            <ToggleRow
              label="Use projection"
              checked={useProjection}
              onChange={setUseProjection}
            />
          </div>
          <pre className="no-scrollbar overflow-x-auto rounded-xl bg-[oklch(0.982_0_0)] px-4 py-3 font-mono text-xs leading-relaxed text-[rgb(3_47_98)] w-full">
            {
              "back = x + projection(velocityX) > width / 2\nunderX = lerp(-0.3 · width, 0, x / width)"
            }
          </pre>
        </div>
      </div>
    </div>
  );
}
