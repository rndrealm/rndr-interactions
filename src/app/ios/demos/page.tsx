import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CopyCode } from "../blog/copy-code";
import { SpringDemo } from "../spring/spring-demo";
import { DragDemo } from "../drag/drag-demo";
import { ScrollDemo } from "../scroll/scroll-demo";
import { FlickDemo } from "../flick/flick-demo";
import { LockDemo } from "../lock/lock-demo";
import { LockExampleDemo } from "../lock-example/lock-example-demo";
import { MobileSheetDemo } from "../mobile-sheet/mobile-sheet-demo";
import { ScrubberDemo } from "../scrubber/scrubber-demo";
import { DragTransitionDemo } from "../drag-transition/drag-transition-demo";
import { SwipeCloseDemo } from "../swipe-close/swipe-close-demo";
import { AppSwitcherDemo } from "../app-switcher/app-switcher-demo";

export const metadata: Metadata = {
  title: "Fluid Interactions: Demos",
  description:
    "Interactions built with the Fluid Interactions skill, with a note on how to play with each one.",
};

const SKILL_NAME = "rndrealm/fluid-interactions";

const TEXT =
  "font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]";

// Every demo, in the order the article introduces them, with one or two
// sentences on what to try
const DEMOS = [
  {
    href: "/ios/spring",
    title: "Springs",
    howTo:
      "Drag the sliders to change the curve as you go, and tap the track to feel it.",
    demo: <SpringDemo embedded />,
  },
  {
    href: "/ios/drag",
    title: "Rubber banding",
    howTo:
      "Drag the box past any edge and keep pulling: it slows the further you go, then springs back when you let go. Move the slider to change the resistance.",
    demo: <DragDemo embedded />,
  },
  {
    href: "/ios/scroll",
    title: "Momentum",
    howTo:
      "Drag the cards sideways and let go: they coast to a stop, and bounce if they hit an end. Switch to Fast to stop sooner, or Paging to snap to a whole card.",
    demo: <ScrollDemo embedded />,
  },
  {
    href: "/ios/flick",
    title: "Projection",
    howTo:
      "Press the button in the corner to pop the player out, then flick it toward any corner of the screen. A short, quick flick is enough to send it across. With projection off, it goes to the corner nearest where you let go, so you have to drag it most of the way. With handoff off, it stops dead when you let go before heading to the corner.",
    demo: <FlickDemo embedded />,
  },
  {
    href: "/ios/lock",
    title: "Direction lock",
    howTo:
      "Drag the box mostly sideways: after 10px it slides only horizontally, however much your finger drifts. A true diagonal stays free. With Direction lock off, every drag wanders with your finger, so a sideways drag drifts up and down too.",
    demo: <LockDemo embedded />,
  },
  {
    href: "/ios/lock-example",
    title: "A real list",
    howTo:
      "Swipe a row left or right to reveal its actions, and keep pulling to stretch them. Each side has its own actions, so one row can offer different things depending on which way you swipe. Drag up and down to scroll. A slightly diagonal drag picks the row or the list, never both.",
    demo: <LockExampleDemo embedded />,
  },
  {
    href: "/ios/mobile-sheet",
    title: "Sheets",
    howTo:
      "Drag the handle at the top of the sheet. A quick flick up from Closed skips Half and lands on Full; a slow drag stops at the nearest position. At Full, keep pulling up to feel the rubber band, or tap the dimmed map to drop it to Half.",
    demo: <MobileSheetDemo embedded />,
  },
  {
    href: "/ios/scrubber",
    title: "Scrubbing",
    howTo:
      "Drag along the bar, then move your finger down away from it while you hold. With Fine scrubbing on, scrubbing slows from 1× to 0.5×, 0.25× and 0.125× the further you go, for precise control. With it off, it scrubs at full speed wherever your finger is.",
    demo: <ScrubberDemo embedded />,
  },
  {
    href: "/ios/drag-transition",
    title: "Morphing",
    howTo:
      "Tap a city to open its card. Drag it down and let go to put it back, or flick it. Drag up or sideways and it resists, since that does nothing. Tapping the card closes it too.",
    demo: <DragTransitionDemo embedded />,
  },
  {
    href: "/ios/swipe-close",
    title: "Swipe back",
    howTo:
      "Tap General, then About, to go two pages deep. Drag from the very left edge to go back: let go before halfway and it stays, flick and it goes. Grab a page mid-slide to catch it.",
    demo: <SwipeCloseDemo embedded />,
  },
  {
    href: "/ios/app-switcher",
    title: "The app switcher",
    howTo:
      "Tap an app to open it, then drag the bar at the bottom up. Flick to go home; drag slowly and pause to open the switcher. With a few apps open, swipe sideways along the bar to jump between them.",
    demo: <AppSwitcherDemo embedded />,
  },
];

// A hairline rule with the demo's title sitting on it. The label's background
// matches the page so it cuts the line.
function SectionHeading(props: { children: React.ReactNode }) {
  return (
    <div className="relative w-full pt-16 pb-6">
      <div className="h-px bg-[oklch(0.961_0_0)]" />
      <h2 className="absolute left-0 -translate-y-1/2 bg-white pr-2 font-geist text-[13px] leading-none font-normal text-[oklch(0.649_0_0)]">
        {props.children}
      </h2>
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-dvh w-full bg-white">
      {/* Fixed beside the page on wide screens, above it on narrow ones */}
      <aside className="px-6 pt-8 min-[1080px]:fixed min-[1080px]:top-20 min-[1080px]:left-20 min-[1080px]:p-0">
        <Link
          href="/ios"
          className="flex w-fit items-center gap-1 py-1 font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.649_0_0)] outline-none transition-colors hover:text-[oklch(0.375_0_0)] focus-visible:text-[oklch(0.375_0_0)]"
        >
          <ChevronLeft size={16} aria-hidden />
          Index
        </Link>
      </aside>

      <main className="mx-auto max-w-[36.375rem] px-6 pt-8 pb-24 md:px-4 md:pt-20">
        <p className={TEXT}>
          Fluid Interactions is a skill that helps your agent build interfaces
          that feel physical: drags that follow your finger, flicks that keep
          their momentum, sheets that land where you meant, and animations you
          can catch mid-flight. Agents can already wire up a drag handler, but
          the result usually feels off. It jumps when you grab it, stops dead
          when you let go, or ignores you until it finishes. This skill is the
          set of small physics and gesture decisions that close that gap.
        </p>

        <SectionHeading>Getting started</SectionHeading>
        <CopyCode code={`npx skills add ${SKILL_NAME}`} />
        <p className={`${TEXT} pt-4`}>
          That adds the skill to your agent. Then ask for one interaction at a
          time: a sheet that snaps, a card you can flick away, a scrubber you
          can slow down.
        </p>

        {DEMOS.map((item) => (
          <section key={item.href} className="flex flex-col">
            <SectionHeading>{item.title}</SectionHeading>
            <p className={TEXT}>{item.howTo}</p>
            <figure className="mt-4">
              {item.demo}
              <figcaption className="text-center font-geist text-xs leading-normal text-[oklch(0.649_0_0)]">
                <Link
                  href={item.href}
                  className="outline-none transition-colors hover:text-[oklch(0.375_0_0)] focus-visible:text-[oklch(0.375_0_0)]"
                >
                  Open on its own →
                </Link>
              </figcaption>
            </figure>
          </section>
        ))}
      </main>
    </div>
  );
}
