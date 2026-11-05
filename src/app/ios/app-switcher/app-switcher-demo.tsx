"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { IDemo } from "../demo";
import {
  animate,
  motion,
  MotionValue,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useDrag } from "../use-drag";
import { useMotionPreference } from "../use-motion-preference";
import {
  applyRubberBand,
  clamp,
  FADE,
  Point,
  project,
  rubberBand,
  springFromResponse,
  VelocityTracker,
} from "../physics";
import { MapsScreen } from "./map-screen";
import { MusicScreen } from "./music-screen";
import { MessagesScreen } from "./messages-screen";
import { BrowserScreen } from "./browser-screen";

// Empty slots: one shared colour, faded, so they read as placeholders
const EMPTY_BG = "oklch(0.918 0 0)";

const apps = [
  // Each icon takes the signature colour of its screen: Maps' city blocks,
  // Music's album art, Messages' sent bubble, Browser's address bar
  { id: 1, name: "Browser", bg: "oklch(0.993 0 0)" },
  { id: 2, name: "Maps", bg: "oklch(0.94 0 0)" },
  { id: 3, name: "Music", bg: "oklch(0.918 0 0)" },
  { id: 4, name: "Messages", bg: "oklch(0.894 0 0)" },
];

type App = (typeof apps)[number];

const components = [
  { id: 1, component: BrowserScreen },
  { id: 2, component: MapsScreen },
  { id: 3, component: MusicScreen },
  { id: 4, component: MessagesScreen },
];

// corner-shape: squircle gives Apple's continuous corners (Chromium 139+).
// A squircle looks tighter than a circular corner of the same radius, so the
// radii are set larger. Browsers without it (Safari, Firefox) get a plain round
// corner at ~0.6x, which looks about the same, via supports-[corner-shape:…].
const SQUIRCLE = "[corner-shape:squircle]";

// Inline radii skip the supports-[…] fallback classes, so pick the value
// here: the squircle size where it's supported, the ~0.6x round one elsewhere.
// The frame and the app cards share it, so a full-size card lines up exactly.
// The server can't check, so it assumes squircle and the client corrects it
// after hydration (no mismatch warning).
const useScreenRadius = () =>
  useSyncExternalStore(
    () => () => {},
    () => (CSS.supports("corner-shape", "squircle") ? 48 : 29),
    () => 48,
  );

export const SCREEN_HEIGHT = 956 * 0.55;
export const SCREEN_WIDTH = 440 * 0.6;

const MIN_CARD_SCALE = 0.5;
const SWITCHER_SCALE = 0.6;
const GAP = 16;
// Distance between cards in the switcher
const STEP = SCREEN_WIDTH * SWITCHER_SCALE + GAP;

const FLICK_SPEED = 210; // px/s upward → always home
const HOME_PROGRESS = 0.6; // past 60% of the screen height → always home
const MIN_UP = 50; // px up before the switcher zone starts
// Speed below this opens the switcher; it climbs while you hover in the zone
const BASE_PAUSE_SPEED = 51; // px/s
const MAX_PAUSE_SPEED = 134; // px/s
const THRESHOLD_EASE = 0.2; // fraction of the remaining gap closed per 60Hz frame

const SPRING = springFromResponse(0.45, 0.86);

type Mode = "app" | "switcher" | "home";
type Outcome = "app" | "switcher" | "home" | "prev" | "next";

const inSwitcherZone = (up: number) =>
  up > MIN_UP && up < SCREEN_HEIGHT * HOME_PROGRESS;

