"use client";
import React, { useRef, useState } from "react";
import type { IDemo } from "../demo";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import {
  clamp,
  FADE,
  Point,
  project,
  rubberBand,
  rubberBandInverse,
  springFromResponse,
  stretch,
} from "../physics";
import { useDrag } from "../use-drag";
import { useMotionPreference } from "../use-motion-preference";

type Condition = "sun" | "cloud" | "rain" | "snow" | "moon" | "wind";

type City = {
  id: number;
  name: string;
  summary: string;
  temp: number;
  high: number;
  low: number;
  hourly: [string, number][];
  // Cover: a flat grey with the weather glyph on it
  bg: string;
  ink: string;
  condition: Condition;
};

const cities: City[] = [
  {
    id: 1,
    name: "Lagos",
    summary: "Sunny",
    temp: 31,
    high: 33,
    low: 25,
    hourly: [
      ["Now", 31],
      ["14", 32],
      ["15", 33],
      ["16", 32],
      ["17", 30],
    ],
    bg: "oklch(0.918 0 0)",
    ink: "oklch(0.993 0 0)",
    condition: "sun",
  },
  {
    id: 2,
    name: "London",
    summary: "Light rain",
    temp: 14,
    high: 16,
    low: 9,
    hourly: [
      ["Now", 14],
      ["14", 14],
      ["15", 15],
      ["16", 13],
      ["17", 12],
    ],
    bg: "oklch(0.894 0 0)",
    ink: "oklch(0.961 0 0)",
    condition: "rain",
  },
  {
    id: 3,
    name: "Oslo",
    summary: "Snow showers",
    temp: -2,
    high: 0,
    low: -6,
    hourly: [
      ["Now", -2],
      ["14", -1],
      ["15", -1],
      ["16", -3],
      ["17", -4],
    ],
    bg: "oklch(0.94 0 0)",
    ink: "oklch(0.865 0 0)",
    condition: "snow",
  },
  {
    id: 4,
    name: "Tokyo",
    summary: "Cloudy",
    temp: 18,
    high: 20,
    low: 13,
    hourly: [
      ["Now", 18],
      ["14", 19],
      ["15", 19],
      ["16", 18],
      ["17", 16],
    ],
    bg: "oklch(0.865 0 0)",
    ink: "oklch(0.94 0 0)",
    condition: "cloud",
  },
  {
    id: 5,
    name: "Cape Town",
    summary: "Windy",
    temp: 21,
    high: 23,
    low: 15,
    hourly: [
      ["Now", 21],
      ["14", 22],
      ["15", 22],
      ["16", 21],
      ["17", 19],
    ],
    bg: "oklch(0.918 0 0)",
    ink: "oklch(0.818 0 0)",
    condition: "wind",
  },
  {
    id: 6,
    name: "Reykjavík",
    summary: "Clear night",
    temp: 3,
    high: 5,
    low: -1,
    hourly: [
      ["Now", 3],
      ["14", 3],
      ["15", 2],
      ["16", 1],
      ["17", 0],
    ],
    bg: "oklch(0.94 0 0)",
    ink: "oklch(0.894 0 0)",
    condition: "moon",
  },
];

const OPEN = springFromResponse(0.35, 0.9);
const CLOSE = springFromResponse(0.35, 0.9);
const DISMISS_DISTANCE = 0.25;

// A cloud built from two circles on a rounded base, shared by three glyphs
function Cloud({ dy = 0 }: { dy?: number }) {
  return (
    <g transform={`translate(0 ${dy})`}>
      <rect x="27" y="48" width="48" height="16" rx="8" />
      <circle cx="42" cy="49" r="10" />
      <circle cx="57" cy="45" r="13" />
    </g>
  );
}

