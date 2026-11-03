import React from "react";
import Link from "next/link";

// Server component: the index is static, so it ships no client JS of its own.
// Each demo pulls in its own "use client" bundle only once navigated to.

type Demo = {
  href: string;
  title: string;
  description: string;
  // The physics.ts exports the demo actually imports, so this list stays
  // checkable against the source rather than drifting into decoration.
  uses: string[];
};

const demos: Demo[] = [
  {
    href: "/ios/drag",
    title: "Rubber band",
    description:
      "Drag past the edge of a container. It tracks 1:1 inside, then resists harder the further you pull, and never travels more than d beyond the edge.",
    uses: ["applyRubberBand", "clamp", "springFromResponse"],
  },
  {
    href: "/ios/lock",
    title: "Direction lock",
    description:
      "After 10pt a drag commits to whichever axis clearly wins, so it moves in a straight line. Diagonal drags stay free.",
    uses: ["rubberBand", "stretch", "springFromResponse"],
  },
  {
    href: "/ios/lock-example",
    title: "Direction lock in a list",
    description:
      "The same lock in a real list: swipe a row sideways for its actions, drag vertically to scroll, pull down from the top to refresh. A scroll never nudges a row.",
    uses: ["applyRubberBand", "clamp", "DECELERATION", "project"],
  },
  {
    href: "/ios/scroll",
    title: "Scroll friction",
    description:
      "A custom scroller with Apple's deceleration rates — speed is multiplied by the rate every millisecond. Paging projects the flick and snaps to the nearest card; both ends rubber band.",
    uses: ["applyRubberBand", "clamp", "DECELERATION", "project"],
  },
  {
    href: "/ios/flick",
    title: "Corner snapping",
    description:
      "Picture-in-picture. On release it works out where the flick would land and snaps to the corner nearest that point, with the spring starting at the finger's speed so nothing jerks.",
    uses: ["nearestPoint", "project", "applyRubberBand"],
  },
  {
    href: "/ios/mobile-sheet",
    title: "Sheet detents",
    description:
      "A Maps-style sheet with three detents. A flick is projected and snapped to the nearest one, so it can skip the middle; near full, the map dims and shrinks back.",
    uses: ["nearest", "project", "applyRubberBand"],
  },
  {
    href: "/ios/app-switcher",
    title: "App switcher",
    description:
      "Swipe up from the bar. A fast flick or long swipe goes home; slow down partway and the switcher opens before release, and hovering longer widens the target. Swipe sideways to jump between apps.",
    uses: ["VelocityTracker", "project", "rubberBand", "clamp"],
  },
];

const primitives = [
  {
    name: "VelocityTracker",
    note: "Release speed from the last 100ms of pointer samples, so a slow drag ending in a flick leaves at the flick's speed.",
  },
  {
    name: "applyRubberBand",
    note: "UIScrollView's resistance curve past a boundary, asymptotic to d.",
  },
  {
    name: "project",
    note: "Where a flick would come to rest, at UIKit's normal or fast deceleration rate.",
  },
  {
    name: "springFromResponse",
    note: "A spring specified as response and damping ratio rather than raw stiffness.",
  },
  {
    name: "nearest / nearestPoint",
    note: "Closest snap target to a value or a point.",
  },
  {
    name: "useDrag",
    note: "Pointer capture, left button only, one finger at a time, and settling on lost capture.",
  },
];

export default function Page() {
  return (
    <div className="min-h-dvh w-full flex justify-center px-4 py-16">
      <div className="flex flex-col max-w-100 w-full gap-6">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[oklch(0.649_0_0)]">
            iOS interactions
          </p>
          <p className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
            Seven UIKit gestures rebuilt from their underlying maths, each one
            isolated so the behaviour can be felt on its own. They all share a
            single physics module.
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {demos.map((demo, index) => (
            <li key={demo.href}>
              <Link
                href={demo.href}
                className="group flex flex-col gap-2 rounded-xl bg-[oklch(0.982_0_0)] px-4 py-3 outline-none transition-colors hover:bg-[oklch(0.961_0_0)] focus-visible:ring-2 focus-visible:ring-[oklch(0.708_0_0)] focus-visible:ring-offset-2"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs tabular-nums text-[oklch(0.649_0_0)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-geist text-sm leading-5 font-medium tracking-[-0.08px] text-[oklch(0.205_0_0)]">
                    {demo.title}
                  </span>
                  {/* Sits on the text baseline rather than the row, so it reads
                      as part of the title line. */}
                  <span className="ml-auto font-mono text-[10px] text-[oklch(0.649_0_0)] transition-colors group-hover:text-[oklch(0.503_0_0)]">
                    {demo.href}
                  </span>
                </div>

                <p className="font-geist text-xs leading-4.5 tracking-[-0.08px] text-[oklch(0.503_0_0)]">
                  {demo.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {demo.uses.map((name) => (
                    <span
                      key={name}
                      className="rounded-md bg-[oklch(0.94_0_0)] px-1.5 py-0.5 font-mono text-[10px] text-[rgb(3_47_98)]"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 rounded-xl bg-[oklch(0.982_0_0)] px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[oklch(0.649_0_0)]">
            Shared
          </p>

          <ul className="flex flex-col gap-2.5">
            {primitives.map((primitive) => (
              <li key={primitive.name} className="flex flex-col gap-0.5">
                <span className="font-mono text-xs text-[rgb(3_47_98)]">
                  {primitive.name}
                </span>
                <span className="font-geist text-xs leading-4.5 tracking-[-0.08px] text-[oklch(0.503_0_0)]">
                  {primitive.note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
