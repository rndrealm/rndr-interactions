"use client";
import React, { useState } from "react";
import Image from "next/image";
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
import { IMovieData, movieData } from "./data";

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

const MAX_INDEX = movieData.length - 1;

const transition = {
  type: "spring",
  stiffness: 260,
  damping: 34,
  mass: 0.9,
} as const;

// TMDB serves the same frame at several widths. `original` runs 2-3MB, which
// is wasteful for a 364px card and, worse, lands seconds after the opened
// card's hand-off has already hidden the card it came from
const CARD_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w780";
const OPEN_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w1280";

// everything but the centred card sits 40% down from full
const OUT_OF_FOCUS_OPACITY = 0.6;
// and falls off a focal plane with it — one step from centre costs this much
// blur, so the column reads as depth rather than a stack of faded photos
const DEFOCUS_BLUR_STEP = 3;
// past a few cards more blur buys nothing and costs a lot to composite
const DEFOCUS_BLUR_MAX = 9;
// the column that bleeds past the panel, and how fast it gets out of the way
const GHOST_OPACITY = 0.15;
const GHOST_FADE = 0.3;

// extra cards kept above and below the visible area so nothing pops in
const OVERSCAN = 2;
// deterministic first paint; the ResizeObserver corrects this after mount
const INITIAL_CARD_COUNT = 5;

// the focused backdrop, blown up to fill the page behind everything
const BACKDROP_BLUR = 96;
// 2x the viewport, so only the middle of the frame lands on the page. these
// posters letterbox themselves in near-black, and at cover scale those edges
// read as hard bands across the top and bottom
const BACKDROP_BLEED = "50%";
// holds the backdrop back so it never competes with the white text over it
const BACKDROP_SCRIM = 0.4;
// blurring this wide greys the colour out; put it back
const BACKDROP_SATURATE = 1.4;
// long enough to read as a dissolve, short enough to keep up with a flick
const BACKDROP_FADE = 0.5;

// how far the blur reaches in from the top and bottom of the panel
const EDGE_BLUR_HEIGHT = 88;
// layers stack, so the band nearest the edge picks up every one of them
const EDGE_BLUR_LAYERS = 5;
const EDGE_BLUR_BASE = 1;
// the blur alone still ends on a hard cut, so the same band fades to nothing
// over its length — content goes soft and transparent together
const EDGE_MASK = `linear-gradient(to bottom, transparent 0, #000 ${EDGE_BLUR_HEIGHT}px, #000 calc(100% - ${EDGE_BLUR_HEIGHT}px), transparent 100%)`;
// 48px of blur throws away the detail anyway, so pull a small file and let
// the browser upscale it — a full-size backdrop arrives too late to cross-fade
const BACKDROP_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w780";
const BACKDROP_IMAGE_WIDTH = "640px";

// wraps any virtual index into the texture list, negatives included
function wrapIndex(value: number) {
  return ((value % movieData.length) + movieData.length) % movieData.length;
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

interface ICard {
  movie: (typeof movieData)[number];
  index: MotionValue<number>;
  virtualIndex: number;
  onClick?: () => void;
  layoutId?: string;
}

function Card(props: ICard) {
  const { movie, index, virtualIndex, onClick, layoutId = "" } = props;
  // ramps rather than snaps, so the card brightens as it is dragged into
  // place instead of flicking at the halfway mark
  const opacity = useTransform(
    index,
    [virtualIndex - 1, virtualIndex, virtualIndex + 1],
    [OUT_OF_FOCUS_OPACITY, 1, OUT_OF_FOCUS_OPACITY],
  );
  // same continuous distance, so focus and brightness arrive together
  const filter = useTransform(index, (i) => {
    const radius = Math.min(
      Math.abs(i - virtualIndex) * DEFOCUS_BLUR_STEP,
      DEFOCUS_BLUR_MAX,
    );
    // skip the filter entirely at centre rather than compositing a blur(0)
    return radius < 0.05 ? "none" : `blur(${radius.toFixed(2)}px)`;
  });
  return (
    <motion.div
      layoutId={`${layoutId}${movie?.id}`}
      className="w-full shrink-0 overflow-hidden"
      style={{ height: CARD_HEIGHT }}
      onDoubleClick={onClick}
    >
      {/* opening a card hands off to the overlay, and motion drives the
          layoutId element's opacity to do it — so defocus lives one level in
          rather than writing the same property from a second place */}
      <motion.div
        className="w-full h-full bg-neutral-800"
        style={{ opacity, filter }}
      >
        <Image
          src={`${CARD_IMAGE_BASE_URL}${movie.backdrop_path}`}
          alt={movie.title}
          draggable={false}
          width={364}
          height={200}
          style={{
            objectFit: "cover",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

interface IBackdrop {
  focusedIndex: number;
}

// the card in focus, at page scale and out of focus. every backdrop stays
// mounted and only its opacity moves, so a scroll never lands on an image
// that has not downloaded yet
function Backdrop(props: IBackdrop) {
  const { focusedIndex } = props;
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {/* one blur pass over the whole stack rather than one per layer */}
      <div
        className="absolute"
        style={{
          inset: `-${BACKDROP_BLEED}`,
          filter: `blur(${BACKDROP_BLUR}px) saturate(${BACKDROP_SATURATE})`,
        }}
      >
        {movieData.map((movie, i) => (
          <motion.div
            key={movie.id}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: i === focusedIndex ? 1 : 0 }}
            transition={{ duration: BACKDROP_FADE, ease: "easeOut" }}
          >
            <Image
              src={`${BACKDROP_IMAGE_BASE_URL}${movie.backdrop_path}`}
              alt=""
              fill
              sizes={BACKDROP_IMAGE_WIDTH}
              draggable={false}
              style={{ objectFit: "cover" }}
            />
          </motion.div>
        ))}
      </div>
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: BACKDROP_SCRIM }}
      />
    </div>
  );
}

