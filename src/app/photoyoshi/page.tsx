"use client";
import React, { useEffect, useState } from "react";
import { InfiniteRow, ScrollApi } from "@/components/photoyoshi/infinite-row";
import { Webgl } from "@/components/photoyoshi/webgl";
import { GridButton } from "@/components/photoyoshi/grid-button";
import { RowButton } from "@/components/photoyoshi/row-button";

export type Mode = "grid" | "full";

const SCROLL_NUDGE_MULT = 2.5 * 1.5;
const DRAG_SPEED = 1.5;
// input tuning lives with the listeners; infinite-row takes raw pixels
const WHEEL_SPEED = 1.2;

export default function Page() {
  const [mode, setMode] = useState<Mode>("grid");
  const scrollApiRef = React.useRef<ScrollApi>(null);

  useEffect(() => {
    const drag = {
      active: false,
      lastX: 0,
    };

    const getClientX = (e: MouseEvent | TouchEvent) => {
      if ("touches" in e && e.touches[0]) return e.touches[0].clientX;
      return (e as MouseEvent).clientX;
    };

    const onDragStart = (e: MouseEvent | TouchEvent) => {
      drag.active = true;
      drag.lastX = getClientX(e);
    };

    const onDragMove = (e: MouseEvent | TouchEvent) => {
      if (!drag.active) return;
      const x = getClientX(e);
      // Per-move increment rather than a position derived from where the drag
      // started. An absolute write would overwrite anything the nudge tween
      // contributed since mousedown, so drag would still fight the transition
      // even after the nudge itself stopped clobbering.
      // Dragging right (positive movement) scrolls the content backward.
      scrollApiRef.current?.addScroll(-(x - drag.lastX) * DRAG_SPEED);
      drag.lastX = x;
    };

    const onDragEnd = () => {
      drag.active = false;
    };

    const onWheel = (e: WheelEvent) => {
      scrollApiRef.current?.addScroll(e.deltaY * WHEEL_SPEED);
    };

    window.addEventListener("wheel", onWheel, { passive: true });

    window.addEventListener("mousedown", onDragStart);
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd);
    document.addEventListener("mouseleave", onDragEnd);

    window.addEventListener("touchstart", onDragStart, { passive: true });
    window.addEventListener("touchmove", onDragMove, { passive: true });
    window.addEventListener("touchend", onDragEnd);

    return () => {
      window.removeEventListener("wheel", onWheel);

      window.removeEventListener("mousedown", onDragStart);
      window.removeEventListener("mousemove", onDragMove);
      window.removeEventListener("mouseup", onDragEnd);
      document.removeEventListener("mouseleave", onDragEnd);

      window.removeEventListener("touchstart", onDragStart);
      window.removeEventListener("touchmove", onDragMove);
      window.removeEventListener("touchend", onDragEnd);
    };
  }, []);

  const goToMode = (next: Mode) => {
    if (next === mode) return;

    setMode(next);

    const goingToFull = next === "full";
    scrollApiRef.current?.nudge(
      goingToFull ? SCROLL_NUDGE_MULT : -SCROLL_NUDGE_MULT,
      goingToFull ? 2 : 3,
      goingToFull ? "power2.out" : "expo.out",
    );
  };

  return (
    <div>
      {/* The buttons sit over arbitrary photo content, so they carry their own
          ground: a frosted pill keeps the dark marks legible whether a bright or
          near-black image scrolls underneath. */}
      <div className="flex gap-1 fixed top-2 right-4 z-999 p-1 bg-white/5 supports-backdrop-filter:bg-white/5 supports-backdrop-filter:backdrop-blur-sm ring-1 ring-black/5 ">
        <GridButton
          isActive={mode === "grid"}
          onClick={() => goToMode("grid")}
        />
        <RowButton
          isActive={mode === "full"}
          onClick={() => goToMode("full")}
        />
      </div>

      <InfiniteRow ref={scrollApiRef} mode={mode} isVisible={false} />
      <Webgl api={scrollApiRef} mode={mode} />
    </div>
  );
}
