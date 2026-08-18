"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate } from "motion";
import { SidebarLinks } from "@/lib/static";
import {
  BellActive,
  PaymentsActive,
  Help,
  HomeActive,
  Search,
  Settings,
  SettingsActive,
  Out,
} from "@/components/icons/sidebar";

const RADIUS = 18;
// Circular bezier constant — the control-point offset that makes four curves read as
// a true circle.
const KAPPA = 0.5523;

// The blob is only ever a circle with its top and bottom extents pushed around, so
// generating it beats hardcoding a shape per pose: a falling blob needs its stretch
// driven continuously by velocity, not picked from a handful of keyframes.
// `rx` matters as much as the vertical extents: without it a stretching blob just gets
// taller, which barely reads. Narrowing as it lengthens is what sells the weight.
// Written along a "main" axis (the direction of travel) and a "cross" axis. Serialising
// the same points with the pair order swapped transposes the whole shape, so a row rail
// stretches sideways from the identical numbers a stack rail stretches downward from.
const blob = (
  back: number,
  front: number,
  cross: number = RADIUS,
  horizontal = false
) => {
  const lo = 20 - back;
  const hi = 20 + front;
  const near = 20 - cross;
  const far = 20 + cross;
  const ctrlLo = 20 - back * KAPPA;
  const ctrlHi = 20 + front * KAPPA;
  const k = cross * KAPPA;
  // main = along travel, cr = across it.
  const P = (main: number, cr: number) => (horizontal ? `${main},${cr}` : `${cr},${main}`);
  return (
    `M ${P(lo, 20)} C ${P(lo, 20 + k)} ${P(ctrlLo, far)} ${P(20, far)} ` +
    `C ${P(ctrlHi, far)} ${P(hi, 20 + k)} ${P(hi, 20)} ` +
    `C ${P(hi, 20 - k)} ${P(ctrlHi, near)} ${P(20, near)} ` +
    `C ${P(ctrlLo, near)} ${P(lo, 20 - k)} ${P(lo, 20)} Z`
  );
};

// Landing spreads the blob sideways as it flattens — the inverse of the fall pose. The
// squash is asymmetric: whichever edge leads is the one that hits, so it takes the
// compression while the trailing edge keeps its mass. Travelling up therefore squashes
// against the top, not the bottom.
// Expressed as deflections from the resting circle so the whole landing can be dialled
// with one number rather than three poses drifting apart.
const SQUASH = 0.5;
const IMPACT_LEAD = RADIUS - 9 * SQUASH;
const IMPACT_TRAIL = RADIUS - 4 * SQUASH;
const IMPACT_WIDTH = RADIUS + 3 * SQUASH;

// One pose set per orientation, built from the same deflections.
const poses = (horizontal: boolean) => ({
  circle: blob(RADIUS, RADIUS, RADIUS, horizontal),
  impactForward: blob(IMPACT_TRAIL, IMPACT_LEAD, IMPACT_WIDTH, horizontal),
  impactBack: blob(IMPACT_LEAD, IMPACT_TRAIL, IMPACT_WIDTH, horizontal),
  crouch: blob(RADIUS, 14, 19, horizontal),
  settle: blob(16, 16, 19, horizontal),
  nudgeForward: blob(RADIUS, 22, RADIUS, horizontal),
  nudgeBack: blob(22, RADIUS, RADIUS, horizontal),
});

const LINK_SIZE = 40;
const SLOT_PITCH = 48;
const TOOLTIP_GAP = 12;
// Nine 40px slots, two 40px group gaps and 16px padding come to 520px; below this a
// row cannot fit, so the rail falls back to a stack.
const ROW_MIN_WIDTH = 560;

// Squash and stretch is reserved for genuine top-to-bottom journeys — applying it to a
// neighbouring hop reads as a twitch rather than weight.
const FALL_SLOTS = 3;
// Big on purpose. A 12px stretch is invisible against the resting blob it is passing
// over — the falling blob has to become a distinctly longer, thinner shape to register.
const MAX_STRETCH = 30;
// Velocity arrives as px/ms; this maps a full-speed fall onto MAX_STRETCH.
const STRETCH_PER_VELOCITY = 22;
const TRAIL_RATIO = 0.35;
const WIDTH_RATIO = 0.3;
const MIN_WIDTH = 8;
const REBOUND = 7;

