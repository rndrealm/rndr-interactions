import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import gsap from "gsap";
import { Column } from "./column";
import { Mode } from "@/app/photoyoshi/page";
import { IMAGE_BASE_URL, movieData } from "@/app/mask-carousel/data";
import { cn } from "@/lib/utils";

type StripColor = "red" | "yellow" | "blue";

type ILayout = {
  widths: number[];
  slotLeft: number[];
  total: number;
};

interface IProps {
  mode: Mode;
  isVisible?: boolean;
}

/**
 * One entry per box across the whole row — `TOTAL_COLUMNS * BOXES_PER_COLUMN`
 * of them, in a single flat array so the WebGL side can walk one list instead
 * of 36 per-column ones. `flatIndex` doubles as the instance/plane index.
 */
export type BoxInfo = {
  flatIndex: number;
  columnIndex: number;
  boxIndex: number;
  data: (typeof COLUMNS)[number]; // id, color, isSurvivor
  element: HTMLElement; // the box itself
  child: HTMLElement | null; // the inner box — your ".gl-i"
  /**
   * The <img> inside the card. next/image proxies through /_next/image, so this
   * is a *same-origin* URL even though the file comes from TMDB — it can be fed
   * straight to a THREE.Texture without CORS headers from the remote host and
   * without tainting the canvas.
   */
  image: HTMLImageElement | null;
  /** What the browser actually picked out of the srcset — the dedup key. */
  src?: string;
};

export type ScrollApi = {
  nudge: (viewportMultiplier: number, duration: number, ease: string) => void;
  /**
   * Move the scroll target by a number of pixels. Additive by design — every
   * input source composes rather than competing, and none can discard another's
   * contribution. Raw pixels: input tuning (wheel speed, drag speed) belongs to
   * whoever owns the listeners.
   */
  addScroll: (pixels: number) => void;
  /**
   * `velocity` is signed pixels moved this frame, the same quantity Lenis
   * exposes. Every input lands on `target` and is eased into `current`, so one
   * number covers wheel, drag and nudge alike — there is nothing per-listener
   * to wire up. Frame-scaled, not per-second: EASE is a fixed fraction per
   * frame, so a 120Hz display halves both the settle time and this value.
   *
   * `smoothVelocity` is the same signal under an attack/release envelope. Use
   * it to drive visuals: raw velocity collapses in roughly a third of a second
   * because it is proportional to a gap that EASE is closing, which reads as a
   * flicker rather than momentum.
   */
  scroll: {
    current: number;
    target: number;
    velocity: number;
    smoothVelocity: number;
  };
  boxes: () => BoxInfo[];
  /**
   * Live box geometry, 4 floats per box — `[x, y, width, height]` at
   * `flatIndex * 4`, in CSS pixels with a top-left origin (same convention as
   * `getBoundingClientRect`). Rewritten in place every frame; never reallocated,
   * so consumers can hold onto it. Read it, don't write it.
   */
  rects: Float32Array;
  /** Rebuild the box list. Only needed if boxes are added/removed from the DOM. */
  refreshBoxes: () => void;
};

const BLOCK_SIZE = 6; // LCM(3 colors, 4 survivor-mod) — pattern realigns every 12 columns
export const BOXES_PER_COLUMN = 5;
const BLOCKS = 3; // buffer block + visible block + buffer block
export const TOTAL_COLUMNS = BLOCK_SIZE * BLOCKS;

const EASE = 0.1;

export const SINGLE_UNIT_VW = 1.6667;

export const BOX_VW = SINGLE_UNIT_VW * 4;
export const MARGIN_VW = SINGLE_UNIT_VW * 1.75;
export const SURVIVOR_BOX_VW = 49;
export const SURVIVOR_MARGIN_VW = 0.5;

const COLOR_CYCLE: StripColor[] = ["yellow", "red", "blue"];

export const COLOR_MAP: Record<StripColor, string> = {
  red: "#E24B4A",
  yellow: "#FAC775",
  blue: "#378ADD",
};

export const PORTRAIT_ASPECT = 683 / 1024;
export const LANDSCAPE_ASPECT = 1024 / 683;
/** Share of cards drawn landscape; the rest are portrait. */
const LANDSCAPE_SHARE = 0.25;

/**
 * Deterministic [0, 1) from an integer seed.
 *
 * Math.random() is not an option: COLUMNS is built at module scope and rendered
 * on the server, so a fresh draw on the client would be a hydration mismatch.
 * Math.imul keeps every step exact 32-bit integer maths, which is bit-identical
 * across engines — a Math.sin-based hash is not guaranteed to be.
 */
