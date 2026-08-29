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
import { IMAGE_BASE_URL, IMovieData, movieData } from "./data";

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

// extra cards kept above and below the visible area so nothing pops in
const OVERSCAN = 2;
// deterministic first paint; the ResizeObserver corrects this after mount
const INITIAL_CARD_COUNT = 5;

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
  onClick?: () => void;
  layoutId?: string;
}

function Card(props: ICard) {
  const { movie, onClick, layoutId = "" } = props;
  return (
    <motion.div
      layoutId={`${layoutId}${movie?.id}`}
      className="w-full shrink-0 bg-slate-300 overflow-hidden"
      style={{ height: CARD_HEIGHT }}
      onDoubleClick={onClick}
    >
      <Image
        src={`${IMAGE_BASE_URL}${movie.backdrop_path}`}
        alt={movie.title}
        draggable={false}
        width={364}
        height={200}
        style={{
          objectFit: "cover",
        }}
      />
    </motion.div>
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

interface IText {
  text?: string;
}
function Text(props: IText) {
  const { text } = props;
  return (
    <div className="h-10 shrink-0 flex flex-col justify-center">
      <p className="text-xl text-[oklch(0.2_0.003_240)] whitespace-nowrap line-clamp-1 flex-1">
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

  // fire as the fractional index crosses each whole number
  useMotionValueEvent(index, "change", (value) => {
    const tick = Math.round(value);
    if (tick === lastTick.current) return;
    lastTick.current = tick;
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
    <div className="h-screen w-full flex justify-center overflow-hidden">
      <div className="w-200 h-full flex flex-col justify-center items-center relative">
        <motion.div
          className={`w-full h-112.5 bg-white border-4 border-black rounded-2xl flex gap-8 overflow-hidden px-4 select-none relative ${
            isLocked ? "cursor-default" : "cursor-grab active:cursor-grabbing"
          }`}
          style={{ touchAction: "none" }}
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
                  src={`${IMAGE_BASE_URL}${selectedMovie.backdrop_path}`}
                  alt={selectedMovie.title}
                  draggable={false}
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

        <div className="absolute inset-0 px-4 flex gap-8 border-4 border-transparent pointer-events-none">
          <div className="flex-1"></div>
          <div className="flex-1 relative overflow-hidden opacity-15">
            <CardColumn index={index} />
          </div>
        </div>
      </div>
    </div>
  );
}