const decide = (
  delta: Point,
  velocity: Point,
  pauseThreshold: number,
  current: number,
  count: number,
): Outcome => {
  // Mostly sideways along the bar: switch apps
  if (
    Math.abs(velocity.x) > 2 * Math.abs(velocity.y) &&
    Math.abs(delta.x) > 40
  ) {
    const outcome = delta.x < 0 ? "next" : "prev";
    const target = current + (outcome === "next" ? 1 : -1);
    return target >= 0 && target < count ? outcome : "app";
  }
  const up = -delta.y;
  if (-velocity.y > FLICK_SPEED || up > SCREEN_HEIGHT * HOME_PROGRESS)
    return "home";
  if (inSwitcherZone(up) && Math.hypot(velocity.x, velocity.y) < pauseThreshold)
    return "switcher";
  return "app";
};

interface IAppCard {
  app: App;
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  opacity: MotionValue<number>;
  radius: number;
}

// One app's screen as a card. Moved with transforms only; the radius scales
// down with it, so it lands close to the icon's when it flies home.
function AppCard(props: IAppCard) {
  const { app, x, y, scale, opacity, radius } = props;
  const Screen = components.find((item) => item.id === app.id)!.component;

  return (
    <motion.div
      style={{ x, y, scale, opacity, borderRadius: radius, background: app.bg }}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${SQUIRCLE} shadow-[0_8px_32px_0_#00000014]`}
    >
      <Screen />
    </motion.div>
  );
}

// The home indicator, and the handle for the whole gesture. The padding is
// the grab area, so it's easy to hit even though the bar is only 5px tall.
function HomeIndicator(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="absolute bottom-0 left-0 right-0 z-10 flex justify-center px-6 pt-4 pb-2 cursor-grab touch-none select-none active:cursor-grabbing"
    >
      <div className="w-24 h-1.25 rounded-full bg-[oklch(0.649_0_0)]"></div>
    </div>
  );
}

