"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { animate } from "motion";
import { SidebarLinks } from "@/lib/static";
import {
  BellActive,
  PaymentsActive,
  Help,
  HelpActive,
  HomeActive,
  Layers,
  Moon,
  Search,
  Settings,
  SettingsActive,
  Stack,
  Sun,
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
  horizontal = false,
) => {
  const lo = 20 - back;
  const hi = 20 + front;
  const near = 20 - cross;
  const far = 20 + cross;
  const ctrlLo = 20 - back * KAPPA;
  const ctrlHi = 20 + front * KAPPA;
  const k = cross * KAPPA;
  // main = along travel, cr = across it.
  const P = (main: number, cr: number) =>
    horizontal ? `${main},${cr}` : `${cr},${main}`;
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

// A flip runs in two beats around the pivot: everything collapses onto it on the old
// axis, blurring out as it goes, then fans back out on the new axis, blurring in. The
// pivot itself never moves or blurs — it is the hinge the rest folds through.
const FLIP_BLUR = 5;
const COLLAPSE_MS = 0.3;
const EXPAND_MS = 0.45;
// Fraction of each beat that the blur leads the movement by, so an icon has already
// softened before it starts travelling rather than smearing as it goes.
const BLUR_LEAD = 0.45;
// Furthest icons leave first and arrive last, which reads as folding and unfolding.
const FLIP_STAGGER = 0.18;

const easeInQuad = (t: number) => t * t;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
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
// Only a genuine drop gets a sound; short hops would turn the rail into a xylophone.
const IMPACT_VOLUME = 0.28 * 0.075;
const IMPACT_SOUND = "/sounds/water-drop.wav";

// Liquid-glass settle on the icon the blob lands under. Feeding the same noise channel
// into both axes of the displacement map forces every offset to be an equal (dx, dy) —
// so the refraction runs on the diagonal instead of scattering.
const GLASS_DISPLACE = 10;
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

type Theme = {
  page: string;
  rail: string;
  // Must equal `rail`: a resting blob is meant to be invisible until the active one
  // merges into it. Any drift and nine faint discs reappear.
  idle: string;
  active: string;
  icon: string;
  iconActive: string;
  // The bevel is animated during a flip, so it is kept as channels plus an alpha
  // rather than a hex literal — interpolating a packed string is not possible.
  bevelRGB: string;
  bevelAlpha: number;
  // How much of the rail shows through the active blob. The blob is glass, so it tints
  // what is behind it rather than covering it.
  blobOpacity: number;
  // Strength of the active blob's inner rim light, fed to the rim filter's flood.
  rimAlpha: number;
  tooltip: string;
  tooltipText: string;
};

// Light inverts the relationships rather than the numbers: in dark the rail is lighter
// than the page and the active blob lighter still, so in light each step goes darker,
// and the bevel highlight becomes a shadow.
const THEMES: Record<"dark" | "light", Theme> = {
  dark: {
    page: "oklch(0.1 0 0)",
    rail: "oklch(0.15 0 0)",
    idle: "oklch(0.15 0 0)",
    active: "oklch(0.35 0 0)",
    icon: "oklch(0.62 0 0)",
    iconActive: "oklch(0.81 0 0)",
    bevelRGB: "249, 249, 249",
    bevelAlpha: 0.075,
    blobOpacity: 0.25,
    // 30% softer than light: a white rim reads far harder against a near-black rail.
    rimAlpha: 0.665,
    tooltip: "oklch(0.55 0 0)",
    tooltipText: "#f9f9f9",
  },
  // Taken off the reference: a near-white button raised from a light grey surface, with
  // a pure black glyph. The rail has to be the grey, not the white — a white blob on a
  // white rail has nothing to stand on.
  light: {
    page: "oklch(0.955 0 0)",
    rail: "oklch(0.925 0 0)",
    idle: "oklch(0.925 0 0)",
    active: "oklch(1 0 0)",
    icon: "oklch(0.45 0 0)",
    iconActive: "oklch(0 0 0)",
    // White, like dark's — on the grey rail it reads as a lit top edge rather than a
    // groove. It needs far more alpha than the dark theme: white on a light surface has
    // a fraction of the contrast white on a near-black one does.
    bevelRGB: "255, 255, 255",
    bevelAlpha: 0.7,
    blobOpacity: 0.22,
    rimAlpha: 0.95,
    tooltip: "oklch(0.55 0 0)",
    tooltipText: "#f9f9f9",
  },
};

const bevel = (theme: Theme, scale = 1) =>
  `inset 0.5px 0.6px 0.5px rgba(${theme.bevelRGB}, ${theme.bevelAlpha * scale})`;

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
  Help: (c) => <HelpActive color={c} />,
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
  group.map((item) => ({ ...item, activeIcon: ACTIVE_ICONS[item.label] })),
);