function hash01(seed: number) {
  let h = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export const COLUMNS = Array.from({ length: TOTAL_COLUMNS }, (_, i) => {
  const flat = i % BLOCK_SIZE;
  const isSurvivor = flat % 4 === 0;
  return {
    id: i,
    color: COLOR_CYCLE[flat % COLOR_CYCLE.length],
    isSurvivor,
    // Survivors are always portrait — theirs is the card that expands into the
    // tall full-mode slot, where a landscape crop would sit stranded in the
    // middle of it. Everyone else is seeded by global index, not `flat`: colour
    // and survivor repeat every BLOCK_SIZE for the pattern, but the scroll loop
    // is the full TOTAL_COLUMNS, so aspects can vary across all of them without
    // the seam showing.
    aspects: Array.from({ length: BOXES_PER_COLUMN }, (_, box) =>
      !isSurvivor && hash01(i * BOXES_PER_COLUMN + box) < LANDSCAPE_SHARE
        ? LANDSCAPE_ASPECT
        : PORTRAIT_ASPECT,
    ),
    // Offset seed so the pick is uncorrelated with the aspect draw above —
    // sharing a seed would tie every portrait card to the same slice of the
    // catalogue.
    movies: Array.from({ length: BOXES_PER_COLUMN }, (_, box) =>
      Math.floor(
        hash01(0xc0ffee + i * BOXES_PER_COLUMN + box) * movieData.length,
      ),
    ),
  };
});

/**
 * The image a card shows, resolved from the same constants on both sides so the
 * DOM and WebGL never disagree about what belongs where.
 *
 * The aspect picks the crop: TMDB posters are 2:3, which is exactly
 * PORTRAIT_ASPECT, and backdrops are 16:9. Requesting the wrong one leaves
 * object-cover to carve a sliver out of the middle.
 */
export function getCardImage(
  column: (typeof COLUMNS)[number],
  boxIndex: number,
) {
  const movie = movieData[column.movies[boxIndex]];
  const path =
    column.aspects[boxIndex] < 1 ? movie.poster_path : movie.backdrop_path;

  return { url: `${IMAGE_BASE_URL}${path}`, title: movie.title };
}

function getSlotWidthVw(mode: Mode, isSurvivor: boolean) {
  if (mode === "grid") return BOX_VW + MARGIN_VW * 2;
  if (isSurvivor) return SURVIVOR_BOX_VW + SURVIVOR_MARGIN_VW * 2;

  return 0;
}

function getSlotLeftsVw(mode: Mode) {
  const lefts: number[] = [];
  let cursorVw = 0;
  for (const col of COLUMNS) {
    lefts.push(cursorVw);
    cursorVw += getSlotWidthVw(mode, col.isSurvivor);
  }
  return lefts;
}

function isAnimating() {
  return gsap.globalTimeline.getChildren(false, true, true).length > 0;
}

/**
 * Wraps a value into the range [0, length) — the always-positive cousin of `%`.
 * JS's `%` keeps the sign of the left operand: `-10 % 450` is `-10`, not `440`.
 */

function wrap(value: number, length: number) {
  if (length <= 0) return 0; // nothing measured yet; avoids 0 % 0 = NaN
  const remainder = value % length;
  return remainder < 0 ? remainder + length : remainder;
}

export const InfiniteRow = forwardRef<ScrollApi, IProps>((props, ref) => {
  const { mode, isVisible = true } = props;
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const initialLefts = React.useMemo(() => getSlotLeftsVw(mode), [mode]);

  const layoutRef = useRef<ILayout>({
    widths: [],
    slotLeft: [],
    total: 0,
  });
  const scrollRef = useRef({
    current: 0,
    target: 0,
    velocity: 0,
    smoothVelocity: 0,
  });
  const boxInfoRef = useRef<BoxInfo[]>([]);
  const rectsRef = useRef(
    new Float32Array(TOTAL_COLUMNS * BOXES_PER_COLUMN * 4),
  );
  // Each box's left edge relative to its own column's x. Constant while only
  // scroll is moving, which is what lets a frame be arithmetic instead of a
  // layout read.
  const boxOffsetXRef = useRef(
    new Float32Array(TOTAL_COLUMNS * BOXES_PER_COLUMN),
  );
  const columnXRef = useRef(new Float32Array(TOTAL_COLUMNS));
  const rectSyncRef = useRef(true);
  const nudgeTweenRef = useRef<gsap.core.Tween | null>(null);
  const wasAnimatingRef = useRef(false);

  const collectBoxInfo = useCallback(() => {
    const boxes: BoxInfo[] = [];

    columnRefs.current.forEach((column, columnIndex) => {
      if (!column) return;

      column.querySelectorAll<HTMLElement>("[data-box]").forEach((element) => {
        const child = element.firstElementChild as HTMLElement | null;
        const image = element.querySelector("img");
        boxes.push({
          flatIndex: boxes.length,
          columnIndex,
          boxIndex: Number(element.dataset.box),
          data: COLUMNS[columnIndex],
          element,
          child,
          image,
          src: image?.currentSrc || image?.src,
        });
      });
    });

    boxInfoRef.current = boxes;
    rectSyncRef.current = true;
  }, []);

  const measure = useCallback(() => {
    const screenWidth = window.innerWidth;
    const widths = COLUMNS.map(
      (col) => (getSlotWidthVw(mode, col.isSurvivor) / 100) * screenWidth,
    );
    const slotLeft: number[] = [];
    let cursorX = 0;
    widths.forEach((w, i) => {
      slotLeft[i] = cursorX;
      cursorX += w;
    });

    layoutRef.current = { widths, slotLeft, total: cursorX };
  }, [mode]);

  useEffect(() => {
    const onResize = () => {
      measure();
      collectBoxInfo();
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure, collectBoxInfo]);

  useImperativeHandle(ref, () => ({
    nudge: (viewportMultiplier, duration, ease) => {
      const delta = window.innerWidth * viewportMultiplier;

      // A superseding nudge drops whatever the last one had left to give.
      nudgeTweenRef.current?.kill();

      // Fresh carrier per nudge rather than a reused one: kill() is synchronous
      // but a shared object would still let a stale tween apply an increment
      // measured against counters the new nudge had already reset.
      const carrier = { value: 0, applied: 0 };

      nudgeTweenRef.current = gsap.to(carrier, {
        value: delta,
        duration,
        ease,
        onUpdate: () => {
          // Contribute the increment, never write the position. Tweening
          // `target` directly made GSAP the sole owner of it for the tween's
          // whole duration, silently discarding any wheel or drag input that
          // landed between frames.
          scrollRef.current.target += carrier.value - carrier.applied;
          carrier.applied = carrier.value;
        },
      });
    },
    addScroll: (pixels) => {
      scrollRef.current.target += pixels;
    },
    scroll: scrollRef.current,
    boxes: () => boxInfoRef.current,
    rects: rectsRef.current,
    refreshBoxes: collectBoxInfo,
  }));

  useEffect(() => {
    let raf: number;

    const tick = () => {
      const currentScroll = scrollRef.current;
      const previous = currentScroll.current;
      currentScroll.current +=
        (currentScroll.target - currentScroll.current) * EASE;
      // Measured off `current`, which is never wrapped — `wrap()` is applied to
      // a copy for positioning only. Reading the wrapped value here would spike
      // the velocity by `total` every time the row loops.
      currentScroll.velocity = currentScroll.current - previous;

      const { widths, slotLeft, total } = layoutRef.current;
      if (total > 0) {
        const scrollLeft = wrap(currentScroll.current, total);
        const screenWidthInPx = window.innerWidth;
        const buffer = screenWidthInPx * 0.5;
        const columnX = columnXRef.current;

        columnRefs.current.forEach((el, i) => {
          if (!el) return;
          let currentPosX = slotLeft[i] - scrollLeft;
          const w = widths[i];
          if (currentPosX < -w - buffer) currentPosX += total;
          else if (currentPosX > screenWidthInPx + buffer) currentPosX -= total;
          columnX[i] = currentPosX;
          el.style.transform = `translate3d(${currentPosX - slotLeft[i]}px, 0, 0)`;
        });

        const boxes = boxInfoRef.current;
        const rects = rectsRef.current;
        const offsetX = boxOffsetXRef.current;

        // The trailing `wasAnimating` buys one extra measured frame after the
        // last tween retires: GSAP writes a tween's final values on the same
        // frame it drops it from the timeline, so stopping the instant
        // `isAnimating()` flips would freeze the geometry one frame short of
        // where it settled.
        const animating = isAnimating();

        if (rectSyncRef.current || animating || wasAnimatingRef.current) {
          // The one path that touches layout. It runs after every transform
          // write above, so the browser flushes once for the whole batch
          // rather than once per element.
          for (let i = 0; i < boxes.length; i++) {
            const { left, top, width, height } = (
              boxes[i].child ?? boxes[i].element
            ).getBoundingClientRect();
            const offset = i * 4;
            rects[offset] = left;
            rects[offset + 1] = top;
            rects[offset + 2] = width;
            rects[offset + 3] = height;
            offsetX[i] = left - columnX[boxes[i].columnIndex];
          }
          rectSyncRef.current = false;
        } else {
          // Steady state: scroll only moves boxes horizontally, and by exactly
          // the amount already computed above. No layout read needed.
          for (let i = 0; i < boxes.length; i++) {
            rects[i * 4] = columnX[boxes[i].columnIndex] + offsetX[i];
          }
        }

        wasAnimatingRef.current = animating;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={cn(
        "fixed left-0 right-0 top-0 bottom-0 overflow-hidden",
        !isVisible && "opacity-0",
      )}
    >
      <div className="relative h-full">
        {COLUMNS.map((item, i) => (
          <Column
            key={item.id}
            ref={(el) => {
              columnRefs.current[i] = el;
            }}
            data={item}
            mode={mode}
            initialLeft={initialLefts[i]}
          />
        ))}
      </div>
    </div>
  );
});

InfiniteRow.displayName = "InfiniteRow";
