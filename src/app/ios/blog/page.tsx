import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CopyCode } from "./copy-code";
import { TableOfContents } from "./table-of-contents";
import { SpringDemo } from "../spring/spring-demo";
import { InterruptibleDemo } from "../interruptible/interruptible-demo";
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
  title: "Fluid Interactions",
  description:
    "A skill that helps your agent build interfaces that feel physical, and a deep dive into the twelve interactions it was built from.",
};

const SKILL_NAME = "rndrealm/fluid-interactions";

const SECTIONS = [
  { id: "getting-started", label: "Getting started" },
  { id: "springs", label: "Springs" },
  { id: "interrupting", label: "Interrupting" },
  { id: "rubber-banding", label: "Rubber banding" },
  { id: "momentum", label: "Momentum" },
  { id: "projection", label: "Projection" },
  { id: "direction-lock", label: "Direction lock" },
  { id: "a-real-list", label: "A real list" },
  { id: "sheets", label: "Sheets" },
  { id: "scrubbing", label: "Scrubbing" },
  { id: "morphing", label: "Morphing" },
  { id: "swipe-back", label: "Swipe back" },
  { id: "the-app-switcher", label: "The app switcher" },
  { id: "reduced-motion", label: "Reduced motion" },
  { id: "what-broke", label: "What broke along the way" },
];

const TEXT =
  "font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]";

// A hairline rule with the section title sitting on it. The label's
// background matches the page so it cuts the line.
function SectionHeading(props: { id: string; children: React.ReactNode }) {
  const { id, children } = props;
  return (
    <div className="relative w-full pt-16 pb-6">
      <div className="h-px bg-[oklch(0.961_0_0)]" />
      <h2
        id={id}
        className="absolute left-0 -translate-y-1/2 scroll-mt-20 bg-white pr-2 font-geist text-[13px] leading-none font-normal text-[oklch(0.649_0_0)]"
      >
        {children}
      </h2>
    </div>
  );
}

function P(props: { children: React.ReactNode }) {
  return <p className={`${TEXT} pt-4 first:pt-0`}>{props.children}</p>;
}

// Inline code: a function, constant or value from the source. The padding
// and tint keep it from running into the words around it: a plain space in
// the body font is too narrow next to monospace.
function C(props: { children: React.ReactNode }) {
  return (
    <code className="rounded-[4px] bg-[oklch(0.982_0_0)] px-1 py-px font-mono text-[13px] text-[rgb(3_47_98)] [box-decoration-break:clone]">
      {props.children}
    </code>
  );
}

function Formula(props: { children: string }) {
  return (
    <pre className="no-scrollbar mt-4 overflow-x-auto rounded-lg bg-[oklch(0.982_0_0)] px-4 py-3.5 font-mono text-[13px] leading-[1.55] text-[rgb(3_47_98)]">
      {props.children}
    </pre>
  );
}

// A live demo, with a link to it on its own page
function Demo(props: { href: string; children: React.ReactNode }) {
  const { href, children } = props;
  return (
    <figure className="mt-4">
      {children}
      <figcaption className="text-center font-geist text-xs leading-normal text-[oklch(0.649_0_0)]">
        <Link
          href={href}
          className="outline-none transition-colors hover:text-[oklch(0.375_0_0)] focus-visible:text-[oklch(0.375_0_0)]"
        >
          Open on its own →
        </Link>
      </figcaption>
    </figure>
  );
}

