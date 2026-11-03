"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  MotionValue,
  steps,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { Archive, MailOpen, Pin, Trash2 } from "lucide-react";
import { useDrag } from "../use-drag";
import {
  applyRubberBand,
  springFromResponse,
  clamp,
  DECELERATION,
  project,
} from "../physics";

type Axis = "x" | "y" | null;
type Mode = "normal" | "fast" | "paging";

const bgs = [
  // "oklch(0.982 0 0)",
  "oklch(0.961 0 0)",
  "oklch(0.94 0 0)",
  "oklch(0.918 0 0)",
];

const GAP = 24;
// The track has a fixed height and its cards overflow it. On an element that
// isn't itself a scroll container, scrollHeight includes the top padding but
// not the bottom, so getMin adds it back. Keep in sync with the track's py-6.
const TRACK_PADDING_BOTTOM = 24;
// Pull-to-refresh: nothing shows for the first STICK_OFFSET px (it's hidden
// behind the padding), then one stick appears every STICK_STEP px, so all 8
// are showing right as the pull crosses REFRESH_THRESHOLD.
const STICK_COUNT = 8;
const STICK_OFFSET = 8;
const STICK_STEP = 4.5;
const REFRESH_THRESHOLD = STICK_OFFSET + STICK_COUNT * STICK_STEP; // 56
// Where the list rests while loading: a little short of the trigger point, so
// on release it visibly settles back up instead of just stopping dead.
const LOADING_REST = REFRESH_THRESHOLD - STICK_OFFSET * 1.5; // 48
const REFRESH_DURATION = 3000;
// Spinner: a bright head goes clockwise round the sticks once per second. As
// the head passes, each stick runs through this opacity cycle.
const SPIN = [1, 0.75, 0.5, 0.25, 0.25, 0.25, 0.5, 0.75];
const BOUNCE = springFromResponse(0.5, 1);
const PAGE = springFromResponse(0.4, 1);

const MODES: { value: Mode; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "fast", label: "Fast" },
  { value: "paging", label: "Paging" },
];

const PILL = springFromResponse(0.35, 0.9);

const CARD_HEIGHT = 60;
// Swipe actions: two square buttons per side, so the card opens to 120px and
// rubber bands past that.
const ACTION_SIZE = CARD_HEIGHT;
const ACTIONS_WIDTH = ACTION_SIZE * 2;
// Each button is drawn this wide but mostly hidden under the card, so it can
// stretch past 60px during the rubber band without any layout. The rubber band
// never reaches a card's width, so half of a 400px card plus 60 is plenty.
const BUTTON_WIDTH = 280;
const SWIPE = springFromResponse(0.4, 1);
// A drag waits this long before deciding: mostly sideways swipes the card,
// anything else scrolls the list.
const LOCK_THRESHOLD = 10;

type DragHandlers = Parameters<typeof useDrag>[0];

interface IActionButton {
  // Visible width of each button: 0→60 while opening, past 60 when stretched
  size: MotionValue<number>;
  // 0 sits against the edge, 1 next to it
  slot: number;
  side: "left" | "right";
  className: string;
  children: React.ReactNode;
}

// 60px tall, moved with transforms only (no layout). Each slides out from
// under the card so the two always exactly fill the gap it leaves: slot 0 shows
// 0→size, slot 1 shows size→2·size. Past 60 they keep going, so they stretch
// with the card in the rubber band. Slot 0 stacks on top so slot 1 can tuck
// behind it. The icon sits in a 60px square on the card-facing edge.
function ActionButton(props: IActionButton) {
  const { size, slot, side, className, children } = props;
  const sign = side === "left" ? 1 : -1;
  const x = useTransform(size, (s) => sign * ((slot + 1) * s - BUTTON_WIDTH));

  return (
    <motion.button
      type="button"
      // Keep the press from starting a list drag, which would capture the
      // pointer and swallow this button's click
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        x,
        width: BUTTON_WIDTH,
        height: ACTION_SIZE,
        zIndex: 2 - slot,
      }}
      className={`absolute top-0 flex text-white ${side === "left" ? "left-0 justify-end" : "right-0 justify-start"} ${className}`}
    >
      <span className="flex size-15 shrink-0 items-center justify-center">
        {children}
      </span>
    </motion.button>
  );
}

