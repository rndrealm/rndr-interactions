"use client";
import React, { useState } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  MotionValue,
  PanInfo,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { IIntegration, integrations, LOGO_VIEWBOX } from "./data";

const CARD_HEIGHT = 204.75;
const CARD_GAP = 8;
const STEP = CARD_HEIGHT + CARD_GAP;
const TEXT_HEIGHT = 40;

// finger travel per index — matched to the card so the drag tracks 1:1
const DRAG_STEP = STEP;
// how far a flick carries past where the finger let go, in seconds of velocity
const MOMENTUM = 0.12;
// pull-back applied when dragging past the first/last card
const EDGE_RESISTANCE = 0.25;

const MAX_INDEX = integrations.length - 1;

const transition = {
  type: "spring",
  stiffness: 260,
  damping: 34,
  mass: 0.9,
} as const;

// the tile carries the vendor's colour at full strength and the mark sits on
// it in white, which is how most of these brands draw their own
const MARK = "oklch(0.98 0.003 240)";
// but not all of them are dark: a white mark disappears on Intercom's cyan or
// Airtable's light blue, so pick against the tile's own luminance
const MARK_FLIP = 0.45;
function luminance(hex: string) {
  const channel = (at: number) => {
    const c = parseInt(hex.slice(at, at + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}
const MARK_DARK_L = 0.25;
function markOn(brand: string) {
  return luminance(brand) > MARK_FLIP ? darker(brand, MARK_DARK_L) : MARK;
}

const LOGO_SIZE = 43;
const OPEN_LOGO_SIZE = 132;
// how long a card has to sit in focus before its video starts
const VIDEO_DWELL = 2000;
const VIDEO_FADE = 0.45;
// the video plays under a flat black scrim, so the mark still reads over
// moving footage
const VIDEO_SCRIM = "#000000";
const VIDEO_SCRIM_A = 0.2;
// tiles ramp from the brand into a darker shade of itself, the same
// `oklch(from ...)` move the page wash makes
const TILE_ANGLE = "160deg";
const TILE_DARK_L = 0.36;
// multi-colour ramps get their chroma pulled back a little; at full strength
// four or five saturated hues across one axis read as bands rather than a blend
const SOFT_CHROMA = 0.78;
const softened = (colour: string) =>
  `oklch(from ${colour} l calc(c * ${SOFT_CHROMA}) h)`;

const tileGradient = (integration: IIntegration) => {
  // a one-colour brand ramps into a darker shade of itself. that is a pure
  // lightness move at a fixed hue, which is exactly what oklch is for
  if (!integration.palette) {
    return `linear-gradient(in oklch ${TILE_ANGLE}, ${integration.brand}, ${darker(
      integration.brand,
      TILE_DARK_L,
    )})`;
  }
  // a multi-colour brand is the opposite case: oklch would walk the hue wheel
  // between distant stops — Google's blue to red detours through magenta —
  // and every stop on the way arrives at full chroma. oklab crosses straight
  // through the space instead, dipping in chroma mid-transition, which is what
  // a soft blend actually looks like
  const stops = integration.palette.map(softened);
  return `linear-gradient(in oklab ${TILE_ANGLE}, ${stops.join(", ")})`;
};

// everything but the centred card sits 40% down from full
const OUT_OF_FOCUS_OPACITY = 0.6;
// and falls off a focal plane with it — one step from centre costs this much
// blur, so the column reads as depth rather than a stack of faded photos
const DEFOCUS_BLUR_STEP = 3;
// past a few cards more blur buys nothing and costs a lot to composite
const DEFOCUS_BLUR_MAX = 9;
// blurring a card softens what is inside it but leaves its silhouette a crisp
// rounded rectangle, so the edges still read as drawn lines. this fades the
// card's own top and bottom out by the same amount it is defocused
const DEFOCUS_FEATHER = 56;
// the column that bleeds past the panel, and how fast it gets out of the way
const GHOST_OPACITY = 0.15;
const GHOST_FADE = 0.3;

// the detail that arrives once the column stops moving. the name never moves —
// it stays in the focused row — and this opens underneath it
const SECONDARY_OFFSET = 28;
const SECONDARY_RISE = 6;
const SECONDARY_FADE = 0.28;

// how far PageUp and PageDown jump
const PAGE_STEP = 3;

// extra cards kept above and below the visible area so nothing pops in
const OVERSCAN = 2;
// deterministic first paint; the ResizeObserver corrects this after mount
const INITIAL_CARD_COUNT = 5;

// the wash is the tile's own colour with only its lightness taken down —
// `oklch(from ...)` keeps chroma and hue exactly, so it stays the brand rather
// than becoming a tint of it, and lands somewhere that blends into the black
// page. a colourless brand (Notion, GitHub) simply yields a grey of the same
// lightness, which is the honest answer for it
const darker = (brand: string, lightness: number) =>
  `oklch(from ${brand} ${lightness} c h)`;

// a flat field, not a glow: the page takes one solid colour from whichever
// integration is centred. only its lightness is pulled down, so it stays the
// brand and still carries white text
function washFor(integration: IIntegration) {
  // a black brand has no colour to take down; flat black is the honest answer
  if (luminance(integration.brand) <= WASH_FLOOR) return PAGE_BLACK;
  return darker(integration.brand, WASH_SOLID_L);
}

// the page itself, and what a black brand washes it with. Notion is #000000
// and GitHub near enough — darkening those gives grey, and a radial glow of
// grey reads as haze rather than as the brand. they get flat black instead
const PAGE_BLACK = "#010101";
const WASH_FLOOR = 0.02;

// the wash behind the page, in the focused integration's colour
const WASH_SOLID_L = 0.42;
// holds the backdrop back so it never competes with the white text over it
const BACKDROP_SCRIM = 0.35;
// long enough to read as a dissolve, short enough to keep up with a flick
const BACKDROP_FADE = 0.5;

// how far the blur reaches in from the top and bottom of the panel
const EDGE_BLUR_HEIGHT = 88;
const EDGE_BLUR_LAYERS = 8;
// radius at the very edge, falling to nothing at the inner end of the band
const EDGE_BLUR_MAX = 18;
// >1 keeps the strong blur close to the edge and lets the tail run long, so
// the blur meets unblurred content at nearly zero instead of stepping off it
const EDGE_BLUR_FALLOFF = 2;
// backdrop-filter under-blurs along its own container's edge — it has no
// backdrop to sample past it — so the container runs on beyond the panel and
// lets that weak strip fall outside, where overflow-hidden clips it away
const EDGE_BLUR_BLEED = 40;
// the blur alone still ends on a hard cut, so the same band fades to nothing
// over its length — content goes soft and transparent together
const EDGE_MASK = `linear-gradient(to bottom, transparent 0, #000 ${EDGE_BLUR_HEIGHT}px, #000 calc(100% - ${EDGE_BLUR_HEIGHT}px), transparent 100%)`;
// wraps any virtual index into the integration list, negatives included
// aria-activedescendant needs a stable id per slot to point at
const optionId = (virtualIndex: number) => `integration-option-${virtualIndex}`;
const optionDescId = (virtualIndex: number) =>
  `integration-desc-${virtualIndex}`;

function wrapIndex(value: number) {
  return (
    ((value % integrations.length) + integrations.length) % integrations.length
  );
}

function clampIndex(value: number) {
  return Math.min(MAX_INDEX, Math.max(0, value));
}

// let the drag go past the ends, but make it fight back
function withEdgeResistance(value: number) {
  if (value < 0) return value * EDGE_RESISTANCE;
  if (value > MAX_INDEX)
    return MAX_INDEX + (value - MAX_INDEX) * EDGE_RESISTANCE;
  return value;
}

// short square-wave tick, same shape as the circular drag knob
function useTickSound() {
  const audioCtxRef = React.useRef<AudioContext | null>(null);

  return React.useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    // browsers suspend the context until a gesture; a drag counts as one
    if (ctx.state === "suspended") ctx.resume();

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(1800, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.03);
  }, []);
}

interface IMark {
  integration: IIntegration;
  size: number;
  color: string;
}

// every mark is a single path, though not all are drawn on the same grid —
// a non-square viewBox just letterboxes inside the square slot
function Mark(props: IMark) {
  const { integration, size, color } = props;
  return (
    <svg
      viewBox={integration.viewBox ?? LOGO_VIEWBOX}
      width={size}
      height={size}
      // every mark sits inside something that already carries the name — the
      // option or the opened dialog — so naming it again only adds a node to
      // land on that says what was just said
      aria-hidden
      style={{ fill: color }}
    >
      <path d={integration.path} />
    </svg>
  );
}

interface ICard {
  integration: IIntegration;
  index: MotionValue<number>;
  virtualIndex: number;
  playing?: boolean;
  onClick?: () => void;
  layoutId?: string;
  /** the real column carries the semantics; the bleed copy is decorative */
  listed?: boolean;
  current?: boolean;
}

function Card(props: ICard) {
  const {
    integration,
    index,
    virtualIndex,
    playing,
    onClick,
    layoutId,
    listed,
    current,
  } = props;
  const showVideo = Boolean(playing && integration.video);
  // ramps rather than snaps, so the card brightens as it is dragged into
  // place instead of flicking at the halfway mark
  const opacity = useTransform(
    index,
    [virtualIndex - 1, virtualIndex, virtualIndex + 1],
    [OUT_OF_FOCUS_OPACITY, 1, OUT_OF_FOCUS_OPACITY],
  );
  // how far out of focus this card is, 0 at centre and 1 once it is as
  // blurred as it will get. both the blur and the edge fade read from it, so
  // a card's silhouette always dissolves in step with its contents
  const defocus = useTransform(index, (i) =>
    Math.min(
      (Math.abs(i - virtualIndex) * DEFOCUS_BLUR_STEP) / DEFOCUS_BLUR_MAX,
      1,
    ),
  );
  const filter = useTransform(defocus, (d) => {
    const radius = d * DEFOCUS_BLUR_MAX;
    // skip the filter entirely at centre rather than compositing a blur(0)
    return radius < 0.05 ? "none" : `blur(${radius.toFixed(2)}px)`;
  });
  // both axes, intersected — a vertical fade alone leaves the sides and the
  // rounded corners as hard as they were, and the corners are where a
  // rectangle announces itself
  const edgeFade = useTransform(defocus, (d) => {
    const f = (d * DEFOCUS_FEATHER).toFixed(1);
    // the focused card keeps its edges; it is the one meant to look drawn
    if (d * DEFOCUS_FEATHER < 0.5) return "none";
    const ramp = (dir: string) =>
      `linear-gradient(to ${dir}, transparent 0, #000 ${f}px,` +
      ` #000 calc(100% - ${f}px), transparent 100%)`;
    return `${ramp("bottom")}, ${ramp("right")}`;
  });
  return (
    <motion.div
      // keyed to the slot rather than the integration: there are fewer
      // integrations than visible slots, so the same one appears twice and
      // two elements sharing a layoutId would animate into each other. the
      // bleed column never opens, so it takes no layoutId at all
      layoutId={layoutId ? `${layoutId}${virtualIndex}` : undefined}
      // no overflow-hidden here: it dates from when a photo needed cropping.
      // all it does now is clip the defocus blur into a hard-edged rectangle,
      // squaring off the rounded corners and leaving a bright vertical seam
      // where the blurred fill is cut. the panel still clips at its own bounds
      className="w-full shrink-0"
      style={{ height: CARD_HEIGHT }}
      // the bleed column renders the same cards again purely as decoration,
      // so only the real one is announced — otherwise every integration is
      // read out twice
      role={listed ? "option" : undefined}
      id={listed ? optionId(virtualIndex) : undefined}
      aria-selected={listed ? current : undefined}
      aria-label={listed ? integration.name : undefined}
      aria-describedby={listed ? optionDescId(virtualIndex) : undefined}
      aria-posinset={listed ? wrapIndex(virtualIndex) + 1 : undefined}
      aria-setsize={listed ? integrations.length : undefined}
      // a card only takes a single click once its video is up: the video can
      // only be playing after two still seconds, so there is no gesture in
      // flight to mistake for a click. a bare tile still wants a double
      onClick={showVideo ? onClick : undefined}
      onDoubleClick={onClick}
    >
      {/* opening a card hands off to the overlay, and motion drives the
          layoutId element's opacity to do it — so defocus lives one level in
          rather than writing the same property from a second place */}
      <motion.div
        // overflow-hidden here clips the video to the rounded tile. it does
        // not re-clip the defocus blur: the filter applies to this element's
        // rendered result and still spreads outward from it
        className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center"
        style={{
          opacity,
          filter,
          maskImage: edgeFade,
          WebkitMaskImage: edgeFade,
          // only the standard property: -webkit-mask-composite takes a
          // different keyword set, and setting it alongside this one wins and
          // leaves the computed value at source-in rather than intersect
          maskComposite: "intersect",
          background: tileGradient(integration),
        }}
      >
        <AnimatePresence>
          {showVideo && (
            <motion.video
              key="video"
              src={integration.video}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: VIDEO_FADE, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
        {/* the scrim holds the footage back so the mark stays legible */}
        <AnimatePresence>
          {showVideo && (
            <motion.div
              key="scrim"
              aria-hidden
              className="absolute inset-0"
              style={{ backgroundColor: VIDEO_SCRIM }}
              initial={{ opacity: 0 }}
              animate={{ opacity: VIDEO_SCRIM_A }}
              exit={{ opacity: 0 }}
              transition={{ duration: VIDEO_FADE, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
        <div className="relative">
          <Mark
            integration={integration}
            size={LOGO_SIZE}
            // over footage the mark is always off-white; on a bare tile it
            // still has to survive a light brand
            color={showVideo ? MARK : markOn(integration.brand)}
          />
        </div>
        {/* the category and blurb are shown beside the column rather than on
            the card, so the option carries them itself for anyone who never
            sees that panel */}
        {listed && (
          <span id={optionDescId(virtualIndex)} className="sr-only">
            {integration.category}. {integration.blurb}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}

interface IBackdrop {
  focusedIndex: number;
}

// the page takes its colour from whichever integration is centred. a gradient
// needs no blur and no loading, so unlike a photo backdrop it is simply always
// there — every wash stays mounted and only opacity moves
function Backdrop(props: IBackdrop) {
  const { focusedIndex } = props;
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {integrations.map((integration, i) => (
        <motion.div
          key={integration.id}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: i === focusedIndex ? 1 : 0 }}
          transition={{ duration: BACKDROP_FADE, ease: "easeOut" }}
          style={{
            backgroundColor: washFor(integration),
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: PAGE_BLACK, opacity: BACKDROP_SCRIM }}
      />
    </div>
  );
}

interface ICardColumn {
  index: MotionValue<number>;
  onClick?: (data: IIntegration, virtualIndex: number) => void;
  playingIndex?: number | null;
  layoutId?: string;
  listed?: boolean;
  activeIndex?: number;
}

function CardColumn(props: ICardColumn) {
  const {
    index,
    onClick = () => {},
    layoutId,
    playingIndex = null,
    listed,
    activeIndex,
  } = props;
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  // how many cards the visible area can hold; measured after mount
  const [count, setCount] = React.useState(INITIAL_CARD_COUNT);

  // nearest whole index — only this moves the window, so re-renders are rare
  const [center, setCenter] = React.useState(0);

  React.useEffect(() => {
    const el = wrapperRef.current?.parentElement;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setCount(Math.ceil(entry.contentRect.height / STEP) + OVERSCAN * 2);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useMotionValueEvent(index, "change", (value) => {
    const next = Math.round(value);
    setCenter((current) => (current === next ? current : next));
  });

  const start = center - Math.floor(count / 2);

  // depends on index alone, so the window can slide without restaling it
  const y = useTransform(index, (i) => -(i * STEP + CARD_HEIGHT / 2));

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-x-0 top-1/2"
      style={{ transform: `translateY(${start * STEP}px)` }}
    >
      <motion.div className="flex flex-col" style={{ gap: `${CARD_GAP}px`, y }}>
        {Array(count)
          .fill(0)
          .map((_, i) => {
            // virtual index: unbounded, wraps into the texture list
            const virtualIndex = start + i;
            return (
              <Card
                key={virtualIndex}
                layoutId={layoutId}
                index={index}
                virtualIndex={virtualIndex}
                playing={virtualIndex === playingIndex}
                listed={listed}
                current={virtualIndex === activeIndex}
                integration={integrations[wrapIndex(virtualIndex)]}
                onClick={() => {
                  onClick(integrations[wrapIndex(virtualIndex)], virtualIndex);
                }}
              />
            );
          })}
      </motion.div>
    </div>
  );
}

interface IEdgeBlur {
  edge: "top" | "bottom";
}

// a stack of masked backdrop-filters rather than one flat blur, which would
// leave a hard seam where it stops.
//
// each layer owns a window rather than covering everything from the edge to
// its own cutoff. a window ramps in, holds, and ramps back out, and it is
// offset by exactly one segment from its neighbours — so every layer's ramp
// is covered by the next layer's plateau and none of them has a cutoff of
// its own to show. the nested version this replaces stacked all eight at the
// edge and stepped down one cutoff at a time, which is what banded.
function EdgeBlur(props: IEdgeBlur) {
  const { edge } = props;
  const towards = edge === "top" ? "bottom" : "top";
  const total = EDGE_BLUR_HEIGHT + EDGE_BLUR_BLEED;
  const blur = `blur(${EDGE_BLUR_MAX}px)`;
  const mask = `linear-gradient(to ${towards}, #000 0, transparent ${total}px)`;
  return (
    <div
      className="absolute inset-x-0 pointer-events-none"
      style={{
        height: total,
        ...(edge === "top"
          ? { top: -EDGE_BLUR_BLEED }
          : { bottom: -EDGE_BLUR_BLEED }),
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: blur,
          WebkitBackdropFilter: blur,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
    </div>
  );
}

interface IText {
  text?: string;
}
function Text(props: IText) {
  const { text } = props;
  return (
    <div className="h-10 shrink-0 flex flex-col justify-center">
      <p className="text-xl text-[oklch(0.98_0.003_240)] whitespace-nowrap line-clamp-1 flex-1">
        {text || "Lorem ipsum dolor sit amet."}
      </p>
    </div>
  );
}

interface ITextColumn {
  index: MotionValue<number>;
  className?: string;
}

function TextColumn(props: ITextColumn) {
  const { index, className = "" } = props;
  // flex-col-reverse stacks from the end, so offset by distance from the last item
  const y = useTransform(index, (i) => -(MAX_INDEX - i) * TEXT_HEIGHT);

  return (
    <motion.div className={`flex flex-col-reverse ${className}`} style={{ y }}>
      {Array(integrations.length)
        .fill(0)
        .map((_, i) => {
          return <Text key={i} text={integrations[i].name} />;
        })}
    </motion.div>
  );
}

export default function Page() {
  // continuous while dragging, integer at rest
  const index = useMotionValue(0);
  // the committed whole-number index
  // const [activeIndex, setActiveIndex] = React.useState(0);
  // the opened *card*, not just which integration — the same integration can
  // be on screen in two slots at once
  const [selected, setSelected] = useState<{
    integration: IIntegration;
    virtualIndex: number;
  } | null>(null);
  const playTick = useTickSound();
  const lastTick = React.useRef(0);
  // the card sitting in the centre — drives the backdrop
  const [focusedIndex, setFocusedIndex] = React.useState(0);

  // fire as the fractional index crosses each whole number
  useMotionValueEvent(index, "change", (value) => {
    const tick = Math.round(value);
    if (tick === lastTick.current) return;
    lastTick.current = tick;
    setFocusedIndex(clampIndex(tick));
    playTick();
  });

  // baseline for the current gesture; null between drags
  const dragOrigin = React.useRef<{ index: number; offsetY: number } | null>(
    null,
  );

  // whichever handler fires first anchors the gesture, so the drag never
  // measures from a stale index
  // true only while the column is at rest on a whole index
  const [settled, setSettled] = React.useState(true);
  // the slot whose video has earned its place by being dwelt on
  const [dwelt, setDwelt] = React.useState<number | null>(null);
  // a gesture starting mid-snap must not let the old snap report "settled"
  const settleToken = React.useRef(0);

  const anchorDrag = (offsetY: number) => {
    if (dragOrigin.current) return;
    settleToken.current += 1;
    setSettled(false);
    index.stop(); // drop any in-flight snap so the finger takes over cleanly
    dragOrigin.current = { index: index.get(), offsetY };
  };

  // the carousel is frozen while an integration is open
  const isLocked = selected !== null;

  // re-runs on every settle and every change of focus, so the timer only ever
  // fires for a card that has held still for the whole two seconds
  React.useEffect(() => {
    if (!settled || isLocked) return;
    const timer = setTimeout(() => setDwelt(focusedIndex), VIDEO_DWELL);
    return () => clearTimeout(timer);
  }, [settled, isLocked, focusedIndex]);

  // derived rather than reset from the effect: the moment the column moves or
  // a card opens, the stored slot stops matching and playback stops with it
  const playingIndex =
    settled && !isLocked && dwelt === focusedIndex ? dwelt : null;

  // the listbox is what the user tabs to; the opened card takes focus while
  // it is up and hands it straight back on close
  const listRef = React.useRef<HTMLDivElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const hadSelection = React.useRef(false);

  React.useEffect(() => {
    if (selected) {
      hadSelection.current = true;
      dialogRef.current?.focus();
    } else if (hadSelection.current) {
      // only on the way back out, so the page does not grab focus on mount
      hadSelection.current = false;
      listRef.current?.focus();
    }
  }, [selected]);

  // one way in for every non-drag move, so a key lands on the same spring a
  // flick does and reports settled the same way
  const goTo = (next: number) => {
    const target = clampIndex(next);
    index.stop();
    setSettled(false);
    const token = ++settleToken.current;
    animate(index, target, transition).then(() => {
      if (settleToken.current === token) setSettled(true);
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // while a card is open the only thing a key can do is close it
    if (isLocked) {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelected(null);
      }
      return;
    }

    const current = clampIndex(Math.round(index.get()));
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        goTo(current + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        goTo(current - 1);
        break;
      case "Home":
        event.preventDefault();
        goTo(0);
        break;
      case "End":
        event.preventDefault();
        goTo(MAX_INDEX);
        break;
      case "PageDown":
        event.preventDefault();
        goTo(current + PAGE_STEP);
        break;
      case "PageUp":
        event.preventDefault();
        goTo(current - PAGE_STEP);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        setSelected({
          integration: integrations[wrapIndex(current)],
          virtualIndex: current,
        });
        break;
      default:
        break;
    }
  };

  const handlePanStart = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (isLocked) return;
    anchorDrag(info.offset.y);
  };

  const handlePan = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (isLocked) return;
    anchorDrag(info.offset.y);

    const origin = dragOrigin.current;
    if (!origin) return;

    // measure from the anchor, not from the raw offset
    const dragged = info.offset.y - origin.offsetY;
    index.set(withEdgeResistance(origin.index - dragged / DRAG_STEP));
  };

  const handlePanEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const origin = dragOrigin.current;
    dragOrigin.current = null;

    // no anchor means the gesture never moved the carousel
    if (!origin) return;

    // carry the flick a little past the release point, then land on a whole index
    const projected = index.get() - (info.velocity.y / DRAG_STEP) * MOMENTUM;
    const snapped = clampIndex(Math.round(projected));

    const token = ++settleToken.current;
    animate(index, snapped, transition).then(() => {
      // a newer gesture has taken over; that one owns the settle now
      if (settleToken.current === token) setSettled(true);
    });
  };

  return (
    <div className="h-screen w-full flex justify-center overflow-hidden relative bg-[#010101]">
      <Backdrop focusedIndex={focusedIndex} />
      <div className="w-200 h-full flex flex-col justify-center items-center relative z-10">
        <motion.div
          className={`w-full h-112.5 rounded-2xl overflow-hidden select-none relative ${
            isLocked ? "cursor-default" : "cursor-grab active:cursor-grabbing"
          }`}
          style={{ touchAction: "none" }}
          onPanStart={handlePanStart}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
          // on the panel rather than the listbox, so Escape still reaches it
          // while focus is inside the opened card
          onKeyDown={handleKeyDown}
        >
          {/* the fade is scoped to the content. it used to sit on the panel,
              which made the panel a backdrop root — and a backdrop root is
              invisible to backdrop-filter, so every EdgeBlur layer inside it
              was compositing artefacts instead of blurring anything */}
          <div
            className="absolute inset-0 px-4 flex gap-8"
            style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
          >
            <div className="flex-1 relative" aria-hidden>
              {/* the rest of the list occupies the space the description opens
                into, so the two states trade places: scrubbing shows the list,
                resting shows the detail */}
              <motion.div
                className="absolute inset-x-0 top-[50%] -translate-y-5 overflow-hidden"
                initial={false}
                animate={{ opacity: settled ? 0 : GHOST_OPACITY }}
                transition={{ duration: SECONDARY_FADE, ease: "easeOut" }}
              >
                <TextColumn index={index} />
                <TextColumn index={index} className="flex-col" />
              </motion.div>
              <motion.div className="absolute inset-x-0 top-[50%] h-10 -translate-y-1/2 overflow-hidden">
                <TextColumn index={index} />
              </motion.div>
              {/* keyed to the integration so a new one animates in rather than
                the text swapping under a static block */}
              <AnimatePresence mode="wait">
                {settled && (
                  <motion.div
                    key={focusedIndex}
                    className="absolute inset-x-0 top-[50%] pr-8"
                    style={{ marginTop: SECONDARY_OFFSET }}
                    initial={{ opacity: 0, y: SECONDARY_RISE }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 0 }}
                    transition={{ duration: SECONDARY_FADE, ease: "easeOut" }}
                  >
                    <p
                      className="text-[14px] leading-[20px] tracking-[-0.0046em] opacity-50"
                      style={{ color: MARK }}
                    >
                      {integrations[focusedIndex].category}
                    </p>
                    <p
                      className="mt-2 h-10 text-[14px] leading-[20px] tracking-[-0.0046em] opacity-70 line-clamp-2"
                      style={{ color: MARK }}
                    >
                      {integrations[focusedIndex].blurb}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div
              ref={listRef}
              role="listbox"
              aria-label="Integrations"
              aria-activedescendant={optionId(focusedIndex)}
              tabIndex={0}
              // no focus ring by request. the semantics are untouched — the
              // listbox still takes focus and aria-activedescendant still tracks
              // the centred card, so screen readers follow the keyboard fine;
              // what is gone is the sighted cue that the column has focus
              className="flex-1 relative outline-none"
            >
              <CardColumn
                index={index}
                layoutId="integration"
                playingIndex={playingIndex}
                listed
                activeIndex={focusedIndex}
                onClick={(integration, virtualIndex) => {
                  setSelected({ integration, virtualIndex });
                }}
              />
            </div>
          </div>
          {/* outside the mask, so their backdrop is the panel's real content */}
          <EdgeBlur edge="top" />
          <EdgeBlur edge="bottom" />
          <AnimatePresence>
            {selected && (
              <motion.div
                ref={dialogRef}
                role="dialog"
                aria-modal
                aria-label={selected.integration.name}
                tabIndex={-1}
                layoutId={`integration${selected.virtualIndex}`}
                className="absolute inset-0 z-5 overflow-hidden outline-none"
                style={{ background: tileGradient(selected.integration) }}
                onClick={() => {
                  setSelected(null);
                }}
              >
                {selected.integration.video && (
                  <>
                    <video
                      src={selected.integration.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: VIDEO_SCRIM,
                        opacity: VIDEO_SCRIM_A,
                      }}
                    />
                  </>
                )}
                <div className="relative h-full flex items-center gap-10 px-12">
                  <div className="shrink-0">
                    <Mark
                      integration={selected.integration}
                      size={OPEN_LOGO_SIZE}
                      color={
                        selected.integration.video
                          ? MARK
                          : markOn(selected.integration.brand)
                      }
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xs opacity-70"
                      style={{
                        color: selected.integration.video
                          ? MARK
                          : markOn(selected.integration.brand),
                      }}
                    >
                      {selected.integration.category}
                    </p>
                    <p className="mt-2 text-3xl text-[oklch(0.98_0.003_240)]">
                      {selected.integration.name}
                    </p>
                    <p className="mt-3 text-lg text-[oklch(0.98_0.003_240)] opacity-70">
                      {selected.integration.blurb}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div
          className="absolute inset-0 px-4 flex gap-8 pointer-events-none"
          aria-hidden
        >
          <div className="flex-1"></div>
          {/* this bleed paints over the panel, so an opened card would sit
              under a ghost of the column it came from — get it out of the way */}
          <motion.div
            className="flex-1 relative overflow-hidden"
            initial={false}
            animate={{ opacity: isLocked ? 0 : GHOST_OPACITY }}
            transition={{ duration: GHOST_FADE, ease: "easeOut" }}
            // same ramp as the panel, so the ghost fades out at the edges
            // instead of ending on a cut the real column never has
            style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
          >
            <CardColumn index={index} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