export default function Page() {
  return (
    <div className="min-h-dvh w-full bg-white">
      {/* Fixed beside the article on wide screens, above it on narrow ones */}
      <aside className="px-6 pt-8 min-[1080px]:fixed min-[1080px]:top-20 min-[1080px]:left-20 min-[1080px]:p-0">
        <Link
          href="/ios"
          className="flex w-fit items-center gap-1 py-1 font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.649_0_0)] outline-none transition-colors hover:text-[oklch(0.375_0_0)] focus-visible:text-[oklch(0.375_0_0)]"
        >
          <ChevronLeft size={16} aria-hidden />
          Index
        </Link>
        <TableOfContents sections={SECTIONS} />
      </aside>

      <main className="mx-auto max-w-[36.375rem] px-6 pt-8 pb-24 md:px-4 md:pt-20">
        <article className="flex flex-col">
          <header className="flex flex-col gap-1 pb-2">
            <h1 className="font-geist text-sm leading-5 font-medium tracking-[-0.08px] text-[oklch(0.205_0_0)]">
              Fluid Interactions
            </h1>
            <time
              dateTime="2026-11-04"
              className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.649_0_0)]"
            >
              4 November, 2026
            </time>
          </header>

          <p className={`${TEXT} pt-4`}>
            Fluid Interactions is a skill that helps your agent build interfaces
            that feel physical: drags that follow your finger, flicks that keep
            their momentum, sheets that land where you meant, and animations you
            can catch mid-flight. Agents can already wire up a drag handler, but
            the result usually feels off. It jumps when you grab it, stops dead
            when you let go, or ignores you until it finishes. This skill is the
            set of small physics and gesture decisions that close that gap.
          </p>

          <figure className="mt-10 mb-12">
            {/* The interaction made with the skill goes here */}
            <div className="aspect-[1.6] w-full rounded-xl bg-[oklch(0.982_0_0)]" />
            <figcaption className="mx-auto mt-6 max-w-[52ch] text-center font-geist text-xs leading-normal text-[oklch(0.649_0_0)]">
              Made with Fluid Interactions.
            </figcaption>
          </figure>

          <SectionHeading id="getting-started">Getting started</SectionHeading>

          <CopyCode code={`npx skills add ${SKILL_NAME}`} />

          <p className={`${TEXT} pt-4`}>
            That adds the skill to your agent. Then ask for one interaction at a
            time: a sheet that snaps, a card you can flick away, a scrubber you
            can slow down.
          </p>
          <p className={`${TEXT} pt-4`}>
            The rest of this post walks through the twelve demos the skill was
            built from, in the order they build on each other. Each one adds a
            single idea to the ones before it, and almost all of them share one
            small physics file of about ninety lines.
          </p>

          {/* ---------------------------------------------------------------- */}
          <SectionHeading id="springs">Springs</SectionHeading>

          <P>
            Most web animations are given a duration and an easing curve: move
            here, take 300ms, slow down at the end. Almost everything that moves
            in these demos uses a spring instead. A spring doesn’t have a fixed
            duration. It only needs to know where it is, where it’s going, and
            how fast it’s already moving.
          </P>
          <P>
            That last part is what makes the difference. When you let go of
            something mid-drag, it’s already moving at your finger’s speed. A
            spring can start from that speed and carry on smoothly. A
            duration-based animation always starts from rest, so it stops dead
            for a moment before setting off. The next section is built on this.
          </P>
          <P>
            A spring is normally described by three physical properties:
            stiffness (how hard it pulls toward the target), damping (how much
            friction slows it down) and mass. They’re accurate, but they’re hard
            to design with. Ask for a spring that takes about half a second and
            barely bounces, and there’s no obvious stiffness to type in. So
            instead, each spring here is described by the two things you
            actually notice. <C>response</C> is roughly how long it takes to
            arrive, in seconds. <C>dampingRatio</C> is how much it bounces: at 1
            it arrives without overshooting, and the lower it goes, the more it
            overshoots and settles back. The two sets of numbers convert
            directly:
          </P>
          <Formula>
            {
              "stiffness = (2π / response)² · mass\ndamping   = 4π · dampingRatio · mass / response"
            }
          </Formula>
          <P>
            <C>springFromResponse</C> is that conversion as a function.
            Animation libraries like Motion only understand stiffness and
            damping, so it takes the two readable numbers and returns a
            transition Motion can use directly:
          </P>
          <Formula>
            {
              'const SPRING = springFromResponse(0.45, 0.88)\n// → { type: "spring", stiffness: 195, damping: 24.6, mass: 1 }\n\nanimate(y, target, SPRING)'
            }
          </Formula>
          <P>
            Drag the sliders below to see the curve change as you go, and tap
            the track to feel it.
          </P>
          <Demo href="/ios/spring">
            <SpringDemo embedded />
          </Demo>

          {/* ---------------------------------------------------------------- */}
          <SectionHeading id="interrupting">Interrupting</SectionHeading>

          <P>
            The single biggest difference between an interface that feels fluid
            and one that feels like a slideshow is what happens when you touch
            something that’s already moving. A timed animation has to play out
            first. A fluid one stops exactly where it is on screen, hands itself
            to your finger, and when you let go, carries your speed into
            whatever it does next.
          </P>
          <Formula>
            {
              "onTouchDown: animation.stop(); origin = value on screen\nonMove:      value = origin + fingerDelta\nonRelease:   animate(value, target, { velocity: fingerVelocity })"
            }
          </Formula>
          <P>
            That last line needs to know how fast the finger was moving when it
            let go, and the browser never tells you. Pointer events only report
            where the finger is, never how fast it’s going. So the speed has to
            be worked out from the positions, which is the job of a small helper
            called <C>VelocityTracker</C>.
          </P>
          <P>
            Every time the finger moves, the tracker records the position and
            the time. It throws away anything older than 100ms, and when you let
            go it divides the distance between the oldest and newest sample by
            the time between them:
          </P>
          <Formula>
            {
              "velocity = (newest.position − oldest.position) / (newest.time − oldest.time)\n\nonly samples from the last 100ms count"
            }
          </Formula>
          <P>
            The short window is the important part. If you drag slowly and then
            flick, you want the flick’s speed, not the average of the whole
            drag. Feed that velocity into the spring and the handoff is
            seamless, because a spring, unlike an easing curve, can start
            already moving.
          </P>
          <P>
            To try it, tap either lane to send its ball across, and grab the
            ball while it’s still moving. The top one stops under your finger:
            drag it around, let go, and it leaves at your speed for the nearer
            end. The bottom one ignores the grab until it arrives, and counts
            every grab it ignored. Both balls rubber band if you drag them past
            the end of their lane.
          </P>
          <Demo href="/ios/interruptible">
            <InterruptibleDemo embedded />
          </Demo>

          {/* ---------------------------------------------------------------- */}
          <SectionHeading id="rubber-banding">Rubber banding</SectionHeading>

          <P>
            Every surface you drag has limits: the top of a list, the last
            detent of a sheet, the end of a scrubber. What happens when your
            finger keeps going past them decides a lot about how the whole
            interaction feels. If the content stops dead at the edge, it feels
            like hitting a wall, and your finger is suddenly no longer connected
            to anything. If it keeps following 1:1, there’s no edge at all.
          </P>
          <P>
            Rubber banding sits in between. Inside its bounds the content tracks
            your finger exactly. Past the edge it keeps following, but less and
            less the further you pull, and it can never go more than a fixed
            distance beyond. Let go and it springs back. The content always
            stays attached to your finger, and the resistance tells you you’ve
            reached the end without anything breaking. Almost every demo after
            this one relies on it, because none of them would feel fluid without
            it.
          </P>
          <Formula>
            {
              "offset = (1 − 1 / (c · x / d + 1)) · d\n\nx = how far past the edge the finger is\nd = the most it can ever stretch (the container's size)\nc = 0.55, how stiff it feels"
            }
          </Formula>
          <P>
            Read it from the inside out. <C>c · x / d</C> is how far you’ve
            pulled, measured against the container’s size. Adding 1 and taking
            the reciprocal turns that into a number that starts at 1 and shrinks
            toward 0 as you pull further, and <C>1 −</C> flips it so it grows
            from 0 toward 1. Multiplying by <C>d</C> turns it back into pixels.
            So the offset starts at zero and climbs toward <C>d</C>, but never
            reaches it.
          </P>
          <P>
            Right at the edge the content moves at <C>c</C> times the finger, so
            just over half speed, and the resistance grows from there. In a
            400px container:
          </P>
          <Formula>
            {
              "pull 10px    → moves 5.4px\npull 100px   → moves 48.4px\npull 400px   → moves 141.9px\npull 1000px  → moves 231.6px\npull 4000px  → moves 338.5px   (never more than 400)"
            }
          </Formula>
          <P>
            Because <C>d</C> is the container’s size, the same pull feels the
            same in a small card and a full screen. A bigger <C>c</C> stretches
            more easily, a smaller one feels stiffer. In code, <C>rubberBand</C>{" "}
            is the formula and <C>applyRubberBand(value, min, max, d)</C>{" "}
            applies it at both ends, leaving the inside untouched.
          </P>
          <P>
            To try it, drag the box below past any edge of its container and
            keep pulling: it slows the further you go. Let go and it springs
            back. Then move the resistance slider and pull again to feel{" "}
            <C>c</C> change.
          </P>
          <Demo href="/ios/drag">
            <DragDemo embedded />
          </Demo>

          {/* ---------------------------------------------------------------- */}
          <SectionHeading id="momentum">Momentum</SectionHeading>

          <P>
            When you flick a list and let go, it doesn’t spring anywhere. It
            coasts. iOS models this with a deceleration rate: every millisecond,
            the speed is multiplied by <C>0.998</C> (or <C>0.99</C> for the
            faster-stopping mode). Run that rule forward and you get the
            coasting formula: where the content is at any moment after you let
            go. It’s a closed formula, so the scroller calculates each frame
            directly instead of adding up small steps and drifting:
          </P>
          <Formula>
            {
              "// the coasting formula\nvelocity(t) = v₀ · rateᵗ\nposition(t) = p₀ + v₀ · (rateᵗ − 1) / (1000 · ln rate)\n\nt in milliseconds, v₀ in px/s"
            }
          </Formula>
          <P>
            The scroll demo runs that on a frame loop and stops when the speed
            drops below 10px/s. If the coast runs into an edge mid-flight, it
            doesn’t clamp: it hands its remaining speed to a spring, which
            overshoots into the rubber band and settles back. That’s the bounce
            at the end of every iOS list.
          </P>
          <P>
            To try it, drag the row of cards sideways and let go: it keeps
            moving and slows to a stop. Drag quickly toward either end and let
            go to see it hit the edge and bounce back. Then switch to Fast and
            drag again; it stops much sooner. Paging snaps each drag to a whole
            card, using the projection from the next section.
          </P>
          <Demo href="/ios/scroll">
            <ScrollDemo embedded />
          </Demo>

          {/* ---------------------------------------------------------------- */}
          <SectionHeading id="projection">Projection</SectionHeading>

          <P>
            The coasting formula from the Momentum section says where content is
            at any moment after you let go: the speed shrinks a little every
            millisecond, so the content keeps moving but covers less and less
            ground. Let it run forever and the position stops changing. It
            settles on a single point: where the flick would come to rest. That
            point is the most useful number in this whole post.
          </P>
          <Formula>
            {
              "projection = (velocity / 1000) · rate / (1 − rate)\n\nrate = 0.998  →  about 0.5 × velocity in px/s"
            }
          </Formula>
          <P>
            <C>project(velocity)</C> answers “where was the user trying to throw
            this?” before anything has moved. A flick at 1,000px/s projects
            about 500px ahead. Snapping to the target nearest the projected
            point, instead of the nearest one to where the finger let go, is
            what makes a quick, short flick land somewhere far away.
          </P>
          <P>
            The corner-snapping demo is a picture-in-picture window. On release
            it projects where the flick would land, snaps to the nearest corner
            to that point, and springs there starting at the finger’s speed.
          </P>
          <P>
            To try it, press the button in the corner of the player below to pop
            it out. It floats over the page like a real picture-in-picture
            window, so it stays with you as you scroll. Flick it toward any
            corner of the screen and let go: a quick, short flick is enough to
            send it across. Press the button on the window to put it back.
          </P>
          <P>The two toggles under the player take the idea apart:</P>
          <ul className="flex flex-col gap-2 pt-4 pl-5">
            {[
              "Use projection. On, the window goes to the corner nearest where your flick would have landed, so a short, quick flick sends it across the screen. Off, it goes to the corner nearest where you let go. Flicks stop counting, and you have to drag it most of the way there yourself.",
              "Velocity handoff. On, the spring starts at the speed your finger was moving, so the window keeps travelling in the direction you threw it and eases into the corner. Off, the spring starts from rest: the window stops dead the moment you let go, then sets off again toward the corner. That small hitch is what most web animations feel like.",
            ].map((item) => (
              <li
                key={item}
                className={`${TEXT} relative before:absolute before:top-2 before:-left-3.5 before:size-1 before:rounded-full before:bg-[oklch(0.818_0_0)]`}
              >
                {item}
              </li>
            ))}
          </ul>
          <Demo href="/ios/flick">
            <FlickDemo embedded />
          </Demo>

          {/* ---------------------------------------------------------------- */}
          <SectionHeading id="direction-lock">Direction lock</SectionHeading>

          <P>
            Sometimes one element has to handle two gestures at once. A list
            scrolls up and down, and pulls down to refresh, but each row also
            swipes sideways to reveal its actions. The element has to work out
            which one you meant, and nobody drags in a perfectly straight line.
            A sideways swipe always drifts a few pixels up or down, and a scroll
            always wanders a little to the side. If the element followed the
            finger exactly, every swipe would nudge the list and every scroll
            would wiggle the row.
          </P>
          <P>
            So instead of following the finger right away, it waits. For the
            first 10px nothing moves. Then it looks at which direction the
            finger has clearly been going, locks to that axis, and ignores the
            other one for the rest of the gesture. A swipe stays a swipe, and a
            scroll stays a scroll. “Clearly” means one direction is at least
            twice the other; a properly diagonal drag stays free on both axes.
          </P>
          <Formula>
            {
              "if distance > 10:\n  axis = |dx| > 2·|dy| ? x\n       : |dy| > 2·|dx| ? y\n       : free"
            }
          </Formula>
          <P>
            The detail that makes it invisible is where you measure from. The
            drag remembers the finger’s offset at the moment of locking and
            subtracts it afterwards. Without that, the content would jump by the
            10px it took to decide.
          </P>
          <P>
            To try it, drag the box mostly sideways: after the first 10px it
            locks and slides only horizontally, however much your finger drifts
            up or down. Then drag mostly up and down, and finally on a true
            diagonal, which stays free. The box is rubber banded the whole way,
            so it resists more the further you pull and springs back to the
            middle when you let go. Turn off Direction lock to feel how loose a
            drag is without it.
          </P>
          <Demo href="/ios/lock">
            <LockDemo embedded />
          </Demo>

          {/* ---------------------------------------------------------------- */}
          <SectionHeading id="a-real-list">A real list</SectionHeading>

          <P>
            The lock earns its keep when two gestures share the same surface. In
            a mail-style list, every row swipes sideways to reveal its actions
            and the whole list scrolls vertically. Each row runs the lock; once
            a drag commits to vertical, the row forwards it to the list’s own
            scroll handlers, so a scroll never nudges a row and a swipe never
            moves the list.
          </P>
          <P>
            The same demo puts the earlier pieces together. Rows rubber band
            past their two action buttons, which stretch with them instead of
            leaving a gap. The list coasts with the momentum formula and pages
            with projection. Pull down from the top slowly to see the refresh
            spinner build: its eight sticks appear one every 4.5px, so all eight
            are showing exactly as the pull crosses the refresh threshold. Pull
            too fast and they all seem to appear at once. While it loads, the
            list rests a little short of that point, so on release it visibly
            settles back up rather than stopping dead.
          </P>
          <P>
            To try it, swipe a row left or right to reveal its two actions, then
            keep pulling past them: the row rubber bands and the buttons stretch
            with it. Drag the list up and down to scroll; it rubber bands at
            both ends too. Start a slightly diagonal drag and watch it pick one,
            the row or the list, never both. The buttons below switch the list
            between the same Normal, Fast and Paging modes as before.
          </P>
          <Demo href="/ios/lock-example">
            <LockExampleDemo embedded />
          </Demo>

          {/* ---------------------------------------------------------------- */}
          <SectionHeading id="sheets">Sheets</SectionHeading>

          <P>
            A bottom sheet with detents is projection plus snapping in one
            dimension. The Maps-style sheet has three resting points: closed
            (just the search field), half and full. On release:
          </P>
          <Formula>
            {
              "target = nearest(detents, y + projection(velocityY))\nbackgroundScale = lerp(1, 0.92, progress)"
            }
          </Formula>
          <P>
            Because the landing point is projected, a firm flick from closed can
            skip the half detent and go straight to full, the way a real sheet
            does. Past the half detent, the map behind it shrinks to 92% and
            dims slightly, driven straight from the sheet’s position so it
            scrubs with your finger rather than animating on its own. Only the
            handle drags the sheet, and the list inside only scrolls once the
            sheet is at Full; below that, the end of the list would be off the
            bottom of the screen.
          </P>
          <P>
            The sheet also rubber bands at both ends. Pull it up past Full or
            down past Closed and it keeps following your finger, but with the
            same growing resistance as the box in the rubber banding demo, and
            it springs back to the detent when you let go. The list inside is
            taller than it looks, so even when the sheet is pulled up past Full
            its bottom never lifts off the screen.
          </P>
          <P>
            To try it, drag the handle at the top of the sheet. Flick it up
            quickly from Closed and it skips Half and lands on Full; drag it
            slowly and it stops at the nearest detent. Watch the map shrink back
            as it rises past Half, then at Full keep pulling up to feel the
            rubber band. The buttons below jump straight to each detent, and
            turning off Use projection makes the sheet ignore how fast you
            flicked.
          </P>
          <Demo href="/ios/mobile-sheet">
            <MobileSheetDemo embedded />
          </Demo>

          {/* ---------------------------------------------------------------- */}
          <SectionHeading id="scrubbing">Scrubbing</SectionHeading>

          <P>
            A video scrubber is a few hundred pixels wide, which isn’t enough
            precision for a long video. The iOS answer is to slow the scrub down
            as your finger moves away from the bar: full speed on it, then half,
            a quarter and an eighth every 50px further away.
          </P>
          <Formula>
            {
              "rate = 1, ½, ¼, ⅛ at 0, 50, 100, 150px from the bar\ntime += Δx · (duration / barWidth) · rate"
            }
          </Formula>
          <P>
            The second line is the important one. The playhead never jumps to
            where your finger is; each move adds the finger’s horizontal
            movement times the current rate. If time followed the finger’s
            absolute position, changing speed would make the playhead leap.
          </P>
          <P>
            The scrubber also pauses playback while you drag and resumes only if
            it was playing before.
          </P>
          <P>
            To try it, drag along the bar, playing or paused. While you hold,
            move your finger down away from the bar: the speed at the top of the
            player drops from 1× to 0.5×, 0.25× and 0.125×, and the times beside
            the bar change in smaller and smaller steps. Let go and playback
            carries on if it was playing. Turn off Fine scrubbing to keep full
            speed wherever your finger is.
          </P>
          <Demo href="/ios/scrubber">
            <ScrubberDemo embedded />
          </Demo>

          {/* ---------------------------------------------------------------- */}
          <SectionHeading id="morphing">Morphing</SectionHeading>

          <P>
            Tap a tile and it grows into a full card; drag the card down and it
            shrinks back into the tile. The whole transition is one number,{" "}
            <C>progress</C>, from 0 (on the tile) to 1 (full screen). Position
            and size are interpolated from the tile’s measured rectangle to the
            container’s, and everything else hangs off the same value: the cover
            shrinks from 100% to 50% of the height, the body fades in over the
            last 40%, and the tile’s labels fade out over the first 40%.
          </P>
          <P>
            Because it’s one value, it can be driven by a spring or by a finger
            and switch between them at any time. Dragging the open card down
            scales it toward 50% and lifts the dim behind it. On release, the
            same rule as the sheet decides:
          </P>
          <Formula>
            {"close if dragY + projection(velocityY) > containerHeight · 0.25"}
          </Formula>
          <P>
            The cover art is drawn with SVG that keeps its aspect ratio, so the
            artwork stays identical between the square tile and the wide header
            and the morph reads as one object.
          </P>
          <P>
            To try it, tap a city to open its card. Drag the card down and let
            go: past a quarter of the way, or with a quick flick, it shrinks
            back into its tile; otherwise it springs back open. Drag it up
            instead and it rubber bands, since there’s nowhere further to open.
            Tapping the card closes it too.
          </P>
          <Demo href="/ios/drag-transition">
            <DragTransitionDemo embedded />
          </Demo>

          {/* ---------------------------------------------------------------- */}
          <SectionHeading id="swipe-back">Swipe back</SectionHeading>

          <P>
            This one is based on how you go back on iOS. In almost every app,
            you don’t need to reach for the back button in the top corner: swipe
            in from the left edge of the screen and the current page slides away
            under your finger, revealing the one before it. Let go partway and
            it decides whether you meant it.
          </P>
          <P>
            The gesture only starts at the left edge, so every other horizontal
            drag on the page still belongs to the content. A press within 24px
            of the edge starts a pending gesture; it becomes a drag only once
            it’s moved 10px and is mostly to the right. The page underneath
            slides in from 30% to the left as the top page moves, the parallax
            that makes the stack feel layered:
          </P>
          <Formula>
            {
              "underX = lerp(−0.3 · width, 0, x / width)\nback   = x + projection(velocityX) > width / 2"
            }
          </Formula>
          <P>
            This was the demo that taught the most about touch, because a mouse
            never exposes any of it. The pointer is only captured once the
            gesture has committed, so taps on rows still work. A page that is
            mid-slide can be caught from anywhere, not just the edge. And
            because a touch can end without the page ever hearing about it,
            every new press checks whether the previous gesture is stale before
            refusing to start.
          </P>
          <P>
            To try it, tap General, then About, to go two pages deep. Then drag
            from the very left edge of the screen to the right: the page follows
            your finger while the one underneath slides in. Let go before
            halfway and it stays; flick, and it goes back even from a short
            drag. Grab the page while it’s still sliding to catch it. With Use
            projection off, only where you let go counts.
          </P>
          <Demo href="/ios/swipe-close">
            <SwipeCloseDemo embedded />
          </Demo>

          {/* ---------------------------------------------------------------- */}
          <SectionHeading id="the-app-switcher">
            The app switcher
          </SectionHeading>

          <P>
            Swiping up from the home bar is one gesture with five possible
            outcomes: stay in the app, go home, open the switcher, or switch to
            the previous or next app. It uses everything above at once.
          </P>
          <P>
            While you drag, the app shrinks toward 50% as you move up, and its
            bottom edge stays under your finger. Dragging down rubber bands. On
            release, it checks the outcomes in this order and takes the first
            one that fits:
          </P>
          <Formula>
            {
              "1. previous app  ← mostly sideways to the right, more than 40px\n2. next app      ← mostly sideways to the left, more than 40px\n3. home          ← flicked up faster than 210px/s, or past 60% of the screen\n4. switcher      ← in the zone and slow\n5. the app       ← anything else: it springs back"
            }
          </Formula>
          <P>
            “Slow” is the clever part. The switcher opens when you pause partway
            up, but a fixed speed threshold feels twitchy. So the threshold
            isn’t fixed: it starts at 51px/s and, while your finger stays in the
            switcher zone, rises toward 134px/s. The longer you hover, the
            easier it is to count as paused.
          </P>
          <Formula>
            {
              "threshold += (target − threshold) · (1 − (1 − 0.2)^(frameTime / 16.7ms))"
            }
          </Formula>
          <P>
            That exponent keeps the climb the same speed on a 120Hz screen as on
            a 60Hz one. The decision runs every frame while the finger is down,
            not just on release, so the other cards fade in the moment letting
            go would open the switcher. You see the outcome before you commit to
            it. Every outcome settles on a spring that picks up your release
            speed, and going home flies the app into its icon’s measured
            position.
          </P>
          <P>
            To try it, tap an app icon to open it, then drag the bar at the
            bottom of the screen upward. Flick up quickly to go home. Drag up
            slowly and pause partway, and the other apps fade in: let go there
            to open the switcher, swipe through the cards and tap one. With a
            few apps open, drag sideways along the bar to jump between them.
            Pull the bar down instead and it rubber bands, and in the switcher
            the cards rubber band past the first and last app.
          </P>
          <Demo href="/ios/app-switcher">
            <AppSwitcherDemo embedded />
          </Demo>

          {/* ---------------------------------------------------------------- */}
          <SectionHeading id="reduced-motion">Reduced motion</SectionHeading>

          <P>
            Some people turn on reduced motion because large movement on screen
            makes them feel unwell. The obvious response is to switch animation
            off, but for interactions like these that would break them: a sheet
            that doesn’t follow your finger isn’t calmer, it’s just broken.
          </P>
          <P>
            The rule the demos follow instead: anything your finger drives stays
            exactly as it is, because that motion is yours and you can see it
            coming. Only motion that plays by itself is reduced.
          </P>
          <ul className="flex flex-col gap-2 pt-4 pl-5">
            {[
              "Big automatic movements become short fades in place. The tile no longer zooms into a card, apps no longer fly to and from their icons, and a tapped row fades its page in instead of sliding it across.",
              "Depth effects go. The page underneath the swipe back loses its parallax, and the map behind the sheet stops shrinking back, though it still dims.",
              "Springs keep their speed but lose their overshoot.",
            ].map((item) => (
              <li
                key={item}
                className={`${TEXT} relative before:absolute before:top-2 before:-left-3.5 before:size-1 before:rounded-full before:bg-[oklch(0.818_0_0)]`}
              >
                {item}
              </li>
            ))}
          </ul>
          <P>
            Removing the overshoot doesn’t mean switching to a duration and an
            easing curve, which would throw away the velocity handoff. It means
            raising the spring’s damping to the point where it just stops
            overshooting, called critical damping. Same response, same starting
            speed, no bounce:
          </P>
          <Formula>{"damping = max(damping, 2 · √(stiffness · mass))"}</Formula>
          <P>
            Motion can follow the system setting for its own layout animations
            with <C>{'<MotionConfig reducedMotion="user">'}</C>, which covers
            things like the sliding mode pills. It doesn’t cover values animated
            by hand with <C>animate()</C>, and that’s nearly everything here, so
            each demo reads the setting itself through <C>useReducedMotion()</C>
            . To try it, turn on Reduce motion in your system’s accessibility
            settings and come back to any demo above; it applies without a
            reload.
          </P>

          {/* ---------------------------------------------------------------- */}
          <SectionHeading id="what-broke">
            What broke along the way
          </SectionHeading>

          <P>
            The formulas were the easy part. Most of the time went into bugs
            that only showed up on a real phone, or only once in twenty tries.
            These are in the skill too, because an agent will hit every one of
            them:
          </P>
          <ul className="flex flex-col gap-2 pt-4 pl-5">
            {[
              "On touch, the element under your finger holds the pointer first. When the gesture takes it, that element's lostpointercapture event bubbles up and looks exactly like a release.",
              "A scroll container doesn't inherit touch-action from its parent. Without touch-action: pan-y on the scroller itself, the browser claims sideways drags and cancels the gesture mid-swipe.",
              "A touch can end without a pointerup ever reaching you. If a gesture refuses to start while another is active, it needs to recover from a stale one or it locks up for good.",
              "A cancelled gesture is the system taking the touch, not a flick. Settle where it is instead of projecting the last speed.",
              "Motion skips onComplete when one animation replaces another, so an 'is animating' flag can get stuck. Read the motion value instead.",
              "Resetting a position before React swaps the pages flashes the old page for one frame. Do it in a layout effect.",
              "A stretched flex item squashes back to 100% unless it has flex-shrink: 0, so the rubber band never shows.",
              "Measure distances from the thing being controlled, not from where the finger went down. The scrub zones were off by up to 15px until they were measured from the bar.",
            ].map((item) => (
              <li
                key={item}
                className={`${TEXT} relative before:absolute before:top-2 before:-left-3.5 before:size-1 before:rounded-full before:bg-[oklch(0.818_0_0)]`}
              >
                {item}
              </li>
            ))}
          </ul>
          <P>
            None of these are interesting on their own. Together they’re the
            difference between a demo that works when you try it once and an
            interaction you can hand to someone’s thumb.
          </P>
        </article>
      </main>
    </div>
  );
}
