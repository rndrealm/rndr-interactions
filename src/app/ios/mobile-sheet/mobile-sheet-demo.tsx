"use client";
import React, { useRef, useState } from "react";
import { useMotionPreference } from "../use-motion-preference";
import type { IDemo } from "../demo";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useDrag } from "../use-drag";
import { SQUIRCLE } from "../squircle";
import { ToggleRow } from "../toggle-row";
import { MapBackground, MapsSheetContent } from "./maps-content";
import {
  applyRubberBand,
  nearest,
  project,
  springFromResponse,
} from "../physics";

const SCREEN_HEIGHT = 956 * 0.55;
const SCREEN_WIDTH = 440 * 0.6;

const SHEET_FULL = SCREEN_HEIGHT * 0.1;
const SHEET_MIDDLE = SCREEN_HEIGHT * 0.4;
// Closed peeks the handle (29px) + search field (36px) + a 12px margin
const SHEET_CLOSED = SCREEN_HEIGHT - 77;

const SHEET_SPRING = springFromResponse(0.45, 0.88);

const SHEET_OPTIONS = [SHEET_FULL, SHEET_MIDDLE, SHEET_CLOSED];

const DETENTS = [
  { value: SHEET_CLOSED, label: "Closed" },
  { value: SHEET_MIDDLE, label: "Half" },
  { value: SHEET_FULL, label: "Full" },
];

const PILL = springFromResponse(0.35, 0.9);

export function MobileSheetDemo(props: IDemo) {
  const { embedded = false } = props;
  // Reduced motion: springs settle without overshooting; dragging is unchanged
  const { reduceMotion, spring } = useMotionPreference();

  const [useProjection, setUseProjection] = useState(true);
  // Only set on release or a button press, never per frame
  const [detent, setDetent] = useState(SHEET_CLOSED);

  const origin = useRef(0);

  const y = useMotionValue(SHEET_CLOSED);

  const dim = useTransform(y, [SHEET_FULL, SHEET_MIDDLE], [0.06, 0]);
  const backgroundScale = useTransform(
    y,
    [SHEET_FULL, SHEET_MIDDLE],
    // Reduced motion keeps the dim but not the map shrinking back
    [reduceMotion ? 1 : 0.92, 1],
  );

  const drag = useDrag({
    onStart: () => {
      y.stop();
      origin.current = y.get();
    },
    onMove: (delta) => {
      y.set(
        applyRubberBand(
          origin.current + delta.y,
          SHEET_FULL,
          SHEET_CLOSED,
          SCREEN_HEIGHT,
        ),
      );
    },
    onEnd: (velocity) => {
      const landing = useProjection
        ? y.get() + project(velocity.y * 0.75)
        : y.get();
      const nearestPosition = nearest(landing, SHEET_OPTIONS);

      setDetent(nearestPosition);
      animate(y, nearestPosition, {
        ...spring(SHEET_SPRING),
        velocity: velocity.y,
      });
    },
  });

  const goTo = (position: number) => {
    setDetent(position);
    animate(y, position, spring(SHEET_SPRING));
  };

  return (
    <div className="w-full flex items-center justify-center px-4 py-8">
      <div className="flex flex-col gap-6 max-w-100 w-full">
        {!embedded && (
          <p className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
            A Maps-style sheet with three detents: closed shows just search,
            half adds favourites and recents, full shows everything. On release,
            Apple projects where a flick would land and snaps to the nearest
            detent, so a quick flick can skip the middle. Near full, the map
            dims and shrinks back.
          </p>
        )}
        <div
          className={`flex items-center justify-center relative mx-auto overflow-hidden rounded-[29px] supports-[corner-shape:squircle]:rounded-[48px] ${SQUIRCLE} bg-[oklch(0.94_0_0)]`}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
        >
          <motion.div
            style={{ scale: backgroundScale }}
            className={`absolute inset-0 overflow-hidden rounded-[29px] supports-[corner-shape:squircle]:rounded-[48px] ${SQUIRCLE} bg-[oklch(0.961_0_0)]`}
          >
            <MapBackground width={SCREEN_WIDTH} height={SCREEN_HEIGHT} />
          </motion.div>

          <motion.div
            style={{ opacity: dim }}
            // At Full, tapping the map above the sheet brings the map back:
            // the sheet drops to Half, like Maps, rather than closing
            onClick={() => goTo(SHEET_MIDDLE)}
            aria-hidden
            className={`absolute inset-0 w-full h-full bg-black ${detent === SHEET_FULL ? "cursor-pointer" : "pointer-events-none"}`}
          ></motion.div>
          <motion.div
            style={{ y }}
            className={`absolute top-0 left-0 right-0 bg-[oklch(0.982_0_0)] h-[200vh] rounded-t-[24px] supports-[corner-shape:squircle]:rounded-t-[40px] ${SQUIRCLE} shadow-[0_-1px_3px_0_#0000000A] flex flex-col px-4`}
          >
            {/* Only the handle drags the sheet. It spans the full width with
                generous padding so it's an easy target. */}
            <div
              {...drag}
              className="-mx-4 flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none select-none"
            >
              <div className="w-9 h-1.25 bg-[oklch(0.894_0_0)] rounded-full"></div>
            </div>

            {/* Full-detent visible height minus the handle (29) and search (36) */}
            {/* Past Full the rubber band can lift the sheet at most
                SCREEN_HEIGHT (its d), so the list reaches that much further */}
            <MapsSheetContent
              height={SCREEN_HEIGHT - SHEET_FULL - 65}
              overscroll={SCREEN_HEIGHT}
              isFull={detent === SHEET_FULL}
            />
            <div className="h-screen w-full"></div>
          </motion.div>
        </div>
        <div className="flex flex-col gap-2">
          <div
            role="group"
            aria-label="Sheet position"
            className="flex gap-1 rounded-xl bg-[oklch(0.982_0_0)] p-1"
          >
            {DETENTS.map((item) => {
              const isActive = item.value === detent;
              return (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => goTo(item.value)}
                  className={`relative flex-1 h-8 cursor-pointer rounded-lg font-geist text-sm leading-5 tracking-[-0.08px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(0.708_0_0)] ${isActive ? "text-[oklch(0.205_0_0)] font-medium" : "text-[oklch(0.556_0_0)] hover:text-[oklch(0.375_0_0)]"}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sheet-detent-pill"
                      transition={PILL}
                      className="absolute inset-0 rounded-lg bg-white shadow-[0_0_0_1px_#0000001C,0_1px_3px_0_#00000017]"
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col rounded-xl bg-[oklch(0.982_0_0)] px-3 py-1.5">
            <ToggleRow
              label="Use projection"
              checked={useProjection}
              onChange={setUseProjection}
            />
          </div>
          <pre className="no-scrollbar overflow-x-auto rounded-xl bg-[oklch(0.982_0_0)] px-4 py-3 font-mono text-xs leading-relaxed text-[rgb(3_47_98)] w-full">
            {
              "target = nearest(detents, y + projection(velocityY))\nbackgroundScale = lerp(1, 0.92, progress)"
            }
          </pre>
        </div>
      </div>
    </div>
  );
}
