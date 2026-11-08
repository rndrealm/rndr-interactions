"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { useDrag } from "../../use-drag";
import {
  applyRubberBand,
  springFromResponse,
  clamp,
  DECELERATION,
  project,
} from "../../physics";
import { Archive, Delete, Dollar, Pin, TokenIcon } from "./icons";
import { Alert, formatAge, initialFeed, refreshFeed } from "./feed";

type Axis = "x" | "y" | null;
type Mode = "normal" | "fast" | "paging";

const GAP = 24;
// Pull-to-refresh: nothing shows for the first PULL_START px (it's hidden
// behind the padding), then the ring traces itself round from the top, closing
// into a full circle right as the pull crosses REFRESH_THRESHOLD.
const PULL_START = 8;
const REFRESH_THRESHOLD = 56;
// Where the list rests while loading: a little short of the trigger point, so
// on release it visibly settles back up instead of just stopping dead.
const LOADING_REST = REFRESH_THRESHOLD - PULL_START * 1.5; // 44
const REFRESH_DURATION = 3000;
// While loading, a solid segment this long (a fraction of the ring) travels
// round the full ring to show it's spinning
const HEAD_ARC = 0.25;
// Two turns stacked, one second each: the whole ring turns at a constant
// speed, and the segment turns again inside it with ease-in-out. Together the
// segment surges and then eases off every turn instead of circling flat.
const SPIN_DURATION = 1; // seconds per turn
const BOUNCE = springFromResponse(0.5, 1);
const PAGE = springFromResponse(0.4, 1);

const PILL = springFromResponse(0.35, 0.9);

const CARD_HEIGHT = 48;
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
      <span className="flex size-12 shrink-0 items-center justify-center">
        {children}
      </span>
    </motion.button>
  );
}

interface ICard {
  index: number;
  // Rounds the bottom corners, as the first card rounds the top
  isLast: boolean;
  alert: Alert;
  // The list's scroll handlers, for drags that lock vertically
  scroll: DragHandlers;
}

function Card(props: ICard) {
  const { index, isLast, alert, scroll } = props;

  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const originX = useRef(0);
  const axis = useRef<Axis>(null);
  const lockAt = useRef({ x: 0, y: 0 });

  // Set at grab time: a card that's already open can only close, so a hard
  // swipe the other way rubber bands at 0 without revealing the other side
  const openSide = useRef<"left" | "right" | null>(null);
  // Where the card was last sent: 0 closed, ±ACTIONS_WIDTH open. The open side
  // is read from this, not from x: a card finishing its close sits a fraction
  // of a pixel off 0 for a while after it looks shut, and reading x would
  // count it as still open, so only that side could be swiped.
  const restingAt = useRef(0);

  const left = useTransform(x, (v) =>
    openSide.current === "right" ? 0 : Math.max(0, v / 2),
  );
  const right = useTransform(x, (v) =>
    openSide.current === "left" ? 0 : Math.max(0, -v / 2),
  );

  const drag = useDrag({
    onStart: (start) => {
      // Touching a card stops the list, like any iOS scroll view
      scroll.onStart?.(start);
      x.stop();
      originX.current = x.get();
      openSide.current =
        restingAt.current > 0 ? "left" : restingAt.current < 0 ? "right" : null;
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
      restingAt.current = target;
      animate(x, target, { ...SWIPE, velocity: velocity.x });
    },
  });

  return (
    <div
      ref={cardRef}
      // Rounded on the card's own clipping box rather than the sliding row,
      // so the action buttons are clipped to the same corners when swiped
      className={`relative w-full shrink-0 overflow-hidden border-b border-[#0000000A] ${index === 0 ? "rounded-t-[12px]" : ""} ${isLast ? "rounded-b-[12px]" : ""}`}
      style={{ height: CARD_HEIGHT }}
    >
      <ActionButton size={left} slot={0} side="left" className="bg-[#9CA2FF]">
        <Pin />
      </ActionButton>
      <ActionButton size={left} slot={1} side="left" className="bg-[#90DB92]">
        <Dollar />
      </ActionButton>
      <ActionButton size={right} slot={0} side="right" className="bg-[#E55767]">
        <Delete />
      </ActionButton>
      <ActionButton size={right} slot={1} side="right" className="bg-[#CCD1D9]">
        <Archive />
      </ActionButton>

      <motion.div
        {...drag}
        style={{ x }}
        className="relative z-10 flex h-full w-full justify-between items-center px-6.5 bg-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-6.5 h-6.5 rounded-full">
            <TokenIcon symbol={alert.symbol} />
          </div>
          {/* Fixed width so the price column lines up on every row. The
              longest titles (~145px) end in "…" at 140px. */}
          <p className="w-35 shrink-0 truncate text-[#0B0B0B] font-medium text-sm leading-5 tracking-[-0.46%]">
            {alert.title}
          </p>
          <p className="text-[#4343438C] font-medium text-sm leading-5 tracking-[-0.46%]">
            {alert.detail}
          </p>
        </div>
        <p className="text-[#4343438C] font-medium text-sm leading-5 tracking-[-0.46%] font-geist">
          {formatAge(alert.minutesAgo)}
        </p>
      </motion.div>
    </div>
  );
}

