"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Transition,
  type Variants,
} from "motion/react";
import { posts, type Post } from "../posts";
import { AvatarStack, GradientImage } from "../page";

// The house split, from posts[2]: one curve for anything that travels, and the
// same curve's quieter sibling at half the duration for anything that only
// appears. Everything in the widget moves on MOVE so it lands on one beat.
const MOVE: Transition = { duration: 0.4 * 1, ease: [0.32, 0.72, 0, 1] };

// The blur-and-expand hand-off from the cheq auth modal (auth-wrapper.tsx).
// Outgoing content grows outward as it fades, incoming content settles up from
// just under full size, and both sides pass through a blur so the overlap never
// shows two legible layouts at once. Timings are cheq's; the exit is not. cheq
// grows the exit to 1.0897 to fit its CTA to the card, and there is no CTA here,
// so the exit is kept subtler than the entrance: the same 2% of travel, a 4px
// blur, and a shorter fade.
// Scale runs on a front-loaded ease-out; opacity and blur run on easeInOut so
// the cross-fade spreads across the window instead of popping. The incoming
// fade starts 35% into the outgoing one so they are never both at full strength.
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EXIT_SCALE = 1.02;
const ENTER_SCALE = 0.98;
const EXIT_DELAY = 0.05;
const ENTER_DELAY = 0.08;
const CROSSFADE_S = 0.24;
const CROSSFADE_EASE = "easeInOut" as const;
const EXIT_DURATION = 0.127;
const ENTER_DURATION = 0.109;
const BLUR = "blur(4px)";
// Entering blocks come in as small groups rather than one slab: each block
// passes its order as `custom` and waits this much longer than the one before.
const STAGGER = 0.04;

// Applied to the text blocks rather than the view wrapper: a filter on the
// wrapper would also blur the cover while it flies between sizes on layoutId.
const blurExpand: Variants = {
  enter: { opacity: 0, scale: ENTER_SCALE, filter: BLUR },
  open: (order: number = 0) => ({
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      scale: {
        duration: ENTER_DURATION,
        ease: EASE_OUT,
        delay: ENTER_DELAY + order * STAGGER,
      },
      opacity: {
        duration: CROSSFADE_S,
        ease: CROSSFADE_EASE,
        delay: EXIT_DELAY + CROSSFADE_S * 0.35 + order * STAGGER,
      },
      filter: {
        duration: CROSSFADE_S,
        ease: CROSSFADE_EASE,
        delay: EXIT_DELAY + CROSSFADE_S * 0.35 + order * STAGGER,
      },
    },
  }),
  collapsed: {
    opacity: 0,
    scale: EXIT_SCALE,
    filter: BLUR,
    transition: {
      scale: { duration: EXIT_DURATION, ease: EASE_OUT, delay: EXIT_DELAY },
      opacity: {
        duration: CROSSFADE_S * 0.75,
        ease: CROSSFADE_EASE,
        delay: EXIT_DELAY,
      },
      filter: {
        duration: CROSSFADE_S * 0.75,
        ease: CROSSFADE_EASE,
        delay: EXIT_DELAY,
      },
    },
  },
};

// Cover corners on an iOS-style continuous curve, via
// corner-shape: superellipse(2) — the same smoothing the blog cards use. A
// superellipse eases into the straight edge, so it needs a larger radius than
// a circular arc to read as equally soft. Set as a number in `style` so motion
// can scale-correct it while the cover flies between sizes on layoutId, and
// clipped on the same element with `isolate` so the drifting aura layers
// inside can't escape the rounded clip.
// 20px on the expanded cover, scaled down to 10px on the 36px tile (20px there
// would nearly round it into a circle); motion tweens between the two on
// layoutId.
const COVER_RADIUS = { sm: 10, lg: 20 };

// Concentric corners: the card's radius is the cover's radius plus the 12px
// (px-3) between them, so the two curves stay parallel — 22px collapsed, 32px
// expanded. Same superellipse as the cover, since concentricity only holds
// between curves of the same family. Animated alongside the height.
const CARD_INSET = 12;
const CARD_RADIUS = {
  sm: COVER_RADIUS.sm + CARD_INSET,
  lg: COVER_RADIUS.lg + CARD_INSET,
};

