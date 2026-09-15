"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";

export const IMAGE_ULRS = [
  "https://cdn.cosmos.so/d30a3e35-6a3c-4a23-b823-effe0e80fbf9?format=webp",
  "https://cdn.cosmos.so/f33d7d1d-997d-4c49-93b4-d1d20c610f0e?format=webp",
  "https://cdn.cosmos.so/06dc9e29-0169-4aa8-93c4-6358e699697a?format=webp&w=2048",
  // "https://cdn.cosmos.so/db19e8e8-a51a-487f-9c7a-cf7d6037f1ae?format=webp",
  "https://cdn.cosmos.so/b5cf435b-1c1a-4abb-965a-42f707474f16?format=webp",
  // "https://cdn.cosmos.so/49118378-5024-4b0b-bf66-31625d00a409?format=webp",
  // "https://cdn.cosmos.so/d266936b-22ab-4781-8612-63f6b9bd2cd7?format=webp",
];

function lerp(start: number, end: number, factor: number): number {
  return start * (1 - factor) + end * factor;
}

function clamp(min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}

const DEFAULT_SCROLL_INFO = {
  current: 0,
  target: 0,
  ease: 0.07,
  limit: 0,
};

const MAX_SHIFT = 16.67;

export default function Page() {
  const scrollInfo = useRef({ ...DEFAULT_SCROLL_INFO });
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const timeElapsedRef = useRef(0);
  const screenDimension = useRef({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    let raf: number;
    function handleWheel(e: WheelEvent) {
      scrollInfo.current.target += e.deltaY;
    }

    function measure() {
      console.log(imagesRef.current);

      screenDimension.current = {
        height: window.innerHeight,
        width: window.innerWidth,
      };

      if (pageContainerRef.current && contentContainerRef.current) {
        scrollInfo.current.limit = Math.max(
          0,
          contentContainerRef.current.scrollHeight -
            pageContainerRef.current.clientHeight,
        );
      }
    }

    function applyParallax() {
      const viewportCenter = screenDimension.current.height * 0.5;

      for (let i = 0; i < imagesRef.current.length; i++) {
        const image = imagesRef.current[i];
        const parentElement = image.parentElement;
        if (!parentElement) return;

        const rect = parentElement.getBoundingClientRect();
        const elementCenter = rect.top + rect.height * 0.5;

        const t = (elementCenter - viewportCenter) / viewportCenter;
        const clamped = clamp(-1, 1, t);

        const shift = -clamped * MAX_SHIFT;

        image.style.transform = `translate3d(0, ${shift}%, 0)`;
      }
    }

    function tick(t: number) {
      const currentDelta = t - timeElapsedRef.current;
      timeElapsedRef.current = t;

      scrollInfo.current.target = clamp(
        0,
        scrollInfo.current.limit,
        scrollInfo.current.target,
      );

      scrollInfo.current.current = lerp(
        scrollInfo.current.current,
        scrollInfo.current.target,
        scrollInfo.current.ease,
        // currentDelta * 0.05,
      );

      if (contentContainerRef.current) {
        const scroll =
          scrollInfo.current.current < 0.01 ? 0 : -scrollInfo.current.current;
        contentContainerRef.current.style.transform = `translateY(${scroll}px)`;
      }

      applyParallax();
      // console.log("i run every frame");

      raf = requestAnimationFrame(tick);
    }

    measure();

    const observer = new ResizeObserver(measure);
    if (pageContainerRef.current) observer.observe(pageContainerRef.current);
    if (contentContainerRef.current)
      observer.observe(contentContainerRef.current);

    window.addEventListener("wheel", handleWheel);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={pageContainerRef} className="h-screen w-full overflow-hidden">
      <div
        ref={contentContainerRef}
        className="flex flex-col items-center gap-10 py-[20vh] will-change-transform"
      >
        {Array(8)
          .fill(0)
          .map((_, index) => {
            return (
              <div
                key={index}
                className="max-w-200 w-full h-[60vh] relative overflow-hidden will-change-transform"
              >
                <Image
                  ref={(el) => {
                    if (el) {
                      imagesRef.current[index] = el;
                    }
                  }}
                  src={IMAGE_ULRS[index % IMAGE_ULRS.length]}
                  alt="parallax"
                  fill
                  className="absolute left-0 right-0 h-[150%]! top-[-25%]! object-cover"
                />
              </div>
            );
          })}
        {/* <div className="max-w-200 w-full h-[60vh] bg-[blue]"></div>
        <div className="max-w-200 w-full h-[60vh] bg-[yellow]"></div>
        <div className="max-w-200 w-full h-[60vh] bg-[green]"></div> */}
      </div>
    </div>
  );
}
