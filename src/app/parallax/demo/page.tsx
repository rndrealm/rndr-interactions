"use client";
import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

export default function Page() {
  const [selected, setSelected] = useState(-1);
  // Scroll offset captured when a card opens. This has to be React state rather
  // than the live `scrollY` MotionValue: MotionValues write to the DOM outside
  // React, so `layout` would measure the card's target box before `top` landed
  // and animate toward a stale position — the card visibly dips on the way out.
  const [openedAt, setOpenedAt] = useState(0);
  const { scrollY } = useScroll();

  // An open card is pinned to the offset captured at click time, so freeze the
  // page while one is up rather than let scrolling drag it off the viewport.
  useEffect(() => {
    if (selected === -1) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [selected]);

  // The in-flow column above is just a scroll-height driver: it never moves, it
  // only makes the document tall enough to scroll. This drags the fixed overlay
  // column against that scroll 1:1, so the two read as one scrolling list.
  const columnY = useTransform(scrollY, (v) => -v);

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex flex-col items-center gap-10 py-[20vh] will-change-transform px-4",
        )}
      >
        {Array(9)
          .fill(0)
          .map((_, index) => {
            return (
              <div
                key={index}
                // Step the lightness a little per card so adjacent panels stay
                // distinguishable while the parallax scrolls them past each other.
                style={{ backgroundColor: `hsl(0 0% ${88 - index * 3}%)` }}
                className="max-w-200 w-full h-[60vh] relative overflow-hidden will-change-transform"
              >
                {/* <Image
                src={IMAGE_ULRS[index % IMAGE_ULRS.length]}
                alt="parallax"
                fill
                className="absolute left-0 right-0 h-[150%]! top-[-25%]! object-cover"
                draggable={false}
              /> */}
              </div>
            );
          })}
      </div>

      <div className="fixed inset-0 bg-[red] flex flex-col">
        <motion.div
          style={{ y: columnY }}
          className="h-full w-full flex-1 bg-[blue] flex flex-col items-center gap-10 py-[20vh] will-change-transform"
        >
          {Array(9)
            .fill(0)
            .map((_, index) => {
              const isSelected = selected === index;

              return (
                // The wrapper owns the slot and never changes: the card leaves
                // the flow to go fullscreen, so without it the column would
                // close the gap and drag every card below into the animation.
                <div
                  key={index}
                  className="relative max-w-200 w-full h-[60vh] shrink-0"
                >
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 260, damping: 32 }}
                    style={{
                      // Step the lightness a little per card so adjacent panels
                      // stay distinguishable as they scroll past each other.
                      backgroundColor: `hsl(0 0% ${88 - index * 3}%)`,
                      // `fixed` ignores the plain `relative` wrapper and
                      // resolves against the column, which is a containing
                      // block via its transform — so the card still lands
                      // -scrollY off and still needs the offset to cancel it.
                      top: isSelected ? openedAt : 0,
                    }}
                    className={cn(
                      "overflow-hidden will-change-transform",
                      isSelected
                        ? "fixed left-0 z-50 w-screen h-screen"
                        : "absolute inset-0",
                    )}
                    onClick={() => {
                      if (isSelected) {
                        setSelected(-1);
                        return;
                      }
                      setOpenedAt(scrollY.get());
                      setSelected(index);
                    }}
                  >
                    {/* <Image
                src={IMAGE_ULRS[index % IMAGE_ULRS.length]}
                alt="parallax"
                fill
                className="absolute left-0 right-0 h-[150%]! top-[-25%]! object-cover"
                draggable={false}
              /> */}
                  </motion.div>
                </div>
              );
            })}
        </motion.div>
      </div>
    </div>
  );
}
