"use client";
import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { CaretLeft } from "@/components/icons";
import { posts, type Block, type Figure, type Post } from "./posts";

interface IReveal {
  delayIndex?: number;
  className?: string;
  children: React.ReactNode;
}

// Shared entrance for every block in the article. The image carries the continuity
// from the card via layoutId; everything else fades up behind it on a short stagger.
function Reveal({ delayIndex = 0, className, children }: IReveal) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.3,
          delay: delayIndex * 0.06,
          ease: [0.32, 0.72, 0, 1],
        },
      }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// The artwork is a still gradient, so every frame renders it twice — a base copy
// and a slower echo that blends over it. The two drifting against each other is
// what makes the gradient look alive. Reduced motion drops the echo entirely.
function GradientImage({
  src,
  width,
  height,
  priority,
}: {
  src: string;
  width: number;
  height: number;
  priority?: boolean;
}) {
  return (
    <>
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        priority={priority}
        className="aura-base h-full w-full object-cover"
      />
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        aria-hidden
        className="aura-echo absolute inset-0 h-full w-full object-cover"
      />
    </>
  );
}

interface ICard {
  post: Post;
  onClick?: () => void;
  delay?: number;
}

function GridItem({ post, onClick, delay = 0 }: ICard) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.1, delay } }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      {/* With the CTA gone the whole card is the target, so it's a real button
          rather than a div with a click handler. */}
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full cursor-pointer items-start gap-4 text-left"
      >
        <motion.div
          layoutId={`app_image_${post.id}`}
          className="relative z-3 h-[176px] w-[176px] shrink-0 overflow-hidden rounded-3xl [corner-shape:superellipse(2)] bg-grey-component opacity-100 shadow-[inset_0_0_0_1px_var(--stroke-hairline)] transition-opacity duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover:opacity-85"
        >
          <GradientImage src={post.cover} width={176} height={176} />
        </motion.div>

        {/* Height-matched to the thumbnail: 2px inset top and bottom, so the text
            optically aligns with the image edges rather than overhanging them. */}
        <span className="my-[2px] flex h-[172px] min-w-0 flex-col justify-between">
          <span className="text-[13px] leading-[16px] font-medium tracking-normal text-[color(display-p3_0.517647_0.509804_0.505882)]">
            {post.date} · {post.category}
          </span>

          <span className="flex min-w-0 flex-col gap-1.5">
            <span className="line-clamp-2 text-[16px] leading-[22px] font-[560] tracking-[-0.4px] text-pretty text-[#121212]">
              {post.title}
            </span>
            <span className="line-clamp-2 text-[13px] leading-[18px] font-medium tracking-normal text-pretty text-grey-solid">
              {post.intro[0]}
            </span>
          </span>
        </span>
      </button>
    </motion.div>
  );
}

function RowItem({ post, onClick, delay = 0 }: ICard) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2, delay } }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-50 w-full shrink-0"
    >
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full cursor-pointer flex-col gap-4 text-left"
      >
        <motion.div
          layoutId={`app_image_${post.id}`}
          className="relative h-40 w-full overflow-hidden rounded-3xl [corner-shape:superellipse(2)] bg-grey-component opacity-100 shadow-[inset_0_0_0_1px_var(--stroke-hairline)] transition-opacity duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover:opacity-85"
        >
          <GradientImage src={post.cover} width={200} height={160} />
        </motion.div>

        <span className="flex flex-col px-2">
          <span className="text-[13px] leading-[16px] font-medium tracking-normal text-grey-solid">
            {post.category}
          </span>
          <span className="text-[15px] leading-[22px] font-medium tracking-[-0.4px] text-pretty">
            {post.title}
          </span>
        </span>
      </button>
    </motion.div>
  );
}

// Media matches the text measure, so every edge in the article lines up.
function Breakout({ children }: { children: React.ReactNode }) {
  return <div className="w-full">{children}</div>;
}

const MEDIA_FRAME =
  "relative w-full overflow-hidden rounded-2xl bg-grey-component shadow-[inset_0_0_0_1px_var(--stroke-hairline)] [corner-shape:superellipse(2)]";

function WideFigure({ figure }: { figure: Figure }) {
  return (
    <Breakout>
      <figure>
        <div className={`${MEDIA_FRAME} h-[342px]`}>
          <GradientImage src={figure.src} width={560} height={342} />
        </div>
        <figcaption className="mt-3 text-[12px] leading-[20px] font-medium tracking-[-0.0046em] text-black/60">
          {figure.caption}
        </figcaption>
      </figure>
    </Breakout>
  );
}

const SPEEDS = ["0.25×", "0.5×", "0.75×", "1×", "1.25×", "1.5×", "1.75×", "2×"];