interface ICardColumn {
  index: MotionValue<number>;
  onClick?: (data: IMovieData) => void;
  layoutId?: string;
}

function CardColumn(props: ICardColumn) {
  const { index, onClick = () => {}, layoutId } = props;
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
                movie={movieData[wrapIndex(virtualIndex)]}
                onClick={() => {
                  onClick(movieData[wrapIndex(virtualIndex)]);
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
// leave a hard seam where it stops. each layer blurs twice as hard as the one
// under it and covers a shorter band, so the strength ramps into the edge
function EdgeBlur(props: IEdgeBlur) {
  const { edge } = props;
  // the ramp always runs from the edge inward, so it flips with the edge
  const towards = edge === "top" ? "bottom" : "top";
  return (
    <div
      className="absolute inset-x-0 pointer-events-none"
      style={{
        height: EDGE_BLUR_HEIGHT,
        ...(edge === "top" ? { top: 0 } : { bottom: 0 }),
      }}
    >
      {Array.from({ length: EDGE_BLUR_LAYERS }).map((_, i) => {
        const solid = ((EDGE_BLUR_LAYERS - i - 1) / EDGE_BLUR_LAYERS) * 100;
        const clear = ((EDGE_BLUR_LAYERS - i) / EDGE_BLUR_LAYERS) * 100;
        const blur = `blur(${EDGE_BLUR_BASE * 2 ** i}px)`;
        const mask = `linear-gradient(to ${towards}, #000 ${solid}%, transparent ${clear}%)`;
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backdropFilter: blur,
              WebkitBackdropFilter: blur,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
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
      {Array(movieData.length)
        .fill(0)
        .map((_, i) => {
          return <Text key={i} text={movieData[i].title} />;
        })}
    </motion.div>
  );
}

export default function Page() {
  // continuous while dragging, integer at rest
  const index = useMotionValue(0);
  // the committed whole-number index
  // const [activeIndex, setActiveIndex] = React.useState(0);
  const [selectedMovie, setSelectedMovie] = useState<IMovieData | null>(null);
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
  const anchorDrag = (offsetY: number) => {
    if (dragOrigin.current) return;
    index.stop(); // drop any in-flight snap so the finger takes over cleanly
    dragOrigin.current = { index: index.get(), offsetY };
  };

  // the carousel is frozen while a movie is open
  const isLocked = selectedMovie !== null;

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

    // setActiveIndex(snapped);
    animate(index, snapped, transition);
  };

  return (
    <div className="h-screen w-full flex justify-center overflow-hidden relative bg-black">
      <Backdrop focusedIndex={focusedIndex} />
      <div className="w-200 h-full flex flex-col justify-center items-center relative z-10">
        <motion.div
          className={`w-full h-112.5 rounded-2xl flex gap-8 overflow-hidden px-4 select-none relative ${
            isLocked ? "cursor-default" : "cursor-grab active:cursor-grabbing"
          }`}
          style={{
            touchAction: "none",
            maskImage: EDGE_MASK,
            WebkitMaskImage: EDGE_MASK,
          }}
          onPanStart={handlePanStart}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
        >
          <div className="flex-1 relative">
            <div className="absolute inset-x-0 top-[50%] -translate-y-5 overflow-hidden opacity-15">
              <TextColumn index={index} />
              <TextColumn index={index} className="flex-col" />
            </div>
            <motion.div className="absolute inset-x-0 top-[50%] h-10 -translate-y-1/2 overflow-hidden">
              <TextColumn index={index} />
            </motion.div>
          </div>
          <div className="flex-1 relative">
            <CardColumn
              index={index}
              layoutId="movies"
              onClick={(movie) => {
                setSelectedMovie(movie);
              }}
            />
          </div>
          <EdgeBlur edge="top" />
          <EdgeBlur edge="bottom" />
          <AnimatePresence>
            {selectedMovie && (
              <motion.div
                layoutId={`movies${selectedMovie?.id}`}
                className="absolute inset-0 z-5"
                onClick={() => {
                  setSelectedMovie(null);
                }}
              >
                <Image
                  src={`${OPEN_IMAGE_BASE_URL}${selectedMovie.backdrop_path}`}
                  alt={selectedMovie.title}
                  draggable={false}
                  priority
                  width={800}
                  height={450}
                  style={{
                    objectFit: "cover",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="absolute inset-0 px-4 flex gap-8 pointer-events-none">
          <div className="flex-1"></div>
          {/* this bleed paints over the panel, so an opened card would sit
              under a ghost of the column it came from — get it out of the way */}
          <motion.div
            className="flex-1 relative overflow-hidden"
            initial={false}
            animate={{ opacity: isLocked ? 0 : GHOST_OPACITY }}
            transition={{ duration: GHOST_FADE, ease: "easeOut" }}
          >
            <CardColumn index={index} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