function Glyph({ condition }: { condition: Condition }) {
  switch (condition) {
    case "sun":
      return (
        <g>
          <circle cx="50" cy="50" r="15" />
          {Array.from({ length: 8 }, (_, index) => (
            <rect
              key={index}
              x="48"
              y="20"
              width="4"
              height="9"
              rx="2"
              transform={`rotate(${index * 45} 50 50)`}
            />
          ))}
        </g>
      );
    case "cloud":
      return <Cloud />;
    case "rain":
      return (
        <g>
          <Cloud dy={-8} />
          {[38, 50, 62].map((x) => (
            <rect key={x} x={x - 2} y="62" width="4" height="10" rx="2" />
          ))}
        </g>
      );
    case "snow":
      return (
        <g>
          <Cloud dy={-8} />
          {[38, 50, 62].map((x, index) => (
            <circle key={x} cx={x} cy={index % 2 ? 70 : 65} r="3" />
          ))}
        </g>
      );
    case "moon":
      return <path d="M56 28 a22 22 0 1 0 16 34 a17 17 0 0 1 -16 -34 Z" />;
    case "wind":
      return (
        <g>
          <rect x="24" y="38" width="44" height="5" rx="2.5" />
          <rect x="32" y="49" width="44" height="5" rx="2.5" />
          <rect x="24" y="60" width="34" height="5" rx="2.5" />
        </g>
      );
  }
}

// The cover. Rendered by both the thumbnail and the open card's header. The
// glyph is centred and sized to the shorter side (preserveAspectRatio meet),
// so the square tile and the wide header draw the same cover, just bigger.
function Cover({ city }: { city: City }) {
  return (
    <div
      className="absolute inset-0"
      style={{ background: city.bg, color: city.ink }}
    >
      <svg
        className="size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        fill="currentColor"
        aria-hidden
      >
        <Glyph condition={city.condition} />
      </svg>
    </div>
  );
}