// Liquid-glass settle on the icon the blob lands under. Feeding the same noise channel
// into both axes of the displacement map forces every offset to be an equal (dx, dy) —
// so the refraction runs on the diagonal instead of scattering.
const GLASS_DISPLACE = 20;
// Matches MAX_BLUR so the hand-off from travel blur to glass settle is continuous
// rather than a visible step down.
const GLASS_BLUR = 3.5;

// Every slot carries a resting blob; the active one is simply the big one. Travel is
// therefore a merge — the moving blob absorbs the destination's resting blob and lets
// the source's go — which only reads as liquid under a gooey filter.
// The resting blob is nearly the active blob's size (r18), so a merge reads as two
// equal discs overlapping into a soft seam rather than a big shape eating a dot. They
// are told apart by fill, not by size.
// Pulled back from the active blob's 18 so a neck is visible while travelling: at r17
// the two discs simply overlap for most of a hop and there is no gap left to bridge.
// Any larger and the resting blobs also start fusing with each other at rest.
const IDLE_RADIUS = 14;
// Matches the rail exactly, so a resting blob is invisible until the active one merges
// into it. Keep this in step with the rail's background in the markup below.
const IDLE_FILL = "oklch(0.15 0 0)";
const ACTIVE_FILL = "oklch(0.35 0 0)";

// Icons smear as the blob sweeps past: blur peaks when the blob is centred on an
// icon, and fades out over roughly one slot either side.
const MAX_BLUR = 3.5;
const BLUR_REACH = SLOT_PITCH;

type RailItem = {
  label: string;
  icon: (color: string) => React.ReactNode;
  // Optional solid variant swapped in while selected. Items without one just keep
  // their outline and rely on the colour shift.
  activeIcon?: (color: string) => React.ReactNode;
};

const NAV_LABELS = ["Home", "Payments", "History", "Stats", "Notifications"];

// Solid variants, keyed by label. Attached below for every group rather than only the
// nav one, so an item's selected glyph is a single entry here wherever it sits.
const ACTIVE_ICONS: Record<string, (color: string) => React.ReactNode> = {
  Home: (c) => <HomeActive color={c} />,
  Payments: (c) => <PaymentsActive color={c} />,
  Notifications: (c) => <BellActive color={c} />,
  Settings: (c) => <SettingsActive color={c} />,
};

const RAIL_SOURCE: RailItem[][] = [
  [{ label: "Search", icon: (c) => <Search color={c} /> }],
  SidebarLinks.map((link, i) => ({ label: NAV_LABELS[i], icon: link.icon })),
  [
    { label: "Help", icon: (c) => <Help color={c} /> },
    { label: "Settings", icon: (c) => <Settings color={c} /> },
    { label: "Log out", icon: (c) => <Out color={c} /> },
  ],
];

const RAIL_GROUPS: RailItem[][] = RAIL_SOURCE.map((group) =>
  group.map((item) => ({ ...item, activeIcon: ACTIVE_ICONS[item.label] }))
);

const RAIL_ITEMS = RAIL_GROUPS.flat();
// Index each item once, globally, so the blob can travel across group boundaries.
const GROUP_OFFSETS = RAIL_GROUPS.map((_, g) =>
  RAIL_GROUPS.slice(0, g).reduce((n, group) => n + group.length, 0)
);

type Orientation = "stack" | "row";

// The icon the rail pivots around: it holds the same screen position in both layouts,
// so flipping reads as the rail rearranging about a fixed point rather than jumping.
// Stats currently sits at the rail's midpoint anyway, but that is an accident of the
// group sizes — the offset below keeps the pivot honest if the groups ever change.
const PIVOT_INDEX = 4;