export default function Page() {
  const [mode] = useState<Mode>("normal");
  // Only changes when a refresh finishes, never per frame
  const [feed, setFeed] = useState(initialFeed);
  // A ref, not state: nothing renders from it, and the gesture handlers need
  // the latest value on every pointermove.
  const loadingRef = useRef(false);
  const loadingTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const isDragging = useRef(false);
  // Top edge for the current drag, fixed at grab time. If it switched to the
  // threshold mid-drag (when loading starts), the rubber band would suddenly
  // stop squashing the first 56px and the list would jump.
  const dragMax = useRef(0);

  const boundaryRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const originY = useRef(0);
  const frame = useRef<number>(null);
  const ringRef = useRef<SVGSVGElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const headRef = useRef<SVGCircleElement>(null);

  // How much of the ring is drawn, 0–1. The circle's pathLength is 1, so the
  // dash offset is simply the part still missing. Written straight to the DOM,
  // no state, so pulling never re-renders.
  const showRing = (progress: number) => {
    arcRef.current!.style.strokeDashoffset = String(1 - progress);
    // At 0 the round cap would still paint a dot
    ringRef.current!.style.opacity = progress > 0 ? "1" : "0";
  };

  // While loading, the list rests at LOADING_REST (like iOS's content inset)
  // instead of 0, so the spinner stays visible.
  const getMax = () => (loadingRef.current ? LOADING_REST : 0);

  // The track has a fixed height and its cards overflow it. On an element
  // that isn't itself a scroll container, scrollHeight includes the top
  // padding but not the bottom, so the bottom padding is added back. Read from
  // the element, so it can't drift from the className (it's 0 for py-0).
  const getMin = () => {
    const track = trackRef.current!;
    const paddingBottom = parseFloat(getComputedStyle(track).paddingBottom);
    return Math.min(
      0,
      track.clientHeight - (track.scrollHeight + paddingBottom),
    );
  };

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

  // Rotations while loading, for the whole ring (linear) and the segment on top
  // of it (ease-in-out). Animated by Motion and stopped synchronously when
  // loading ends.
  const spin = useMotionValue(0);
  const headSpin = useMotionValue(0);

  // Set when a refresh ends: the list springs back from LOADING_REST, and the
  // full ring should erase over that trip rather than snap to where 44px sits
  // on the pull scale first
  const returningFromRest = useRef(false);

  // The ring follows the list's position, so it traces in as you pull and
  // erases as the list springs back, exactly as if you'd dragged it back
  // up. While loading it stays full and spins instead.
  useMotionValueEvent(y, "change", (value) => {
    if (loadingRef.current) return;
    const progress = returningFromRest.current
      ? value / LOADING_REST
      : (value - PULL_START) / (REFRESH_THRESHOLD - PULL_START);
    showRing(clamp(progress, 0, 1));
    if (value <= 0) returningFromRest.current = false;
  });

  const startRefresh = () => {
    loadingRef.current = true;

    // The ring stays complete as the track; the segment shows the spin
    showRing(1);
    headRef.current!.style.opacity = "1";
    animate(spin, [0, 360], {
      duration: SPIN_DURATION,
      repeat: Infinity,
      ease: "linear",
    });
    animate(headSpin, [0, 360], {
      duration: SPIN_DURATION,
      repeat: Infinity,
      ease: "easeInOut",
    });

    loadingTimer.current = setTimeout(() => {
      loadingRef.current = false;
      setFeed(refreshFeed());
      spin.stop();
      spin.set(0);
      headSpin.stop();
      headSpin.set(0);
      headRef.current!.style.opacity = "0";
      // Mid-drag, onEnd will send it home; otherwise close the gap now
      if (!isDragging.current && y.get() > 0) {
        returningFromRest.current = true;
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
      // A grab takes over from any return trip
      returningFromRest.current = false;
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
    <div className="h-screen w-full flex items-center justify-center  bg-[#F8F8F8]">
      <div className="w-full flex items-center justify-center px-4 py-8">
        <div className="flex flex-col gap-6 max-w-125 w-full">
          <div className="flex flex-col gap-4.5">
            <div className="flex justify-between items-center">
              <div className="h-8 flex items-center px-2.5">
                <p className="text-[#0B0B0B] font-geist font-medium text-sm leading-5 tracking-[-0.46%]">
                  Updates
                </p>
              </div>

              <div className="h-8 bg-[#EDEDED] flex items-center px-2.5 rounded-[5px]">
                <p className="text-[#0B0B0B] font-geist text-[13px] leading-5 tracking-[-0.46%]">
                  All Updates
                </p>
              </div>
            </div>
            <div
              ref={boundaryRef}
              // {...drag}
              className="relative cursor-grab touch-none select-none overflow-hidden border border-white/10 active:cursor-grabbing max-w-125 w-full b-[oklch(0.865_0_0)]"
            >
              <div className="absolute -top-1.25 left-0 w-full py-1 flex items-center justify-center pointer-events-none z-10">
                <motion.svg
                  ref={ringRef}
                  viewBox="0 0 24 24"
                  className="size-6 opacity-0"
                  style={{ rotate: spin }}
                  aria-hidden
                >
                  {/* Turned back a quarter so the trace starts at the top.
                        pathLength 1 makes the dash maths a plain fraction. */}
                  <circle
                    ref={arcRef}
                    cx={12}
                    cy={12}
                    r={9}
                    fill="none"
                    stroke="#0000004D"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="1 1"
                    strokeDashoffset={1}
                    transform="rotate(-90 12 12)"
                  />
                  {/* The spinning segment, shown only while loading. The
                        whole svg's linear turn carries it round the track;
                        this group adds its own ease-in-out turn on top. The
                        group's box is the circle, so it turns about the
                        centre. */}
                  <motion.g style={{ rotate: headSpin }}>
                    <circle
                      ref={headRef}
                      cx={12}
                      cy={12}
                      r={9}
                      fill="none"
                      stroke="#000000"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      pathLength={1}
                      strokeDasharray={`${HEAD_ARC} ${1 - HEAD_ARC}`}
                      transform="rotate(-90 12 12)"
                      style={{ opacity: 0 }}
                    />
                  </motion.g>
                </motion.svg>
              </div>
              <motion.div
                ref={trackRef}
                {...drag}
                style={{ y }}
                className="w-full flex flex-col h-60.75 px-0 py-0 gap-0 relative"
              >
                {feed.map((alert, index) => (
                  <Card
                    key={alert.id}
                    index={index}
                    isLast={index === feed.length - 1}
                    alert={alert}
                    scroll={scroll}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