// Images get a 1px hairline drawn 1px inside their edge, so the cover holds its
// shape against the card even where its colours run light. Black at 8% here;
// white at 8% under .dark.
const COVER_OUTLINE =
  "outline outline-1 -outline-offset-1 outline-black/8 dark:outline-white/8";

// The title is one shared element across both views: identical styles in each,
// a layoutId, and layout="position" so it slides between spots at its own size
// instead of blurring out and back in. The only thing that changes is the room
// it has — 214px in the tile truncates it; 264px expanded shows it whole.
const TITLE_CLASS =
  "font-inter text-sm font-medium leading-5 tracking-[-0.0046em] text-[#121212]";

// The date rides along with the title as a second shared element: it sits
// directly under the title in both views, so it slides rather than blurs.
const DATE_CLASS =
  "flex gap-2 text-[13px] leading-4 font-medium tracking-[-0.0036em] text-black/48";

// posts.ts stores long-form dates ("September 1, 2026") for the article page;
// the widget shows the short month ("Sep 1, 2026").
const shortDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

type ISizeMapKey = "sm" | "lg";

// The card animates to its content's measured height rather than a fixed
// number, so it always closes on the same 16px it opens with (py-4) whatever
// the description's length. It can't animate to "auto": both states would be
// "auto", motion sees no change, and the card snaps while its contents spill
// out. A ResizeObserver on the content column supplies the real number;
// popLayout pulls the outgoing view out of flow, so the column measures only
// the incoming view.
const CARD_PADDING_Y = 16 * 2;
// Collapsed tile: 40px of title + date inside the 32px of padding. Used for
// the deck's layout until each card has measured itself.
const COLLAPSED_HEIGHT = 40 + CARD_PADDING_Y;

function useMeasuredHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setHeight(entry.borderBoxSize[0].blockSize),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, height] as const;
}

interface IWidgetCard {
  post: Post;
  expanded: boolean;
  // Sitting behind the front card in the stacked deck: the slab shows, its
  // content doesn't, and it's out of the tab order.
  concealed: boolean;
  label: string;
  onPress: () => void;
  // The deck owns the card's height: the card measures its content and
  // reports the height it needs, and the deck hands it back as `height` in the
  // same render that moves the cards below. If the card animated to its own
  // measurement, it would start a render ahead of its neighbours and grow into
  // them for the first frames of the curve.
  height: number | null;
  onHeight: (height: number) => void;
}