const SidebarMorphPage = () => {
  const [activeIndex, setActiveIndex] = useState(1);
  const [orientation, setOrientation] = useState<Orientation>("stack");
  const [hovered, setHovered] = useState<number | null>(null);
  // Slot positions are measured rather than derived: the rail has 40px gaps between
  // groups, so an index × pitch formula would land the blob short of the lower icons.
  const [slotPos, setSlotPos] = useState<number[]>([]);
  const [railLength, setRailLength] = useState(0);
  // A row rail is a fixed ~520px, so below this it would hang off both edges of the
  // viewport with its end items unreachable. Narrow viewports get the stack regardless
  // of what the toggle says.
  const [narrow, setNarrow] = useState(false);
  // Read through a ref because the animation paths are callbacks, not render output.
  const reducedMotion = useRef(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const width = window.matchMedia(`(max-width: ${ROW_MIN_WIDTH - 1}px)`);
    const sync = () => {
      reducedMotion.current = motion.matches;
      setNarrow(width.matches);
    };
    sync();
    motion.addEventListener("change", sync);
    width.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      width.removeEventListener("change", sync);
    };
  }, []);

  const horizontal = orientation === "row" && !narrow;
  const axis = horizontal ? "X" : "Y";
  const shapes = useMemo(() => poses(horizontal), [horizontal]);

  const pivotCenter = (slotPos[PIVOT_INDEX] ?? 0) + LINK_SIZE / 2;
  const pivotShift = railLength ? railLength / 2 - pivotCenter : 0;

  const railRef = useRef<HTMLElement>(null);
  const railWrapRef = useRef<HTMLDivElement>(null);
  const pendingFlip = useRef(false);
  const indicatorRef = useRef<SVGPathElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const displaceRef = useRef<SVGFEDisplacementMapElement>(null);
  const isAnimating = useRef(false);
  // Bumped per click so a lingering glass settle can tell it has been superseded.
  const travelId = useRef(0);
  const isNudged = useRef(false);
  const currentPos = useRef(0);

  // Re-measured whenever the rail flips, since every slot moves onto the other axis.
  useLayoutEffect(() => {
    const rail = railRef.current;
    const positions = buttonRefs.current.map((btn) =>
      btn ? (horizontal ? btn.offsetLeft : btn.offsetTop) : 0
    );
    setSlotPos(positions);
    setRailLength((horizontal ? rail?.offsetWidth : rail?.offsetHeight) ?? 0);
    currentPos.current = positions[activeIndex] ?? 0;

    const base = `translate${horizontal ? "X" : "Y"}(${currentPos.current}px)`;
    const path = indicatorRef.current;
    if (path) path.style.transform = base;

    const wrap = railWrapRef.current;
    if (!pendingFlip.current || !path || !wrap) return;
    pendingFlip.current = false;
    // The layout above is already the finished state; reduced motion simply keeps it.
    if (reducedMotion.current) return;

    // Animating between the two layouts would sling the icons diagonally across dead
    // space outside the container. Instead they unfold from the pivot along the new
    // axis: everything starts collapsed onto the pivot and slides out to its slot, so
    // the motion stays inside the container the whole way.
    const pivotAt = positions[PIVOT_INDEX] ?? 0;
    const offsets = positions.map((pos) => pivotAt - pos);
    const reach = Math.max(...offsets.map(Math.abs), 1);

    isAnimating.current = true;
    animate(0, 1, {
      duration: 0.55,
      ease: [0.32, 0.72, 0, 1],
      onUpdate: (p) => {
        const back = 1 - p;
        offsets.forEach((offset, i) => {
          const btn = buttonRefs.current[i];
          if (!btn) return;
          btn.style.transform = `translate${horizontal ? "X" : "Y"}(${offset * back}px)`;
          // Furthest icons arrive last, so the rail reads as unfurling.
          btn.style.opacity = `${Math.min(1, p * (1 + Math.abs(offset) / reach))}`;
        });
        // Composed, not replaced — the blob still owes its slot offset underneath.
        path.style.transform = `translate${horizontal ? "X" : "Y"}(${(offsets[activeIndex] ?? 0) * back}px) ${base}`;
        // The inner shadow resolves with the rest of it rather than being there first.
        wrap.style.boxShadow = `inset ${0.5 * p}px ${0.6 * p}px 0.5px rgba(249, 249, 249, ${0.15 * p})`;
      },
    }).finished.then(() => {
      buttonRefs.current.forEach((btn) => {
        if (btn) {
          btn.style.transform = "";
          btn.style.opacity = "";
        }
      });
      path.style.transform = base;
      wrap.style.boxShadow = "";
      isAnimating.current = false;
    });
    // activeIndex is deliberately not a dependency — this only re-runs on a flip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horizontal]);

  const flipTo = (mode: Orientation) => {
    if (isAnimating.current || mode === orientation) return;
    pendingFlip.current = true;
    setOrientation(mode);
  };

  // `intensity` gates the effect on travel — it is 0 at rest, so the icon the blob
  // is parked under stays sharp.
  const applyBlur = (blobPos: number, intensity: number) => {
    iconRefs.current.forEach((icon, i) => {
      if (!icon || slotPos[i] === undefined) return;
      const proximity = Math.max(0, 1 - Math.abs(slotPos[i] - blobPos) / BLUR_REACH);
      const blur = MAX_BLUR * proximity * intensity;
      icon.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "";
    });
  };

  // The blob leaves the arriving icon refracting like it is settling under glass, and
  // that distortion resolves on the same curve the blur uses to fade — one gesture, so
  // the icon comes back into focus and back into shape together.
  const settleGlass = async (index: number, travel: number) => {
    const icon = iconRefs.current[index];
    const displace = displaceRef.current;
    if (!icon) return;

    icon.style.willChange = "filter";
    await animate(1, 0, {
      duration: 0.42,
      ease: "easeOut",
      onUpdate: (t) => {
        // A newer travel owns the icons now; stop writing over its blur.
        if (travelId.current !== travel) return;
        displace?.setAttribute("scale", (t * GLASS_DISPLACE).toFixed(2));
        icon.style.filter = `url(#liquid-glass) blur(${(t * GLASS_BLUR).toFixed(2)}px)`;
      },
    }).finished;

    if (travelId.current !== travel) return;
    icon.style.filter = "";
    icon.style.willChange = "";
    displace?.setAttribute("scale", "0");
  };

  const clearBlur = () => {
    iconRefs.current.forEach((icon) => {
      if (icon) {
        icon.style.filter = "";
        icon.style.willChange = "";
      }
    });
  };

  const handleHover = (index: number) => {
    setHovered(index);
    if (reducedMotion.current) return;
    if (isAnimating.current || !indicatorRef.current || index === activeIndex) return;
    if (!isNudged.current) {
      isNudged.current = true;
      const nudgeShape = index > activeIndex ? shapes.nudgeForward : shapes.nudgeBack;
      animate(indicatorRef.current, { d: nudgeShape }, { duration: 0.15 });
    }
  };

  const handleHoverEnd = () => {
    setHovered(null);
    if (isAnimating.current || !indicatorRef.current || !isNudged.current) return;
    isNudged.current = false;
    animate(indicatorRef.current, { d: shapes.circle }, { duration: 0.15 });
  };

  const handleClick = async (index: number) => {
    if (index === activeIndex || isAnimating.current || !indicatorRef.current) return;
    const to = slotPos[index];
    if (to === undefined) return;

    // Reduced motion: take the new state directly. No fall, no smear, no refraction —
    // the colour and glyph change still carry the selection.
    if (reducedMotion.current) {
      indicatorRef.current.style.transform = `translate${axis}(${to}px)`;
      currentPos.current = to;
      setActiveIndex(index);
      return;
    }

    isAnimating.current = true;
    isNudged.current = false;
    const travel = ++travelId.current;

    const forward = index > activeIndex;
    const from = currentPos.current;
    const path = indicatorRef.current;
    const distance = Math.abs(to - from);
    const isFall = distance >= FALL_SLOTS * SLOT_PITCH;
    let glass: Promise<void> | undefined;

    iconRefs.current.forEach((icon) => {
      if (icon) icon.style.willChange = "filter";
    });

    if (!isFall) {
      // Neighbouring hop: slide, hold the circle, no deformation. The hover nudge has
      // to be unwound first or the blob travels still wearing it.
      animate(path, { d: shapes.circle }, { duration: 0.12, ease: "easeOut" });
      await animate(from, to, {
        duration: 0.26,
        ease: [0.42, 0, 0.58, 1],
        onUpdate: (p) => {
          path.style.transform = `translate${axis}(${p}px)`;
          const progress = (p - from) / (to - from);
          applyBlur(p, Math.sin(Math.PI * progress));
        },
      }).finished;
    } else {
      // Gather before the drop.
      await animate(path, { d: shapes.crouch }, { duration: 0.09, ease: "easeOut" }).finished;

      let prevPos = from;
      let prevT = performance.now();

      // Driving the blob's own transform from this value animation keeps the blur
      // and the position on the same clock — no second timeline to drift against.
      await animate(from, to, {
        duration: 0.34 + Math.min(distance / SLOT_PITCH, 8) * 0.035,
        // Falling accelerates under gravity; travelling up is a throw that runs out of
        // momentum, so the curve flips. A row has no down, so it eases symmetrically.
        ease: horizontal
          ? [0.45, 0, 0.55, 1]
          : forward
            ? [0.55, 0, 0.85, 0.35]
            : [0.15, 0.65, 0.45, 1],
        onUpdate: (p) => {
          const now = performance.now();
          const velocity = (p - prevPos) / Math.max(now - prevT, 1);
          prevPos = p;
          prevT = now;

          const speed = Math.abs(velocity);
          const stretch = Math.min(speed * STRETCH_PER_VELOCITY, MAX_STRETCH);
          const lead = RADIUS + stretch;
          const trail = RADIUS - stretch * TRAIL_RATIO;
          // Volume is roughly conserved: the faster it goes, the thinner it gets.
          const cross = Math.max(RADIUS - stretch * WIDTH_RATIO, MIN_WIDTH);
          // The blob elongates along its direction of travel and narrows behind it.
          path.setAttribute(
            "d",
            velocity >= 0
              ? blob(trail, lead, cross, horizontal)
              : blob(lead, trail, cross, horizontal)
          );
          path.style.transform = `translate${axis}(${p}px)`;

          applyBlur(p, Math.min(stretch / MAX_STRETCH, 1));
        },
      }).finished;

      // Hand off to the glass settle the instant it lands. Waiting until after the
      // bounce would freeze the icon at full blur for the whole rebound.
      clearBlur();
      glass = settleGlass(index, travel);

      // Land: flatten on impact, bounce back off it, then drop in and settle. A shape
      // spring alone reads as a wobble; the blob has to actually leave the surface.
      await animate(
        path,
        { d: forward ? shapes.impactForward : shapes.impactBack },
        { duration: 0.07, ease: "easeOut" }
      ).finished;

      // Only a drop recoils — the recoil is gravity, so a row has none, and travelling
      // up the blob arrives against the top and stays there.
      if (forward && !horizontal) {
        const bounceTo = to - REBOUND;
        await animate(to, bounceTo, {
          duration: 0.1,
          ease: "easeOut",
          onUpdate: (p) => {
            path.style.transform = `translate${axis}(${p}px)`;
          },
        }).finished;
        animate(path, { d: shapes.circle }, { duration: 0.16, ease: "easeOut" });
        await animate(bounceTo, to, {
          duration: 0.13,
          ease: "easeIn",
          onUpdate: (p) => {
            path.style.transform = `translate${axis}(${p}px)`;
          },
        }).finished;
      }

      await animate(path, { d: shapes.settle }, { duration: 0.06, ease: "easeOut" }).finished;
    }

    currentPos.current = to;
    setActiveIndex(index);

    // Short hops have no landing beat of their own, so the settle starts here instead.
    if (!glass) {
      clearBlur();
      glass = settleGlass(index, travel);
    }
    await animate(path, { d: shapes.circle }, { duration: 0.24, ease: [0.34, 1.56, 0.64, 1] }).finished;

    // Released as soon as the blob is home. The glass is still resolving, but holding
    // the lock for it would swallow clicks for ~400ms after the rail looks settled.
    isAnimating.current = false;
  };

  return (
    <>
      {/* The rail is centred by its own midpoint, so nudge it by the gap between that
          midpoint and the pivot icon — the pivot then lands on the same point in both
          orientations instead of only when the groups happen to be symmetric. */}
      {/* The container takes its new silhouette outright — only its contents animate. */}
      <div
        ref={railWrapRef}
        className={`bg-[oklch(0.15_0_0)] rounded-[18px] shadow-[inset_0.5px_0.6px_0.5px_#f9f9f913] ${
          horizontal ? "h-14" : "w-14"
        }`}
        style={{ transform: `translate${axis}(${pivotShift}px)` }}
      >
        <aside
          ref={railRef}
          // Second bevel at half the wrapper's strength; it needs the same radius or
          // the inset would trace square corners inside the pill.
          className={`relative flex items-center gap-10 rounded-[18px] shadow-[inset_0.5px_0.6px_0.5px_#f9f9f913] ${
            horizontal ? "flex-row py-2 px-4" : "flex-col px-2 py-4"
          }`}
        >
          <svg
            className={`absolute pointer-events-none ${
              horizontal
                ? "top-1/2 -translate-y-1/2 left-0"
                : "left-1/2 -translate-x-1/2 top-0"
            }`}
            style={{
              width: horizontal ? railLength : 40,
              height: horizontal ? 40 : railLength,
              overflow: "visible",
            }}
          >
            <defs>
              {/* A true metaball merge. Blur the group, then crush the alpha ramp back
                  to a hard edge: where two blurred shapes overlap their alpha sums past
                  the cutoff, and the recovered edge bows inward — those concave fillets
                  are the join. Sigma is the reach; too much and the resting blobs bridge
                  into one continuous pill before anything moves. */}
              <filter id="blob-goo" x="-100%" y="-20%" width="300%" height="140%" colorInterpolationFilters="sRGB">
                <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blurred" />
                <feColorMatrix
                  in="blurred"
                  type="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                />
              </filter>

              {/* Region has to outrun the displacement: offsets approach half the
                  scale in each direction, and anything past the edge is clipped. */}
              <filter
                id="liquid-glass"
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.04"
                  numOctaves="2"
                  seed="7"
                  result="noise"
                />
                {/* Both selectors read R, so dx always equals dy — a diagonal shear. */}
                <feDisplacementMap
                  ref={displaceRef}
                  in="SourceGraphic"
                  in2="noise"
                  scale="0"
                  xChannelSelector="R"
                  yChannelSelector="R"
                />
              </filter>
            </defs>
            <g filter="url(#blob-goo)">
              {slotPos.map((p, i) => (
                <circle
                  key={i}
                  cx={horizontal ? p + LINK_SIZE / 2 : 20}
                  cy={horizontal ? 20 : p + LINK_SIZE / 2}
                  r={IDLE_RADIUS}
                  fill={IDLE_FILL}
                />
              ))}
              <path ref={indicatorRef} d={shapes.circle} fill={ACTIVE_FILL} />
            </g>
          </svg>

          {/* Sits off whichever edge the rail presents — beside a stack, above a row —
              so it never covers the icons it is describing. */}
          {hovered !== null && slotPos[hovered] !== undefined && (
            <div
              role="tooltip"
              className="pointer-events-none absolute z-10 flex h-6 items-center whitespace-nowrap rounded-lg bg-[oklch(0.25_0_0)] px-1.5 font-sans text-[13px] text-[#C2C2C2]"
              style={
                horizontal
                  ? {
                      left: slotPos[hovered] + LINK_SIZE / 2,
                      bottom: "100%",
                      transform: "translateX(-50%)",
                      marginBottom: TOOLTIP_GAP,
                    }
                  : {
                      top: slotPos[hovered] + LINK_SIZE / 2,
                      left: "100%",
                      transform: "translateY(-50%)",
                      marginLeft: TOOLTIP_GAP,
                    }
              }
            >
              {RAIL_ITEMS[hovered].label}
            </div>
          )}

          {RAIL_GROUPS.map((group, g) => (
            <div
              key={g}
              className={`flex items-center gap-2 ${horizontal ? "flex-row" : "flex-col"}`}
            >
              {group.map((item, j) => {
                const i = GROUP_OFFSETS[g] + j;
                const active = i === activeIndex;
                return (
                  <button
                    key={item.label}
                    ref={(el) => {
                      buttonRefs.current[i] = el;
                    }}
                    // The custom tooltip replaces the native one, which would otherwise
                    // show a second time on a delay; the name moves to aria-label.
                    aria-label={item.label}
                    onClick={() => handleClick(i)}
                    onMouseEnter={() => handleHover(i)}
                    onMouseLeave={handleHoverEnd}
                    onFocus={() => setHovered(i)}
                    onBlur={handleHoverEnd}
                    className="w-10 h-10 flex items-center justify-center bg-transparent relative cursor-pointer transition-colors duration-200 ease-out"
                    style={{ color: active ? "#C2C2C2" : "#868686" }}
                  >
                    <span
                      ref={(el) => {
                        iconRefs.current[i] = el;
                      }}
                      className="flex items-center justify-center"
                    >
                      {active && item.activeIcon
                        ? item.activeIcon("currentColor")
                        : item.icon("currentColor")}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </aside>
      </div>
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-1 rounded-full bg-[oklch(0.15_0_0)] p-1 shadow-[inset_0.5px_0.6px_0.5px_#f9f9f926]">
        {(["stack", "row"] as Orientation[]).map((mode) => (
          <button
            key={mode}
            // Flipping mid-travel would strand the blob against stale measurements.
            onClick={() => flipTo(mode)}
            disabled={mode === "row" && narrow}
            title={mode === "row" && narrow ? "Needs a wider viewport" : undefined}
            className="rounded-full px-4 py-1.5 text-xs capitalize cursor-pointer transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              color: orientation === mode ? "#C2C2C2" : "#868686",
              background: orientation === mode ? ACTIVE_FILL : "transparent",
            }}
          >
            {mode}
          </button>
        ))}
      </div>

    </>
  );
};

export default SidebarMorphPage;