export function DragTransitionDemo(props: IDemo) {
  const { embedded = false } = props;
  // Reduced motion: the card fades in and out in place instead of growing
  // out of the tile. Dragging it is unchanged.
  const { reduceMotion, spring } = useMotionPreference();
  const cardOpacity = useMotionValue(1);

  const [selected, setSelected] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isOpeningRef = useRef(false);
  const lastDeltaRef = useRef({ x: 0, y: 0 });
  const dragOriginRef = useRef<Point>({ x: 0, y: 0 });

  const progress = useMotionValue(0); // 0 = on the thumbnail, 1 = full view
  const dragX = useMotionValue(0); // how far the finger has dragged the card
  const dragY = useMotionValue(0);

  const itemX = useMotionValue(0);
  const itemY = useMotionValue(0);
  const itemW = useMotionValue(0);
  const itemH = useMotionValue(0);
  const containerW = useMotionValue(0);
  const containerH = useMotionValue(0);

  const left = useTransform(
    [progress, itemX],
    ([p, t]: number[]) => t * (1 - p),
  );
  const top = useTransform(
    [progress, itemY],
    ([p, t]: number[]) => t * (1 - p),
  );
  const width = useTransform(
    [progress, itemW, containerW],
    ([p, t, s]: number[]) => t + (s - t) * p,
  );
  const height = useTransform(
    [progress, itemH, containerH],
    ([p, t, s]: number[]) => t + (s - t) * p,
  );

  const coverHeight = useTransform(progress, [0, 1], ["100%", "50%"]);
  // Held back until the card is big enough to read, so text never shows
  // squeezed into something the size of a thumbnail
  const bodyOpacity = useTransform(progress, [0.6, 1], [0, 1]);
  // The open tile's labels: gone as it lifts off, back in as it lands
  const labelOpacity = useTransform(progress, [0, 0.4], [1, 0]);

  const dragProgress = useTransform([dragY, containerH], ([dy, h]: number[]) =>
    h ? clamp(dy / (h * 0.6), 0, 1) : 0,
  );

  const dim = useTransform(
    [progress, dragProgress, cardOpacity],
    ([p, d, o]: number[]) => clamp(p, 0, 1) * (1 - d) * 0.7 * o,
  );

  const scale = useTransform(dragProgress, [0, 1], [1, 0.5]);

  const handleOpen = (velocity: Point) => {
    isOpeningRef.current = true;

    if (reduceMotion) {
      // Fresh open: jump to full size, invisible, then fade in
      if (progress.get() < 1) {
        progress.set(1);
        cardOpacity.set(0);
      }
      animate(cardOpacity, 1, FADE);
      animate(dragX, 0, { ...spring(OPEN), velocity: velocity.x });
      animate(dragY, 0, { ...spring(OPEN), velocity: velocity.y });
      return;
    }

    animate(progress, 1, OPEN);
    animate(dragX, 0, { ...OPEN, velocity: velocity.x });
    animate(dragY, 0, { ...OPEN, velocity: velocity.y });
  };

  const handleClose = (velocity: Point) => {
    isOpeningRef.current = false;

    if (reduceMotion) {
      // Fade out from wherever the drag left it, then reset for next time
      animate(cardOpacity, 0, {
        ...FADE,
        onComplete: () => {
          if (isOpeningRef.current) return;
          progress.set(0);
          dragX.set(0);
          dragY.set(0);
          setSelected(null);
        },
      });
      return;
    }
    animate(progress, 0, {
      ...CLOSE,
      onComplete: () => {
        // Ignore if it was reopened mid-flight
        if (isOpeningRef.current) return;
        setSelected(null);
      },
    });
    animate(dragX, 0, { ...CLOSE, velocity: velocity.x });
    animate(dragY, 0, { ...CLOSE, velocity: velocity.y });
  };

  const openItem = (index: number) => {
    if (selected !== null) return;

    const container = containerRef.current!;
    const containerRect = container.getBoundingClientRect();
    const itemRect = itemRefs.current[index]!.getBoundingClientRect();

    itemX.set(itemRect.left - containerRect.left - container.clientLeft);
    itemY.set(itemRect.top - containerRect.top - container.clientTop);
    itemW.set(itemRect.width);
    itemH.set(itemRect.height);
    containerW.set(container.clientWidth);
    containerH.set(container.clientHeight);

    progress.set(0);
    dragX.set(0);
    dragY.set(0);
    cardOpacity.set(1);
    setSelected(index);
    handleOpen({ x: 0, y: 0 });
  };

  const drag = useDrag({
    onStart: () => {
      lastDeltaRef.current = { x: 0, y: 0 };
      if (!isOpeningRef.current) return;
      dragX.stop();
      dragY.stop();
      // The origin is in finger px, before the rubber band. Grabbed mid-spring,
      // turn what's on screen back into finger px, or the stretch would be
      // applied twice and the card would jump toward the finger.
      const shownX = dragX.get();
      const shownY = dragY.get();
      dragOriginRef.current = {
        x:
          Math.sign(shownX) *
          rubberBandInverse(Math.abs(shownX), containerW.get()),
        // Down is free, so only an upward offset needs undoing
        y: shownY > 0 ? shownY : -rubberBandInverse(-shownY, containerH.get()),
      };
    },
    onMove: (delta) => {
      lastDeltaRef.current = delta;
      if (!isOpeningRef.current) return;

      const y = dragOriginRef.current.y + delta.y;
      dragX.set(stretch(dragOriginRef.current.x + delta.x, containerW.get()));

      // dragX.set(dragOriginRef.current.x + delta.x);
      // Down is free, up rubber bands
      dragY.set(y > 0 ? y : -rubberBand(-y, containerH.get()));
    },
    onEnd: (velocity) => {
      const isTap =
        Math.hypot(lastDeltaRef.current.x, lastDeltaRef.current.y) < 6;
      if (isTap) {
        if (isOpeningRef.current) handleClose({ x: 0, y: 0 });
        else handleOpen({ x: 0, y: 0 });
        return;
      }
      if (!isOpeningRef.current) return;
      const landing = dragY.get() + project(velocity.y);
      if (landing > containerH.get() * DISMISS_DISTANCE) handleClose(velocity);
      else handleOpen(velocity);
    },
  });

  const city = selected !== null ? cities[selected] : null;

  return (
    <div className="w-full flex items-center justify-center px-4 py-8">
      <div className="flex flex-col max-w-100 w-full gap-6">
        {!embedded && (
          <p className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
            Tap a city. The card grows out of its tile, and the weather glyph
            stays the same the whole way, so it reads as one object. Drag it
            down to put it back: let go past a quarter of the way and it
            returns, carrying the speed of your flick.
          </p>
        )}
        <div
          ref={containerRef}
          className="max-w-100 w-full h-100 bg-[oklch(0.982_0_0)] rounded-2xl p-4 relative overflow-hidden"
        >
          <div className="grid grid-cols-3 gap-x-3 gap-y-4">
            {cities.map((item, index) => {
              return (
                <button
                  key={item.id}
                  type="button"
                  className="flex flex-col gap-1.5 text-left cursor-pointer"
                  onClick={() => {
                    openItem(index);
                    // openItem(index);
                  }}
                >
                  {/* Measured for the morph: the cover only, not the labels */}
                  <div
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    className="relative w-full aspect-square rounded-xl overflow-hidden"
                    // Hidden while the card is out, so it can't show behind it
                    style={{ opacity: selected === index ? 0 : 1 }}
                  >
                    <Cover city={item} />
                  </div>
                  <motion.div
                    className="flex flex-col"
                    style={{ opacity: selected === index ? labelOpacity : 1 }}
                  >
                    <span className="truncate font-geist text-xs font-medium leading-4 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
                      {item.name}
                    </span>
                    <span className="truncate font-geist text-[10px] leading-3.5 tracking-[-0.08px] tabular-nums text-[oklch(0.649_0_0)]">
                      {item.temp}° · {item.summary}
                    </span>
                  </motion.div>
                </button>
              );
            })}
          </div>

          <motion.div
            style={{ opacity: dim }}
            className="pointer-events-none absolute inset-0 bg-white"
          />

          {city && (
            <motion.div
              style={{
                height,
                width,
                top,
                left,
                x: dragX,
                y: dragY,
                scale,
                opacity: cardOpacity,
              }}
              {...drag}
              className="absolute inset-0 z-9 flex flex-col overflow-hidden rounded-xl bg-[oklch(0.993_0_0)] shadow-[0_0_0_1px_#0000000A,0_8px_24px_0_#0000000D] cursor-grab active:cursor-grabbing touch-none select-none"
            >
              <motion.div
                style={{ height: coverHeight }}
                className="relative shrink-0 overflow-hidden"
              >
                <Cover city={city} />
              </motion.div>

              <motion.div
                style={{ opacity: bodyOpacity }}
                className="flex flex-1 flex-col gap-3 overflow-hidden p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-col">
                    <p className="truncate font-geist text-sm font-medium leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
                      {city.name}
                    </p>
                    <p className="truncate font-geist text-xs leading-4 tracking-[-0.08px] text-[oklch(0.649_0_0)]">
                      {city.summary}
                    </p>
                  </div>
                  <p className="font-geist text-3xl font-light leading-9 tracking-[-0.5px] tabular-nums text-[oklch(0.375_0_0)]">
                    {city.temp}°
                  </p>
                </div>

                <div className="flex justify-between rounded-lg bg-[oklch(0.961_0_0)] px-3 py-2">
                  {city.hourly.map(([time, temp]) => (
                    <div
                      key={time}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <span className="font-geist text-[10px] leading-3.5 text-[oklch(0.649_0_0)]">
                        {time}
                      </span>
                      <span className="font-geist text-xs font-medium leading-4 tabular-nums text-[oklch(0.503_0_0)]">
                        {temp}°
                      </span>
                    </div>
                  ))}
                </div>

                <p className="font-geist text-xs leading-4 tracking-[-0.08px] tabular-nums text-[oklch(0.649_0_0)]">
                  H:{city.high}° L:{city.low}°
                </p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