interface ICard {
  index: number;
  // The list's scroll handlers, for drags that lock vertically
  scroll: DragHandlers;
}

function Card(props: ICard) {
  const { index, scroll } = props;

  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const originX = useRef(0);
  const axis = useRef<Axis>(null);
  const lockAt = useRef({ x: 0, y: 0 });

  // Set at grab time: a card that's already open can only close, so a hard
  // swipe the other way rubber bands at 0 without revealing the other side
  const openSide = useRef<"left" | "right" | null>(null);

  const left = useTransform(x, (v) =>
    openSide.current === "right" ? 0 : Math.max(0, v / 2),
  );
  const right = useTransform(x, (v) =>
    openSide.current === "left" ? 0 : Math.max(0, -v / 2),
  );

  const drag = useDrag({
    onStart: () => {
      // Touching a card stops the list, like any iOS scroll view
      scroll.onStart?.();
      x.stop();
      originX.current = x.get();
      openSide.current =
        originX.current > 0 ? "left" : originX.current < 0 ? "right" : null;
      axis.current = null;
    },
    onMove: (delta) => {
      if (axis.current === null) {
        if (Math.hypot(delta.x, delta.y) < LOCK_THRESHOLD) return;
        axis.current = Math.abs(delta.x) > Math.abs(delta.y) ? "x" : "y";
        // Measure from here so nothing jumps by the 10px it took to decide
        lockAt.current = delta;
      }

      if (axis.current === "y") {
        scroll.onMove({ x: 0, y: delta.y - lockAt.current.y });
        return;
      }

      x.set(
        applyRubberBand(
          originX.current + delta.x - lockAt.current.x,
          openSide.current === "left" ? 0 : -ACTIONS_WIDTH,
          openSide.current === "right" ? 0 : ACTIONS_WIDTH,
          cardRef.current!.clientWidth,
        ),
      );
    },
    onEnd: (velocity) => {
      // The list always gets its onEnd (it tracks dragging state), but only a
      // vertical drag hands it any speed
      scroll.onEnd?.(axis.current === "y" ? velocity : { x: 0, y: 0 });
      if (axis.current !== "x") return;

      const landing = x.get() + project(velocity.x);
      const opensLeft =
        openSide.current !== "right" && landing > ACTIONS_WIDTH / 2;
      const opensRight =
        openSide.current !== "left" && landing < -ACTIONS_WIDTH / 2;
      const target = opensLeft
        ? ACTIONS_WIDTH
        : opensRight
          ? -ACTIONS_WIDTH
          : 0;
      animate(x, target, { ...SWIPE, velocity: velocity.x });
    },
  });

  return (
    <div
      ref={cardRef}
      className="relative w-full shrink-0 overflow-hidden"
      style={{ height: CARD_HEIGHT }}
    >
      <ActionButton
        size={left}
        slot={0}
        side="left"
        className="bg-[oklch(0.556_0_0)]"
      >
        <Pin size={20} aria-label="Pin" />
      </ActionButton>
      <ActionButton
        size={left}
        slot={1}
        side="left"
        className="bg-[oklch(0.708_0_0)]"
      >
        <MailOpen size={20} aria-label="Mark as read" />
      </ActionButton>
      <ActionButton
        size={right}
        slot={0}
        side="right"
        className="bg-[oklch(0.375_0_0)]"
      >
        <Trash2 size={20} aria-label="Delete" />
      </ActionButton>
      <ActionButton
        size={right}
        slot={1}
        side="right"
        className="bg-[oklch(0.556_0_0)]"
      >
        <Archive size={20} aria-label="Archive" />
      </ActionButton>

      <motion.div
        {...drag}
        style={{ x, background: bgs[index % bgs.length] }}
        className="relative z-10 flex h-full w-full items-end p-4"
      >
        <p className="text-xs leading-3.5 text-[oklch(0.503_0_0)]">
          {/* {index + 1} */}
        </p>
      </motion.div>
    </div>
  );
}