export function AppSwitcherDemo(props: IDemo) {
  const { embedded = false } = props;
  // Reduced motion: no flying to and from the icons (apps fade in and out in
  // place) and no overshoot. The card still follows the finger while dragging.
  const { reduceMotion, spring } = useMotionPreference();

  const screenRadius = useScreenRadius();

  // Every app opened so far, most recent first
  const [openApps, setOpenApps] = useState<App[]>([]);
  // Oldest → newest, so the most recent sits on the right like iOS, and
  // "previous app" (swipe right along the bar) is the one to its left
  const stack = [...openApps].reverse();
  // Which card is in front. Normally the newest; swiping along the bar or in
  // the switcher moves it, and it's committed back to the front of openApps
  // when the next gesture starts or you go home.
  const [current, setCurrent] = useState(0);
  const [mode, setMode] = useState<Mode>("home");
  const app = stack[current];

  const phoneRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const cardScale = useMotionValue(1);
  const cardOpacity = useMotionValue(0);
  const neighborOpacity = useMotionValue(0);
  const backdrop = useMotionValue(0);
  // Neighbours sit one card-width (at the current scale) either side
  const leftX = useTransform(
    [cardX, cardScale],
    ([x, s]: number[]) => x - (SCREEN_WIDTH * s + GAP),
  );
  const rightX = useTransform(
    [cardX, cardScale],
    ([x, s]: number[]) => x + (SCREEN_WIDTH * s + GAP),
  );

  // Per-frame gesture state lives in refs, so the drag never re-renders
  const tracker = useRef(new VelocityTracker());
  const lastDelta = useRef<Point>({ x: 0, y: 0 });
  const pauseThreshold = useRef(BASE_PAUSE_SPEED);
  const lastTick = useRef(0);
  const frame = useRef<number>(null);
  const origin = useRef(0);
  const downPoint = useRef<Point>({ x: 0, y: 0 });
  const isSliding = useRef(false);
  const neighborsShown = useRef(false);
  // Fixed at drag start, for the per-frame tick (which outlives renders)
  const dragStack = useRef({ current: 0, count: 0 });

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const showNeighbors = (show: boolean) => {
    if (show === neighborsShown.current) return;
    neighborsShown.current = show;
    animate(neighborOpacity, show ? 1 : 0, { duration: 0.2 });
    animate(backdrop, show ? 1 : 0, { duration: 0.25 });
  };

  const settle = (value: MotionValue<number>, target: number, velocity = 0) =>
    animate(value, target, { ...spring(SPRING), velocity });

  // Make the front card the most recent app, and its index the last one
  const commitCurrent = () => {
    if (current === stack.length - 1) return;
    const front = stack[current];
    setOpenApps((prev) => [
      front,
      ...prev.filter((item) => item.id !== front.id),
    ]);
    setCurrent(stack.length - 1);
  };

  // Where an app's icon sits, relative to the phone's centre. Read once per
  // gesture end, not per frame.
  const iconTarget = (target: App) => {
    const phone = phoneRef.current!.getBoundingClientRect();
    const icon =
      iconRefs.current[
        apps.findIndex((item) => item.id === target.id)
      ]!.getBoundingClientRect();
    return {
      x: icon.left + icon.width / 2 - (phone.left + phone.width / 2),
      y: icon.top + icon.height / 2 - (phone.top + phone.height / 2),
      scale: icon.width / SCREEN_WIDTH,
    };
  };

  const goApp = (velocity: Point) => {
    setMode("app");
    showNeighbors(false);
    cardOpacity.set(1);
    settle(cardX, 0, velocity.x);
    settle(cardY, 0, velocity.y);
    settle(cardScale, 1);
  };

  const goSwitcher = (velocity: Point) => {
    setMode("switcher");
    showNeighbors(true);
    settle(cardX, 0, velocity.x);
    settle(cardY, 0, velocity.y);
    settle(cardScale, SWITCHER_SCALE);
  };

  const goHome = (velocity: Point) => {
    setMode("home");
    showNeighbors(false);
    commitCurrent();
    if (reduceMotion) {
      // Fade out wherever the drag left it
      animate(cardOpacity, 0, FADE);
      return;
    }
    const target = iconTarget(app);
    settle(cardX, target.x, velocity.x);
    settle(cardY, target.y, velocity.y);
    settle(cardScale, target.scale);
    animate(cardOpacity, 0, { duration: 0.2, delay: 0.2 });
  };

  const switchTo = (index: number, velocity: Point) => {
    // The neighbour becomes the front card, so start it where the neighbour was
    cardX.set(
      cardX.get() + (index - current) * (SCREEN_WIDTH * cardScale.get() + GAP),
    );
    setCurrent(index);
    goApp(velocity);
  };

  const openFromHome = (target: App) => {
    const next = [target, ...openApps.filter((item) => item.id !== target.id)];
    setOpenApps(next);
    setCurrent(next.length - 1);
    if (reduceMotion) {
      // Appear full size and fade in, instead of growing out of the icon
      setMode("app");
      cardX.set(0);
      cardY.set(0);
      cardScale.set(1);
      cardOpacity.set(0);
      animate(cardOpacity, 1, FADE);
      return;
    }
    const from = iconTarget(target);
    cardX.set(from.x);
    cardY.set(from.y);
    cardScale.set(from.scale);
    goApp({ x: 0, y: 0 });
  };

  // Runs every frame while the finger is down, because a still finger sends
  // no pointer events. rAF's timestamp is on the same clock as performance.now().
  const tick = (now: number) => {
    const velocity = tracker.current.get();
    const up = -lastDelta.current.y;

    // Hovering in the zone raises the threshold toward 134; leaving it decays
    // back to 51. Scaled by frame time so 120Hz screens don't climb twice as fast.
    const target = inSwitcherZone(up) ? MAX_PAUSE_SPEED : BASE_PAUSE_SPEED;
    const ease =
      1 - Math.pow(1 - THRESHOLD_EASE, (now - lastTick.current) / (1000 / 60));
    pauseThreshold.current += (target - pauseThreshold.current) * ease;
    lastTick.current = now;

    const { current: index, count } = dragStack.current;
    const outcome = decide(
      lastDelta.current,
      velocity,
      pauseThreshold.current,
      index,
      count,
    );
    // Show the switcher while the finger is still down, as soon as letting go
    // would open it
    showNeighbors(outcome === "switcher" || isSliding.current);
    frame.current = requestAnimationFrame(tick);
  };

  const barDrag = useDrag({
    onStart: () => {
      cardX.stop();
      cardY.stop();
      cardScale.stop();
      // Neighbours are hidden here, so reordering is invisible
      commitCurrent();
      dragStack.current = { current: stack.length - 1, count: stack.length };
      tracker.current.reset();
      tracker.current.add(0, 0);
      lastDelta.current = { x: 0, y: 0 };
      pauseThreshold.current = BASE_PAUSE_SPEED;
      lastTick.current = performance.now();
      frame.current = requestAnimationFrame(tick);
    },
    onMove: (delta) => {
      lastDelta.current = delta;
      tracker.current.add(delta.x, delta.y);
      isSliding.current = Math.abs(delta.x) > 20;

      const up = Math.max(0, -delta.y);
      const scale =
        1 - (1 - MIN_CARD_SCALE) * clamp(up / (SCREEN_HEIGHT * 0.6), 0, 1);
      const dy = delta.y < 0 ? delta.y : rubberBand(delta.y, SCREEN_HEIGHT);
      cardScale.set(scale);
      cardX.set(delta.x);
      // Keep the card's bottom edge under the finger as it shrinks
      cardY.set(dy + (SCREEN_HEIGHT * (1 - scale)) / 2);
    },
    onEnd: () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      const velocity = tracker.current.get();
      const { current: index } = dragStack.current;
      const outcome = decide(
        lastDelta.current,
        velocity,
        pauseThreshold.current,
        index,
        stack.length,
      );
      isSliding.current = false;

      if (outcome === "home") goHome(velocity);
      else if (outcome === "switcher") goSwitcher(velocity);
      else if (outcome === "next") switchTo(index + 1, velocity);
      else if (outcome === "prev") switchTo(index - 1, velocity);
      else goApp(velocity);
    },
  });

  const onSwitcherTap = () => {
    const rect = phoneRef.current!.getBoundingClientRect();
    const px = downPoint.current.x - (rect.left + rect.width / 2);
    const py = downPoint.current.y - (rect.top + rect.height / 2);
    const index = current + Math.round(px / STEP);
    // Tapping outside the cards goes home
    if (
      Math.abs(py) > (SCREEN_HEIGHT * SWITCHER_SCALE) / 2 ||
      index < 0 ||
      index >= stack.length
    ) {
      goHome({ x: 0, y: 0 });
      return;
    }
    switchTo(index, { x: 0, y: 0 });
  };

  const switcherDrag = useDrag({
    onStart: () => {
      cardX.stop();
      origin.current = cardX.get();
      lastDelta.current = { x: 0, y: 0 };
    },
    onMove: (delta) => {
      lastDelta.current = delta;
      const min = -(stack.length - 1 - current) * STEP;
      const max = current * STEP;
      cardX.set(
        applyRubberBand(origin.current + delta.x, min, max, SCREEN_WIDTH),
      );
    },
    onEnd: (velocity) => {
      if (Math.hypot(lastDelta.current.x, lastDelta.current.y) < 6) {
        onSwitcherTap();
        return;
      }
      // Only the neighbours are rendered, so move at most one card per swipe
      const landing = cardX.get() + project(velocity.x);
      const index = clamp(
        current - Math.round(landing / STEP),
        Math.max(0, current - 1),
        Math.min(stack.length - 1, current + 1),
      );
      cardX.set(cardX.get() + (index - current) * STEP);
      setCurrent(index);
      settle(cardX, 0, velocity.x);
    },
  });

  const hint =
    mode === "home"
      ? "Tap an app icon to open it"
      : mode === "switcher"
        ? "Tap a card to open it, or outside to go home"
        : "Swipe up from the bar at the bottom";

  return (
    <div className="w-full flex items-center justify-center px-4 py-8">
      <div className="flex flex-col gap-6 max-w-100 w-full">
        {!embedded && (
          <p className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
            Swipe up from the bar. A fast flick or a long swipe goes home. Slow
            down partway and the app switcher opens, even before you let go, and
            the longer you hover the easier it is to land. Swipe sideways along
            the bar to jump between recent apps.
          </p>
        )}

        <div
          ref={phoneRef}
          className={`relative mx-auto overflow-hidden ${SQUIRCLE} bg-[oklch(0.961_0_0)]`}
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            borderRadius: screenRadius,
          }}
        >
          <div className="grid grid-cols-4 w-full px-5 py-10 gap-x-4 gap-y-4">
            {Array(16)
              .fill(0)
              .map((_, index) => {
                const item = apps[index] || undefined;

                return (
                  <button
                    key={index}
                    type="button"
                    className={item ? "cursor-pointer" : ""}
                    disabled={item === undefined || mode !== "home"}
                    onClick={() => {
                      if (item) openFromHome(item);
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        ref={(el) => {
                          iconRefs.current[index] = el;
                        }}
                        className={`w-full aspect-square rounded-[7px] supports-[corner-shape:squircle]:rounded-[12px] ${SQUIRCLE} ${item ? "shadow-[0_0_0_1px_#0000000A]" : "opacity-40"}`}
                        style={{
                          background: item?.bg ?? EMPTY_BG,
                        }}
                      ></div>
                      {/* "none" stays in the DOM, just hidden, so empty slots
                          keep the same height as named ones */}
                      <p
                        className={`font-geist text-[10px] leading-5 tracking-[-0.08px] text-[oklch(0.503_0_0)] text-center ${item ? "" : "invisible"} font-medium`}
                      >
                        {item?.name || "none"}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>

          <motion.div
            style={{ opacity: backdrop }}
            className="pointer-events-none absolute inset-0 bg-[oklch(0.961_0_0)]/60 backdrop-blur-md"
          />

          {current > 0 && (
            <AppCard
              app={stack[current - 1]}
              x={leftX}
              y={cardY}
              scale={cardScale}
              opacity={neighborOpacity}
              radius={screenRadius}
            />
          )}
          {current < stack.length - 1 && (
            <AppCard
              app={stack[current + 1]}
              x={rightX}
              y={cardY}
              scale={cardScale}
              opacity={neighborOpacity}
              radius={screenRadius}
            />
          )}
          {app && (
            <AppCard
              app={app}
              x={cardX}
              y={cardY}
              scale={cardScale}
              opacity={cardOpacity}
              radius={screenRadius}
            />
          )}

          {mode === "app" && <HomeIndicator {...barDrag} />}
          {mode === "switcher" && (
            <div
              {...switcherDrag}
              onPointerDown={(e) => {
                downPoint.current = { x: e.clientX, y: e.clientY };
                switcherDrag.onPointerDown(e);
              }}
              className="absolute inset-0 z-10 cursor-grab touch-none select-none active:cursor-grabbing"
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="rounded-xl bg-[oklch(0.982_0_0)] px-4 py-3">
            <p className="truncate font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
              {hint}
            </p>
          </div>
          <pre className="no-scrollbar overflow-x-auto rounded-xl bg-[oklch(0.982_0_0)] px-4 py-3 font-mono text-xs leading-relaxed text-[rgb(3_47_98)] w-full">
            {
              "up speed > 210 pt/s  or  up > 60% → home\nspeed < threshold (in zone: 50px … 60%) → app switcher\nthreshold eases 51 → 134 pt/s while you hover in the zone\nsideways along the bar → previous / next app"
            }
          </pre>
        </div>
      </div>
    </div>
  );
}
