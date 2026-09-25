"use client";
import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { CaretLeft } from "@/components/icons";
import { posts, type Block, type Figure, type Post } from "./posts";
import { cn } from "@/lib/utils";

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
export function GradientImage({
  src,
  width,
  height,
  priority,
  className = "",
}: {
  src: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <>
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        priority={priority}
        className={cn("aura-base h-full w-full object-cover", className)}
      />
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        aria-hidden
        className={cn(
          "aura-echo absolute inset-0 h-full w-full object-cover",
          className,
        )}
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
        <span className="my-[2px] flex h-[172px] min-w-0 flex-col gap-4 justify-between">
          <span className="text-[11px] leading-[16px] font-medium tracking-normal text-[color(display-p3_0.517647_0.509804_0.505882)]">
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
        {figure.caption && (
          <figcaption className="mt-3 text-[12px] leading-[20px] font-medium tracking-[-0.0046em] text-black/60">
            {figure.caption}
          </figcaption>
        )}
      </figure>
    </Breakout>
  );
}

function Scroller({ figures }: { figures: Figure[] }) {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-x-auto scrollbar-none">
      {/* The inline padding lives on the track, not the scroll container, so it
          resolves against the full viewport width. w-max is what makes the
          trailing side count: without it the track is pinned to the container's
          width and its right padding sits behind the overflowing cards instead
          of after them. Half the text measure (560 less its px-6) lines the
          first card up with the column above it. */}
      <div
        className="flex w-max gap-4"
        style={{ paddingInline: "max(24px, calc(50% - 256px))" }}
      >
        {figures.map((figure, index) => (
          <figure key={`${figure.src}-${index}`} className="w-[420px] shrink-0">
            <div className={`${MEDIA_FRAME} h-[252px]`}>
              <GradientImage src={figure.src} width={420} height={252} />
            </div>
            {figure.caption && (
              <figcaption className="mt-3 text-[12px] leading-[20px] font-medium tracking-[-0.0046em] text-black/60">
                {figure.caption}
              </figcaption>
            )}
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
  return <Scroller figures={block.figures} />;
}

// Overlapping monogram stack for the byline. Each avatar carries a ring in the page
// background so the circles cut into one another instead of merging.
export function AvatarStack({
  authors,
  size = 28,
  ringClassName = "ring-background",
}: {
  authors: Post["authors"];
  size?: number;
  /** Ring colour; match it to whatever surface the stack sits on. */
  ringClassName?: string;
}) {
  return (
    <span className="flex">
      {authors.map((author, i) => (
        <span
          key={author.name}
          className={cn(
            "relative overflow-hidden rounded-full bg-grey-component ring-2",
            ringClassName,
          )}
          // Overlap scales with the avatar (8px at the default 28px) so a
          // smaller stack keeps the same proportion of each face visible.
          style={{
            width: size,
            height: size,
            marginLeft: i === 0 ? 0 : -Math.round((size * 2) / 7),
          }}
        >
          <Image
            src={author.avatar}
            alt=""
            width={size}
            height={size}
            className="h-full w-full object-cover"
          />
        </span>
      ))}
    </span>
  );
}

function AuthorCard({ author }: { author: Post["authors"][number] }) {
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

function Article({
  post,
  onBack,
  ref,
}: {
  post: Post;
  onBack: () => void;
  ref?: React.Ref<HTMLDivElement>;
}) {
  const column = "mx-auto w-full max-w-[560px] px-6";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2 } }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="font-inter w-full pb-24 pt-8 text-[14px] leading-[20px] font-normal tracking-[-0.09px] text-[#474645]"
    >
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
    </motion.div>
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
            <div className="grid w-full max-w-200 grid-cols-2 gap-x-8 gap-y-10">
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

        {/* {selected === null && mode === "row" && (
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
                      rowScrollLeftRef.current =
                        rowContainerRef.current.scrollLeft;
                    }
                    setSelected(post);
                  }}
                />
              ))}
            </div>
          </div>
        )} */}

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