const RAIL_ITEMS = RAIL_GROUPS.flat();
// Index each item once, globally, so the blob can travel across group boundaries.
const GROUP_OFFSETS = RAIL_GROUPS.map((_, g) =>
  RAIL_GROUPS.slice(0, g).reduce((n, group) => n + group.length, 0),
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
  const [themeName, setThemeName] = useState<"dark" | "light">("light");
  const [hovered, setHovered] = useState<number | null>(null);
  const theme = THEMES[themeName];
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
  const railBgRef = useRef<HTMLDivElement>(null);
  const pendingFlip = useRef(false);
  const indicatorRef = useRef<SVGPathElement>(null);
  const glassRef = useRef<SVGPathElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const displaceRef = useRef<SVGFEDisplacementMapElement>(null);
  const isAnimating = useRef(false);
  // Bumped per click so a lingering glass settle can tell it has been superseded.
  const travelId = useRef(0);
  const isNudged = useRef(false);
  const currentPos = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);
  const impactBuffer = useRef<AudioBuffer | null>(null);

  // Decoded once up front rather than played through an <audio> element: an element
  // carries start-up latency and cannot overlap itself, and the hit has to land on the
  // same frame as the impact squash.
  useEffect(() => {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    // Constructed before any gesture, so it starts suspended — decoding is still
    // allowed there, only playback is gated, and the first click resumes it.
    const ctx = (audioRef.current ??= new Ctx());
    let cancelled = false;
    fetch(IMPACT_SOUND)
      .then((r) => r.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        if (!cancelled) impactBuffer.current = decoded;
      })
      .catch(() => {
        // Silent rail is better than a broken one; nothing else depends on this.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const playImpact = () => {
    const ctx = audioRef.current;
    const buffer = impactBuffer.current;
    if (!ctx || !buffer) return;
    if (ctx.state === "suspended") void ctx.resume();

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.value = IMPACT_VOLUME;
    source.connect(gain).connect(ctx.destination);
    source.start();
  };

  // The blob is drawn twice: the body inside the goo group so it can merge, and a
  // glass layer on top of it. Both must always carry the same shape and position, so
  // every write goes through these rather than touching one element.
  const blobEls = () =>
    [indicatorRef.current, glassRef.current].filter(
      Boolean,
    ) as SVGPathElement[];
  const setBlobTransform = (transform: string) =>
    blobEls().forEach((el) => (el.style.transform = transform));
  const setBlobPath = (d: string) =>
    blobEls().forEach((el) => el.setAttribute("d", d));

  // Re-measured whenever the rail flips, since every slot moves onto the other axis.
  useLayoutEffect(() => {
    const rail = railRef.current;
    const positions = buttonRefs.current.map((btn) =>
      btn ? (horizontal ? btn.offsetLeft : btn.offsetTop) : 0,
    );
    setSlotPos(positions);
    setRailLength((horizontal ? rail?.offsetWidth : rail?.offsetHeight) ?? 0);
    currentPos.current = positions[activeIndex] ?? 0;

    const base = `translate${horizontal ? "X" : "Y"}(${currentPos.current}px)`;
    const path = indicatorRef.current;
    if (path) setBlobTransform(base);

    const wrap = railWrapRef.current;
    const bg = railBgRef.current;
    if (!pendingFlip.current || !path || !wrap) return;
    pendingFlip.current = false;
    // The layout above is already the finished state; reduced motion simply keeps it.
    if (reducedMotion.current) return;

    // Beat two: the icons are already collapsed on the pivot and blurred out from the
    // first beat, so fan them back out along the new axis and bring them back into
    // focus. Movement lags the blur again, and the furthest arrive last.
    const axisNow = horizontal ? "X" : "Y";
    const pivotAt = positions[PIVOT_INDEX] ?? 0;
    const offsets = positions.map((pos) => pivotAt - pos);
    const reach = Math.max(...offsets.map(Math.abs), 1);

    isAnimating.current = true;
    animate(0, 1, {
      duration: EXPAND_MS,
      ease: "linear",
      onUpdate: (p) => {
        offsets.forEach((offset, i) => {
          const btn = buttonRefs.current[i];
          if (!btn) return;
          const distance = Math.abs(offset) / reach;
          const local = clamp01(
            (p - distance * FLIP_STAGGER) / (1 - distance * FLIP_STAGGER),
          );
          const settled = easeOutCubic(local);
          btn.style.transform = `translate${axisNow}(${offset * (1 - settled)}px)`;
          const sharpness = clamp01(local / BLUR_LEAD);
          btn.style.filter =
            i === PIVOT_INDEX ? "" : `blur(${FLIP_BLUR * (1 - sharpness)}px)`;
          btn.style.opacity = i === PIVOT_INDEX ? "1" : `${sharpness}`;
        });
        // Composed, not replaced — the blob still owes its slot offset underneath.
        const blobSettled = easeOutCubic(p);
        setBlobTransform(
          `translate${axisNow}(${(offsets[activeIndex] ?? 0) * (1 - blobSettled)}px) ${base}`,
        );
        // The surface sharpens across the whole beat, not on the icons' BLUR_LEAD ramp.
        // On that ramp it resolved in the first 45% and was already sharp while the
        // icons were still arriving, so the blur-in never read as one.
        if (bg) {
          bg.style.filter = `blur(${FLIP_BLUR * (1 - p)}px)`;
          // The inner shadow resolves with the rest of it rather than being there first.
          bg.style.boxShadow = `inset ${0.5 * p}px ${0.6 * p}px 0.5px rgba(${theme.bevelRGB}, ${theme.bevelAlpha * p})`;
        }
      },
    }).finished.then(() => {
      buttonRefs.current.forEach((btn) => {
        if (btn) {
          btn.style.transform = "";
          btn.style.opacity = "";
          btn.style.filter = "";
        }
      });
      setBlobTransform(base);
      if (bg) {
        bg.style.filter = "";
        // Restored, not cleared: the bevel is an inline style now, so blanking it would
        // drop the shadow until some unrelated render happened to rewrite it.
        bg.style.boxShadow = bevel(theme);
      }
      isAnimating.current = false;
    });
    // activeIndex is deliberately not a dependency — this only re-runs on a flip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horizontal]);

  const flipTo = async (option: Orientation) => {
    if (isAnimating.current || option === orientation) return;
    // A row below ROW_MIN_WIDTH resolves back to a stack, so the layout would not change
    // and the second beat would never fire — leaving the lock held forever.
    if ((option === "row" && !narrow) === horizontal) {
      setOrientation(option);
      return;
    }
    if (reducedMotion.current) {
      pendingFlip.current = true;
      setOrientation(option);
      return;
    }

    const path = indicatorRef.current;
    if (!path) return;
    const surfaceEl = railBgRef.current;

    // Beat one: fold onto the pivot on the axis the rail still has. This has to finish
    // before the layout changes, so it runs here rather than in the effect.
    isAnimating.current = true;
    const axisWas = horizontal ? "X" : "Y";
    const pivotAt = slotPos[PIVOT_INDEX] ?? 0;
    const offsets = slotPos.map((pos) => pivotAt - pos);
    const reach = Math.max(...offsets.map(Math.abs), 1);
    const base = `translate${axisWas}(${currentPos.current}px)`;

    await animate(0, 1, {
      duration: COLLAPSE_MS,
      ease: "linear",
      onUpdate: (p) => {
        offsets.forEach((offset, i) => {
          const btn = buttonRefs.current[i];
          if (!btn || i === PIVOT_INDEX) return;
          // Furthest leave first: their stagger is subtracted from the far end.
          const distance = Math.abs(offset) / reach;
          const local = clamp01(
            (p - (1 - distance) * FLIP_STAGGER) /
              (1 - (1 - distance) * FLIP_STAGGER),
          );
          const softness = clamp01(local / BLUR_LEAD);
          btn.style.filter = `blur(${FLIP_BLUR * softness}px)`;
          btn.style.opacity = `${1 - softness}`;
          // Movement trails the blur, so it softens in place before folding in.
          btn.style.transform = `translate${axisWas}(${offset * easeInQuad(local)}px)`;
        });
        setBlobTransform(
          `translate${axisWas}(${(offsets[activeIndex] ?? 0) * easeInQuad(p)}px) ${base}`,
        );
        // The surface softens on the same ramp the icons do.
        const surface = clamp01(p / BLUR_LEAD);
        if (surfaceEl)
          surfaceEl.style.filter = `blur(${FLIP_BLUR * surface}px)`;
      },
    }).finished;

    pendingFlip.current = true;
    isAnimating.current = false;
    setOrientation(option);
  };

  // `intensity` gates the effect on travel — it is 0 at rest, so the icon the blob
  // is parked under stays sharp.
  const applyBlur = (blobPos: number, intensity: number) => {
    iconRefs.current.forEach((icon, i) => {
      if (!icon || slotPos[i] === undefined) return;
      const proximity = Math.max(
        0,
        1 - Math.abs(slotPos[i] - blobPos) / BLUR_REACH,
      );
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
    if (isAnimating.current || !indicatorRef.current || index === activeIndex)
      return;
    if (!isNudged.current) {
      isNudged.current = true;
      const nudgeShape =
        index > activeIndex ? shapes.nudgeForward : shapes.nudgeBack;
      animate(blobEls(), { d: nudgeShape }, { duration: 0.15 });
    }
  };

  const handleHoverEnd = () => {
    setHovered(null);
    if (isAnimating.current || !indicatorRef.current || !isNudged.current)
      return;
    isNudged.current = false;
    animate(blobEls(), { d: shapes.circle }, { duration: 0.15 });
  };

  const handleClick = async (index: number) => {
    if (index === activeIndex || isAnimating.current || !indicatorRef.current)
      return;
    const to = slotPos[index];
    if (to === undefined) return;

    // Reduced motion: take the new state directly. No fall, no smear, no refraction —
    // the colour and glyph change still carry the selection.
    if (reducedMotion.current) {
      setBlobTransform(`translate${axis}(${to}px)`);
      currentPos.current = to;
      setActiveIndex(index);
      return;
    }

    isAnimating.current = true;
    isNudged.current = false;
    const travel = ++travelId.current;

    const forward = index > activeIndex;
    const from = currentPos.current;
    const distance = Math.abs(to - from);
    const isFall = distance >= FALL_SLOTS * SLOT_PITCH;
    let glass: Promise<void> | undefined;

    iconRefs.current.forEach((icon) => {
      if (icon) icon.style.willChange = "filter";
    });

    if (!isFall) {
      // Neighbouring hop: slide, hold the circle, no deformation. The hover nudge has
      // to be unwound first or the blob travels still wearing it.
      animate(
        blobEls(),
        { d: shapes.circle },
        { duration: 0.12, ease: "easeOut" },
      );
      await animate(from, to, {
        duration: 0.26,
        ease: [0.42, 0, 0.58, 1],
        onUpdate: (p) => {
          setBlobTransform(`translate${axis}(${p}px)`);
          const progress = (p - from) / (to - from);
          applyBlur(p, Math.sin(Math.PI * progress));
        },
      }).finished;
    } else {
      // Gather before the drop.
      await animate(
        blobEls(),
        { d: shapes.crouch },
        { duration: 0.09, ease: "easeOut" },
      ).finished;

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
          setBlobPath(
            velocity >= 0
              ? blob(trail, lead, cross, horizontal)
              : blob(lead, trail, cross, horizontal),
          );
          setBlobTransform(`translate${axis}(${p}px)`);

          applyBlur(p, Math.min(stretch / MAX_STRETCH, 1));
        },
      }).finished;

      // Hand off to the glass settle the instant it lands. Waiting until after the
      // bounce would freeze the icon at full blur for the whole rebound.
      clearBlur();
      glass = settleGlass(index, travel);

      // Sounded on the frame it lands, not when the travel is queued, so the hit and
      // the noise coincide. Downward stack travel only — a row has no floor to hit.
      if (forward && !horizontal && !reducedMotion.current) playImpact();

      // Land: flatten on impact, bounce back off it, then drop in and settle. A shape
      // spring alone reads as a wobble; the blob has to actually leave the surface.
      await animate(
        blobEls(),
        { d: forward ? shapes.impactForward : shapes.impactBack },
        { duration: 0.07, ease: "easeOut" },
      ).finished;

      // Only a drop recoils — the recoil is gravity, so a row has none, and travelling
      // up the blob arrives against the top and stays there.
      if (forward && !horizontal) {
        const bounceTo = to - REBOUND;
        await animate(to, bounceTo, {
          duration: 0.1,
          ease: "easeOut",
          onUpdate: (p) => {
            setBlobTransform(`translate${axis}(${p}px)`);
          },
        }).finished;
        animate(
          blobEls(),
          { d: shapes.circle },
          { duration: 0.16, ease: "easeOut" },
        );
        await animate(bounceTo, to, {
          duration: 0.13,
          ease: "easeIn",
          onUpdate: (p) => {
            setBlobTransform(`translate${axis}(${p}px)`);
          },
        }).finished;
      }

      await animate(
        blobEls(),
        { d: shapes.settle },
        { duration: 0.06, ease: "easeOut" },
      ).finished;
    }

    currentPos.current = to;
    setActiveIndex(index);

    // Short hops have no landing beat of their own, so the settle starts here instead.
    if (!glass) {
      clearBlur();
      glass = settleGlass(index, travel);
    }
    await animate(
      blobEls(),
      { d: shapes.circle },
      { duration: 0.24, ease: [0.34, 1.56, 0.64, 1] },
    ).finished;

    // Released as soon as the blob is home. The glass is still resolving, but holding
    // the lock for it would swallow clicks for ~400ms after the rail looks settled.
    isAnimating.current = false;
  };

  return (
    <>
      <div
        className="fixed inset-0 -z-10 transition-colors duration-300 ease-out"
        style={{ background: theme.page }}
      />

      {/* The rail is centred by its own midpoint, so nudge it by the gap between that
          midpoint and the pivot icon — the pivot then lands on the same point in both
          orientations instead of only when the groups happen to be symmetric. */}
      {/* The container takes its new silhouette outright — only its contents animate. */}
      <div
        ref={railWrapRef}
        className={`relative rounded-[18px] ${horizontal ? "h-14" : "w-14"}`}
        style={{ transform: `translate${axis}(${pivotShift}px)` }}
      >
        {/* The surface is its own layer so a flip can blur it without touching the
            icons on top — blurring the wrapper would soften the pivot too, and the
            pivot is the one thing meant to stay sharp. */}
        <div
          ref={railBgRef}
          className="absolute inset-0 rounded-[18px]"
          style={{ background: theme.rail, boxShadow: bevel(theme) }}
        />
        <aside
          ref={railRef}
          // Second bevel at half the wrapper's strength; it needs the same radius or
          // the inset would trace square corners inside the pill.
          className={`relative flex items-center gap-10 rounded-[18px] ${
            horizontal ? "flex-row py-2 px-4" : "flex-col px-2 py-4"
          }`}
          style={{ boxShadow: bevel(theme, 0.5) }}
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
              {/* Inner rim light. Flood white, knock out the shape to keep only what
                  falls outside it, offset and blur that, then clip it back inside the
                  shape — the result hugs the edge from within. It has to live on its own
                  layer above the merge, because the goo blurs colour at sigma 5 and would
                  wash a rim this fine away entirely. */}
              <filter
                id="blob-rim"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
                colorInterpolationFilters="sRGB"
              >
                <feFlood
                  floodColor="#ffffff"
                  floodOpacity={theme.rimAlpha}
                  result="light"
                />
                <feComposite
                  in="light"
                  in2="SourceAlpha"
                  operator="out"
                  result="outside"
                />
                <feOffset in="outside" dx="0.9" dy="1.1" result="lifted" />
                <feGaussianBlur in="lifted" stdDeviation="1.5" result="soft" />
                {/* Only the rim is emitted — SourceGraphic is deliberately dropped. The
                    path's fill exists purely to define the mask, so the body keeps
                    coming from the translucent layer underneath. */}
                <feComposite in="soft" in2="SourceAlpha" operator="in" />
              </filter>

              <filter
                id="blob-goo"
                x="-100%"
                y="-20%"
                width="300%"
                height="140%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="5"
                  result="blurred"
                />
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
            {/* Two nested groups because an element takes one filter: the inner one
                merges the blobs, the outer refracts the merged result. The blob is the
                button, so it gets the same glass treatment as the icon it lands under —
                and at rest the displacement scale is 0, so this is inert. */}
            <g filter="url(#liquid-glass)">
              <g filter="url(#blob-goo)" opacity={theme.blobOpacity}>
                {slotPos.map((p, i) => (
                  <circle
                    key={i}
                    cx={horizontal ? p + LINK_SIZE / 2 : 20}
                    cy={horizontal ? 20 : p + LINK_SIZE / 2}
                    r={IDLE_RADIUS}
                    fill={theme.idle}
                  />
                ))}
                <path
                  ref={indicatorRef}
                  d={shapes.circle}
                  fill={theme.active}
                />
              </g>
              {/* A second copy of the blob, kept in lockstep by setBlobPath/Transform.
                  It carries no fill of its own — only the rim — so it reads as the lit
                  edge of the glass body underneath rather than a shape in its own right.
                  It sits outside the goo so the rim survives, and only the active blob
                  is duplicated, so the resting blobs never get rims. */}
              {/* Opaque fill on purpose: the filter reads SourceAlpha to build the rim,
                  so a translucent fill would scale the rim down with it. Nothing of this
                  fill is drawn — the filter emits the rim alone. */}
              <path
                ref={glassRef}
                d={shapes.circle}
                fill="#ffffff"
                filter="url(#blob-rim)"
              />
            </g>
          </svg>

          {/* Sits off whichever edge the rail presents — beside a stack, above a row —
              so it never covers the icons it is describing. */}
          {hovered !== null && slotPos[hovered] !== undefined && (
            <div
              role="tooltip"
              className="pointer-events-none absolute z-10 flex h-6 items-center whitespace-nowrap rounded-[6px] px-2 font-sans text-[12px]"
              style={{
                background: theme.tooltip,
                color: theme.tooltipText,
                ...(horizontal
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
                    }),
              }}
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
                    style={{ color: active ? theme.iconActive : theme.icon }}
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
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-3">
        <div
          className="flex gap-1 rounded-full p-1"
          style={{ background: theme.rail, boxShadow: bevel(theme, 2) }}
        >
          {(["stack", "row"] as Orientation[]).map((option) => (
            <button
              key={option}
              // Flipping mid-travel would strand the blob against stale measurements.
              onClick={() => flipTo(option)}
              disabled={option === "row" && narrow}
              // The label is the only name left now the text is gone.
              aria-label={`${option} layout`}
              aria-pressed={orientation === option}
              title={
                option === "row" && narrow
                  ? "Needs a wider viewport"
                  : undefined
              }
              className="grid h-8 w-8 place-items-center rounded-full cursor-pointer transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                color: orientation === option ? theme.iconActive : theme.icon,
                background:
                  orientation === option ? theme.active : "transparent",
              }}
            >
              {option === "stack" ? (
                <Stack color="currentColor" />
              ) : (
                <Layers color="currentColor" />
              )}
            </button>
          ))}
        </div>

        {/* One glyph at a time. Both are always mounted and stacked; the outgoing one
            rotates and scales away as the incoming one rotates in, so the swap is a
            single continuous turn rather than a cut. Counter-rotating them keeps the
            motion going the same way whichever direction you toggle. */}
        <button
          onClick={() => setThemeName(themeName === "dark" ? "light" : "dark")}
          aria-label={
            themeName === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          className="relative grid h-10 w-10 place-items-center rounded-full cursor-pointer"
          style={{
            background: theme.rail,
            boxShadow: bevel(theme, 2),
            color: theme.iconActive,
          }}
        >
          <span
            className={`absolute transition-all duration-500 ease-out motion-reduce:transition-none ${
              themeName === "light"
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-50 opacity-0"
            }`}
          >
            <Sun color="currentColor" />
          </span>
          <span
            className={`absolute transition-all duration-500 ease-out motion-reduce:transition-none ${
              themeName === "dark"
                ? "rotate-0 scale-100 opacity-100"
                : "rotate-90 scale-50 opacity-0"
            }`}
          >
            <Moon color="currentColor" />
          </span>
        </button>
      </div>
    </>
  );
};

export default SidebarMorphPage;