export default function Page() {
  const [mode, setMode] = useState<Mode>("normal");
  // A ref, not state: nothing renders from it, and the gesture handlers need
  // the latest value on every pointermove.
  const loadingRef = useRef(false);
  const loadingTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const isDragging = useRef(false);
  // Top edge for the current drag, fixed at grab time. If it switched to the
  // threshold mid-drag (when loading starts), the rubber band would suddenly
  // stop squashing the first 56px and the list would jump.
  const dragMax = useRef(0);

  const axis = useRef<Axis>(null);
  const boundaryRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const originY = useRef(0);
  const frame = useRef<number>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);

  const sticks = () => [...spinnerRef.current!.children] as HTMLElement[];

  // Written straight to the DOM, no state, so pulling never re-renders
  const showSticks = (count: number) => {
    sticks().forEach((stick, index) => {
      stick.style.display = index < count ? "block" : "none";
    });
  };

  // While loading, the list rests at LOADING_REST (like iOS's content inset)
  // instead of 0, so the spinner stays visible.
  const getMax = () => (loadingRef.current ? LOADING_REST : 0);

  const getMin = () =>
    Math.min(
      0,
      trackRef.current!.clientHeight -
        (trackRef.current!.scrollHeight + TRACK_PADDING_BOTTOM),
    );

  const y = useMotionValue(0);

  const stop = () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    y.stop();
  };

  // eslint-disable-next-line
  useEffect(() => stop, []);

  useEffect(
    () => () => {
      if (loadingTimer.current) clearTimeout(loadingTimer.current);
    },
    [],
  );

  // Which stick is brightest (0–7). Animated by Motion, painted by us, so the
  // spin never goes through WAAPI and stopping it is synchronous.
  const head = useMotionValue(0);

  useMotionValueEvent(head, "change", (h) => {
    sticks().forEach((stick, index) => {
      stick.style.opacity = String(
        SPIN[(h - index + STICK_COUNT) % STICK_COUNT],
      );
    });
  });

  const startRefresh = () => {
    loadingRef.current = true;

    // steps() makes the head jump stick to stick (0, 1, … 7) like iOS
    animate(head, [0, STICK_COUNT], {
      duration: 1,
      repeat: Infinity,
      ease: steps(STICK_COUNT),
    });

    loadingTimer.current = setTimeout(() => {
      loadingRef.current = false;
      head.stop();
      sticks().forEach((stick) => (stick.style.opacity = ""));
      // Mid-drag, onEnd will send it home; otherwise close the gap now
      if (!isDragging.current && y.get() > 0) {
        showSticks(0);
        animate(y, 0, BOUNCE);
      }
    }, REFRESH_DURATION);
  };

  const coast = (v0: number, rate: number) => {
    const min = getMin();
    const max = getMax();
    const p0 = y.get();
    const t0 = performance.now();
    const lnRate = Math.log(rate);

    const tick = () => {
      const t = performance.now() - t0;
      const decay = Math.pow(rate, t);
      const position = p0 + (v0 * (decay - 1)) / (1000 * lnRate);
      const velocity = v0 * decay;

      // Hit an edge mid-flight: hand the remaining speed to a spring so it bounces
      if (position > max || position < min) {
        const edge = clamp(position, min, max);
        y.set(edge);
        animate(y, edge, { ...BOUNCE, velocity });
        return;
      }

      y.set(position);
      if (Math.abs(velocity) > 10) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
  };

  // Shared by the track's own drag (gaps and padding) and every card's
  // vertically-locked drag
  const scroll: DragHandlers = {
    onStart: () => {
      stop();
      isDragging.current = true;
      originY.current = y.get();
      dragMax.current = getMax();
    },
    onMove: (delta) => {
      const rubberbandY = applyRubberBand(
        originY.current + delta.y,
        getMin(),
        dragMax.current,
        boundaryRef.current!.clientHeight,
      );

      // All sticks stay up while loading
      if (!loadingRef.current) {
        showSticks(
          clamp(
            Math.floor((rubberbandY - STICK_OFFSET) / STICK_STEP),
            0,
            STICK_COUNT,
          ),
        );
      }

      if (rubberbandY > REFRESH_THRESHOLD && !loadingRef.current) {
        startRefresh();
      }

      y.set(rubberbandY);
    },
    onEnd: (velocity) => {
      isDragging.current = false;
      const min = getMin();
      const position = y.get();

      // Loading: anywhere in the top overscroll settles at the rest position
      if (loadingRef.current && position > 0) {
        animate(y, LOADING_REST, { ...BOUNCE, velocity: velocity.y });
        return;
      }

      if (position > 0 || position < min) {
        if (position > 0) showSticks(0);
        animate(y, clamp(position, min, 0), {
          ...BOUNCE,
          velocity: velocity.y,
        });
        return;
      }

      if (mode === "paging") {
        const step = CARD_HEIGHT + GAP;
        const landing = position + project(velocity.y, DECELERATION.fast);
        const target = clamp(Math.round(landing / step) * step, min, 0);
        animate(y, target, { ...PAGE, velocity: velocity.y });
        return;
      }

      const rate = mode === "fast" ? DECELERATION.fast : DECELERATION.normal;
      coast(velocity.y, rate);
    },
  };

  const drag = useDrag(scroll);

  return (
    <div className="h-screen w-full flex items-center justify-center px-4">
      <div className="flex flex-col gap-6 max-w-100 w-full">
        <p className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
          Direction lock in a real list. Swipe a row sideways to reveal its
          actions, or drag up and down to scroll. Every drag waits 10pt, then
          commits to one axis, so a scroll never nudges a row and a swipe never
          moves the list. Pull down from the top to refresh.
        </p>
        <div
          ref={boundaryRef}
          // {...drag}
          className="relative cursor-grab touch-none select-none overflow-hidden border border-white/10 active:cursor-grabbing max-w-100 w-full b-[oklch(0.865_0_0)]"
        >
          <div className="absolute top-0 left-0 w-full py-1 flex items-center justify-center pointer-events-none">
            <div ref={spinnerRef} className="relative w-8 h-8">
              {Array(STICK_COUNT)
                .fill(0)
                .map((_, index) => {
                  return (
                    // Centre each stick, rotate it to its slot, then push it
                    // out along its own (rotated) axis so the outer end
                    // touches the edge. Inline transform, since Tailwind's
                    // rotate/translate utilities can't control the order.
                    <div
                      key={index}
                      className="hidden absolute left-1/2 top-1/2 -ml-0.5 -mt-1.25 w-0.75 h-2.25 rounded-full bg-[oklch(0.649_0_0)]"
                      style={{
                        transform: `rotate(${index * 45}deg) translateY(-8px)`,
                      }}
                    ></div>
                  );
                })}
            </div>
          </div>
          <motion.div
            ref={trackRef}
            {...drag}
            style={{ y }}
            className="w-full flex flex-col h-68.5 px-0 py-6 gap-6 relative bg-white b-[oklch(0.865_0_0)]"
          >
            {Array(10)
              .fill(0)
              .map((_, index) => {
                return <Card key={index} index={index} scroll={scroll} />;
              })}
          </motion.div>
        </div>

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
                    layoutId="lock-example-mode-pill"
                    transition={PILL}
                    className="absolute inset-0 rounded-lg bg-white shadow-[0_0_0_1px_#0000001C,0_1px_3px_0_#00000017]"
                  />
                )}
                <span className="relative">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