function WidgetCard({
  post,
  expanded,
  concealed,
  label,
  onPress,
  height,
  onHeight,
}: IWidgetCard) {
  const size: ISizeMapKey = expanded ? "lg" : "sm";
  const [contentRef, contentHeight] = useMeasuredHeight<HTMLDivElement>();
  const target = contentHeight === null ? null : contentHeight + CARD_PADDING_Y;

  useEffect(() => {
    if (target !== null) onHeight(target);
  }, [target, onHeight]);

  // Shared-element ids are per post, so several cards can run their
  // transitions at once without trading covers and titles.
  const id = (part: string) => `app_blog_widget_${post.id}_${part}`;

  return (
    <motion.div
      initial={false}
      animate={{
        height: height ?? "auto",
        borderRadius: CARD_RADIUS[size],
      }}
      // Same curve as the cover, title and date, so the card lands with
      // its contents instead of ahead of them.
      transition={MOVE}
      // overflow-hidden keeps the outgoing view inside the card while the
      // card resizes around it. layoutRoot measures the shared elements
      // against the card, not the page: without it, any transform on the card
      // or the deck around it (the press scale, the stack offsets) places the
      // outgoing copies of the title, date and cover in page coordinates
      // *inside* the card — a ghost offset by the card's own position.
      layoutRoot
      // Press feedback. The card is the trigger, so it answers the press.
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      className="group relative overflow-hidden w-72 bg-[#f6f6f6] hover:bg-[#f7f7f7] transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] [corner-shape:superellipse(2)] px-3 py-4 cursor-pointer outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212] shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.04),0_6px_12px_-6px_rgba(0,0,0,0.08)]"
      // A div rather than a <button>: the expanded view holds block
      // content (h4, paragraphs), which a button can't contain. So it
      // takes on the button contract by hand — focusable, announced,
      // and toggled by Enter and Space like a native one.
      role="button"
      tabIndex={concealed ? -1 : 0}
      aria-hidden={concealed || undefined}
      aria-expanded={expanded}
      aria-label={label}
      onClick={onPress}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onPress();
        }
      }}
    >
      <motion.div
        ref={contentRef}
        initial={false}
        animate={{ opacity: concealed ? 0 : 1 }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      >
        {/* initial={false}: the tile is already there on load, not arriving. */}
        <AnimatePresence initial={false} mode="popLayout">
          {size === "sm" && (
            <motion.div
              key="sm_view"
              initial="enter"
              animate="open"
              exit="collapsed"
              className="flex items-center gap-4"
            >
              <motion.div
                layout="preserve-aspect"
                layoutId={id("image")}
                className={`w-9 h-9 shrink-0 bg-[oklch(0.85_0.004_240)] relative z-2 overflow-hidden isolate [corner-shape:superellipse(2)] ${COVER_OUTLINE}`}
                style={{ borderRadius: COVER_RADIUS.sm }}
                transition={MOVE}
              >
                <GradientImage src={post.cover} height={36} width={36} />
              </motion.div>
              {/* min-w-0 lets the flex child shrink below its text width so
                  `truncate` has something to clip against. Plain div, no
                  variants: the title and date are shared elements that
                  slide, so nothing in this column blurs. */}
              <div className="flex min-w-0 flex-col gap-1">
                <motion.p
                  layout="position"
                  layoutId={id("title")}
                  transition={MOVE}
                  className={`truncate ${TITLE_CLASS}`}
                  title={post.title}
                >
                  {post.title}
                </motion.p>

                <motion.p
                  layout="position"
                  layoutId={id("date")}
                  transition={MOVE}
                  className={DATE_CLASS}
                >
                  <span>{shortDate(post.date)}</span>
                  <span aria-hidden className="scale-200">
                    ·
                  </span>
                  <span>{post.category}</span>
                </motion.p>
              </div>
            </motion.div>
          )}

          {size === "lg" && (
            <motion.div
              key="lg_view"
              initial="enter"
              animate="open"
              exit="collapsed"
              className="w-full flex flex-col gap-4"
            >
              {/* Title, then date 8px under it, then body 12px under that. */}
              <div className="w-full flex flex-col">
                <motion.h4
                  layout="position"
                  layoutId={id("title")}
                  transition={MOVE}
                  className={`truncate ${TITLE_CLASS}`}
                  title={post.title}
                >
                  {post.title}
                </motion.h4>

                <motion.p
                  layout="position"
                  layoutId={id("date")}
                  transition={MOVE}
                  className={`mt-2 ${DATE_CLASS}`}
                >
                  <span>{shortDate(post.date)}</span>
                  <span aria-hidden className="scale-200">
                    ·
                  </span>
                  <span>{post.category}</span>
                </motion.p>

                <motion.p
                  variants={blurExpand}
                  custom={0}
                  className="mt-3 origin-top-left text-pretty text-sm font-medium leading-5 tracking-[-0.0046em] text-black/50"
                >
                  {post.description}
                </motion.p>
              </div>

              <motion.div
                layout="preserve-aspect"
                layoutId={id("image")}
                className={`w-66 h-66 bg-[oklch(0.85_0.004_240)] aspect-square relative z-2 overflow-hidden isolate [corner-shape:superellipse(2)] ${COVER_OUTLINE}`}
                style={{ borderRadius: COVER_RADIUS.lg }}
                transition={MOVE}
              >
                <div className="w-66 h-66 rounded-[inherit] [corner-shape:superellipse(2)] overflow-hidden flex relative">
                  <GradientImage
                    src={post.cover}
                    height={264}
                    width={264}
                    className="w-full h-full flex-1"
                  />
                </div>
              </motion.div>

              {/* Byline: 20px avatars centred on the names, 4px apart. */}
              <motion.div
                variants={blurExpand}
                custom={1}
                className="flex origin-top-left items-center gap-1"
              >
                <AvatarStack
                  authors={post.authors}
                  size={20}
                  ringClassName="ring-[#f6f6f6] group-hover:ring-[#f7f7f7] transition-[box-shadow] duration-150"
                />
                <p className="font-inter text-xs font-medium leading-4 tracking-[-0.0046em] text-[#121212]/44">
                  {post.authors.map((author) => author.name).join(", ")}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// The deck. Stacked, the cards pile up behind the front one, iOS-notification
// style: each one further back sits PEEK px lower and a little narrower, so
// only its bottom edge shows below the card in front. The first press fans
// them out into a column GAP px apart; after that, pressing a card opens it
// and closes whichever was open, so only one is ever expanded. "Show less"
// (or Escape) closes it and restacks.
//
// Every offset is computed from the heights the cards report, and animates on
// MOVE — the same curve and duration the cards resize on — so when a card
// opens, the ones below it move by exactly the height it gains, frame for
// frame, and the gaps never open or close mid-transition.
const PEEK = 10;
const PEEK_SCALE = 0.05;
const VISIBLE_BEHIND = 2;
const GAP = 8;

export default function Page() {
  const deck = posts;
  const [fanned, setFanned] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [heights, setHeights] = useState<Record<number, number>>({});
  const heightOf = (id: number) => heights[id] ?? COLLAPSED_HEIGHT;

  // One stable callback per card, so a card's height effect doesn't re-run
  // on every deck render.
  const reporters = useRef<Record<number, (height: number) => void>>({});
  const reportHeight = (id: number) =>
    (reporters.current[id] ??= (height: number) =>
      setHeights((prev) =>
        prev[id] === height ? prev : { ...prev, [id]: height },
      ));

  const restack = () => {
    setOpenId(null);
    setFanned(false);
  };

  const press = (id: number) => {
    if (!fanned) {
      setFanned(true);
      return;
    }
    setOpenId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (!fanned) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (openId !== null) setOpenId(null);
      else setFanned(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fanned, openId]);

  // Where each card sits, and how tall the deck is, in the current state.
  // Fanned, each card's top is the sum of the heights (plus gaps) above it.
  const topOf = (i: number) =>
    deck.slice(0, i).reduce((sum, post) => sum + heightOf(post.id) + GAP, 0);
  const placements = deck.map((_, i) => {
    if (fanned) return { y: topOf(i), scale: 1, opacity: 1 };
    const depth = Math.min(i, VISIBLE_BEHIND);
    return {
      y: depth * PEEK,
      scale: 1 - depth * PEEK_SCALE,
      opacity: i > VISIBLE_BEHIND ? 0 : 1,
    };
  });
  const deckHeight = fanned
    ? topOf(deck.length) - GAP
    : heightOf(deck[0].id) + Math.min(deck.length - 1, VISIBLE_BEHIND) * PEEK;

  return (
    // reducedMotion="user": with the OS setting on, motion drops transform and
    // layout animations (scale, the shared-element slides) and keeps the fades.
    <MotionConfig reducedMotion="user">
      <div className="w-full min-h-screen flex justify-center px-4 pt-32 pb-32">
        <div className="w-72">
          {/* Always takes its 28px, so the deck doesn't jump when it shows. */}
          <div className="h-7 mb-3 flex justify-end">
            <AnimatePresence initial={false}>
              {fanned && (
                <motion.button
                  key="show-less"
                  type="button"
                  onClick={restack}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                  className="h-7 px-3 rounded-full bg-[#f6f6f6] hover:bg-[#efefef] active:scale-[0.97] transition-[scale,background-color] duration-200 ease-out text-[13px] font-medium leading-4 tracking-[-0.0036em] text-black/60 outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]"
                >
                  Show less
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            className="relative"
            initial={false}
            animate={{ height: deckHeight }}
            transition={MOVE}
          >
            {deck.map((post, i) => (
              <motion.div
                key={post.id}
                className="absolute inset-x-0 top-0"
                // Scaled from the bottom edge, so a card further back shrinks
                // toward the strip of it that peeks out.
                style={{ zIndex: deck.length - i, transformOrigin: "50% 100%" }}
                initial={false}
                animate={placements[i]}
                transition={MOVE}
              >
                <WidgetCard
                  post={post}
                  expanded={openId === post.id}
                  concealed={!fanned && i > 0}
                  label={
                    !fanned
                      ? `Show all ${deck.length} posts`
                      : openId === post.id
                        ? `Collapse ${post.title}`
                        : `Expand ${post.title}`
                  }
                  onPress={() => press(post.id)}
                  height={heights[post.id] ?? null}
                  onHeight={reportHeight(post.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