// Static stand-in for the post's inline video players — poster, scrubber and the
// playback-rate row, so the block occupies the space a real player would.
function VideoPlayer({ poster, duration }: { poster: string; duration: string }) {
  return (
    <Breakout>
      <div className={`${MEDIA_FRAME} relative h-[378px]`}>
        <GradientImage src={poster} width={560} height={378} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-10">
          <div className="h-[3px] w-full rounded-full bg-white/25">
            <div className="h-full w-0 rounded-full bg-white" />
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] leading-[16px] tracking-normal text-white/70 tabular-nums">
            <span className="text-white">00:00</span>
            <span>{duration}</span>
            <span className="ml-auto flex items-center gap-2">
              {SPEEDS.map((speed) => (
                <span key={speed} className={speed === "1×" ? "text-white" : undefined}>
                  {speed}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </Breakout>
  );
}

function Scroller({ figures }: { figures: Figure[] }) {
  return (
    <div
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-x-auto scrollbar-none"
      style={{ padding: "0 max(24px, calc(50% - 280px))" }}
    >
      <div className="flex gap-4">
        {figures.map((figure) => (
          <figure key={figure.src + figure.caption} className="w-[420px] shrink-0">
            <div className={`${MEDIA_FRAME} h-[252px]`}>
              <GradientImage src={figure.src} width={420} height={252} />
            </div>
            <figcaption className="mt-3 text-[12px] leading-[20px] font-medium tracking-[-0.0046em] text-black/60">
              {figure.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  if (block.type === "p") {
    return (
      <p className="text-[14px] leading-[20px] font-medium tracking-[-0.0046em] text-pretty">
        {block.text}
      </p>
    );
  }
  if (block.type === "figure") {
    return <WideFigure figure={block.figure} />;
  }
  if (block.type === "scroller") {
    return <Scroller figures={block.figures} />;
  }
  return <VideoPlayer poster={block.poster} duration={block.duration} />;
}

// Overlapping monogram stack for the byline. Each avatar carries a ring in the page
// background so the circles cut into one another instead of merging.
function AvatarStack({ authors }: { authors: Post["authors"] }) {
  return (
    <span className="flex -space-x-2">
      {authors.map((author) => (
        <span
          key={author.name}
          className="relative h-7 w-7 overflow-hidden rounded-full bg-grey-component ring-2 ring-background"
        >
          <Image
            src={author.avatar}
            alt=""
            width={28}
            height={28}
            className="h-full w-full object-cover"
          />
        </span>
      ))}
    </span>
  );
}

function AuthorCard({
  author,
}: {
  author: Post["authors"][number];
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-grey-component shadow-[inset_0_0_0_1px_var(--stroke-hairline)]">
        <Image
          src={author.avatar}
          alt=""
          width={32}
          height={32}
          className="h-full w-full object-cover"
        />
      </span>
      <span className="flex flex-col">
        <span className="font-medium">{author.name}</span>
        <span className="text-[14px] leading-[20px] font-medium tracking-[-0.0046em] text-grey-solid">
          {author.role}
        </span>
      </span>
    </div>
  );
}

function Article({ post, onBack }: { post: Post; onBack: () => void }) {
  const column = "mx-auto w-full max-w-[560px] px-6";

  return (
    <div className="font-inter w-full pb-24 pt-8 text-[14px] leading-[20px] font-normal tracking-[-0.09px] text-[#474645]">
      <div className={column}>
        {/* Breadcrumb */}
        <Reveal delayIndex={0} className="flex items-center justify-between">
          {/* The caret is parked at the left edge and only slides in on hover; the
              label steps aside by exactly the caret's width plus its gap, so the
              control has no width change and nothing around it reflows. */}
          <button
            type="button"
            onClick={onBack}
            className="group relative flex cursor-pointer items-center text-[14px] leading-[20px] font-medium tracking-[-0.0046em] text-grey-solid transition-colors duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:text-[#121212]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 flex -translate-x-1 items-center opacity-0 transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none"
            >
              <CaretLeft />
            </span>
            <span className="transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-5 motion-reduce:transition-none">
              Back
            </span>
          </button>
          <span className="text-[14px] leading-[20px] font-medium tracking-[-0.0046em] text-grey-solid">
            Copy link
          </span>
        </Reveal>

        {/* Meta block */}
        <Reveal delayIndex={1} className="mt-6">
          <h1 className="text-[19px] leading-[1.2] font-semibold tracking-[-0.008em] text-balance text-[#121212]">
            {post.title}
          </h1>
        </Reveal>

        <Reveal
          delayIndex={2}
          className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-stroke-hairline py-4"
        >
          <span className="flex items-center gap-2.5">
            <AvatarStack authors={post.authors} />
            <span className="font-medium">
              {post.authors.map((author) => author.name).join(", ")}
            </span>
          </span>
          <span className="text-[13px] leading-[16px] font-medium tracking-normal text-[color(display-p3_0.517647_0.509804_0.505882)]">
            {post.date} · {post.category}
          </span>
        </Reveal>
      </div>

      {/* Hero — the element that morphs out of the card */}
      <div className="mt-9 px-6">
        <motion.div
          layoutId={`app_image_${post.id}`}
          className="relative z-3 mx-auto h-[378px] w-full max-w-[560px] overflow-hidden rounded-3xl [corner-shape:superellipse(2)] bg-grey-component shadow-[inset_0_0_0_1px_var(--stroke-hairline)]"
        >
          <GradientImage src={post.cover} width={560} height={378} priority />
        </motion.div>
      </div>

      <div className={column}>
        {/* Intro */}
        <Reveal
          delayIndex={3}
          className="mt-9 space-y-4 text-[14px] leading-[20px] font-medium tracking-[-0.0046em] text-pretty"
        >
          {post.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Reveal>

      </div>

      {/* Sections */}
      {post.sections.map((section, index) => (
        <Reveal key={section.id} delayIndex={5 + index} className="mt-9">
          <section id={section.id} className="scroll-mt-8">
            <div className={column}>
              <h2 className="text-[14px] leading-[20px] font-medium tracking-[-0.0046em] text-[#121212]">
                {section.heading}
              </h2>
              <div className="mt-6 space-y-6">
                {section.blocks.map((block, blockIndex) => (
                  <BlockView key={blockIndex} block={block} />
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      ))}

      {/* Author cards */}
      <div className={column}>
        <Reveal
          delayIndex={5 + post.sections.length}
          className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-stroke-hairline pt-6"
        >
          {post.authors.map((author) => (
            <AuthorCard key={author.name} author={author} />
          ))}
        </Reveal>
      </div>

      {/* Closing CTA */}
      <div className={column}>
        <Reveal
          delayIndex={6 + post.sections.length}
          className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-grey-component px-6 py-6 [corner-shape:superellipse(2)]"
        >
          <h2 className="text-[14px] leading-[20px] font-medium tracking-[-0.0046em] text-balance text-[#121212]">
            {post.cta.heading}
          </h2>
          <div className="flex items-center gap-2">
            <span className="rounded-3xl bg-foreground px-3 py-1.5 text-[14px] leading-[20px] font-medium tracking-[-0.0046em] text-background">
              {post.cta.primary}
            </span>
            <span className="rounded-3xl px-3 py-1.5 text-[14px] leading-[20px] font-medium tracking-[-0.0046em] text-grey-body-text shadow-[inset_0_0_0_1px_var(--stroke-hairline)]">
              {post.cta.secondary}
            </span>
          </div>
        </Reveal>

        <Reveal delayIndex={7 + post.sections.length} className="mt-12">
          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer text-[14px] leading-[20px] font-medium tracking-[-0.0046em] text-grey-solid transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:text-foreground"
          >
            ← All posts
          </button>
        </Reveal>
      </div>
    </div>
  );
}

export default function Page() {
  const [mode] = useState("grid");
  const [selected, setSelected] = useState<Post | null>(null);
  const rowContainerRef = useRef<HTMLDivElement | null>(null);
  const rowScrollLeftRef = useRef(0);
  const [listDelay, setListDelay] = useState(0);

  return (
    <div className="font-inter flex min-h-screen w-full flex-col overflow-x-hidden text-[oklch(0.24_0.03_115)]">
      <AnimatePresence mode="popLayout">
        {selected === null && mode === "grid" && (
          <div
            key="grid_view"
            className="flex min-h-screen w-full items-center justify-center px-6"
          >
            <div className="grid w-full max-w-[800px] grid-cols-2 gap-x-8 gap-y-10">
              {posts.map((post) => (
                <GridItem
                  key={post.id}
                  post={post}
                  delay={listDelay}
                  onClick={() => setSelected(post)}
                />
              ))}
            </div>
          </div>
        )}

        {selected === null && mode === "row" && (
          <div
            key="row_view"
            className="flex min-h-screen w-full items-center justify-center"
          >
            <div
              ref={rowContainerRef}
              className="flex w-full max-w-125 gap-4 overflow-x-scroll scrollbar-none"
            >
              {posts.map((post) => (
                <RowItem
                  key={post.id}
                  post={post}
                  delay={listDelay}
                  onClick={() => {
                    if (rowContainerRef.current) {
                      rowScrollLeftRef.current = rowContainerRef.current.scrollLeft;
                    }
                    setSelected(post);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {selected !== null && (
          <Article
            key="article"
            post={selected}
            onBack={() => {
              setListDelay(0.1);
              setSelected(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
