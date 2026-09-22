"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { lerpFactor } from "@/lib/helper/animation";

const IMAGES = [
  "https://cdn.cosmos.so/7b93e7f7-8e29-4562-981a-a61f3b27a3d2?format=webp",
  "https://cdn.cosmos.so/365fd74b-5d3b-495c-9d12-ef4fcf99b9a8?format=webp",
  "https://cdn.cosmos.so/28434494-55ef-4f49-a9c3-f74de603c313?format=webp",
  "https://cdn.cosmos.so/ff1029b3-c08a-47fb-a436-d16d88a3773e?format=webp&w=2048",
  "https://cdn.cosmos.so/6e6401e1-b172-4cc8-a696-dcf783241bb2?format=webp",
  "https://cdn.cosmos.so/88ba8b97-6ed7-4a89-8238-72ea9e2a4a19?format=webp",
  "https://cdn.cosmos.so/18cb2fa2-5445-4b4c-8023-b49c7930a8fd?format=webp&w=2048",
  "https://cdn.cosmos.so/bade8c5e-d0e8-40da-9d22-86df4e814de5?format=webp",
  "https://cdn.cosmos.so/80dd635c-3f0f-42dc-9fa9-5f5a9d70e651?format=webp",
  "https://cdn.cosmos.so/7a18c8dd-2d81-431d-8d00-f4e8a4b8f86d?format=webp",
];

// const boxPosition = [
//   { id: 0, x: 71, y: 58, w: 400, h: 270 },
//   { id: 1, x: 211, y: 255, w: 540, h: 360 },
//   { id: 2, x: 631, y: 158, w: 400, h: 270 },
//   { id: 3, x: 1191, y: 245, w: 260, h: 195 },
//   { id: 4, x: 351, y: 687, w: 260, h: 290 },
//   { id: 5, x: 751, y: 824, w: 205, h: 154 },
//   { id: 6, x: 911, y: 540, w: 260, h: 350 },
//   { id: 7, x: 1051, y: 803, w: 400, h: 300 },
//   { id: 8, x: 71, y: 922, w: 350, h: 260 },
// ];

// const originalSize = { w: 1522, h: 1238 };

const boxPosition = [
  { id: 0, x: 458, y: 353, w: 340, h: 230, color: "#737373" },
  { id: 1, x: 758, y: 68, w: 460, h: 310, color: "#c2c2c2" },
  { id: 2, x: 569, y: 610, w: 300, h: 300, color: "#e0e0e0" },
  { id: 3, x: 895, y: 631, w: 400, h: 270, color: "#a3a3a3" },
  { id: 4, x: 189, y: 872, w: 420, h: 280, color: "#8a8a8a" },
  { id: 5, x: 88, y: 422, w: 200, h: 300, color: "#3d3d3d" },
  { id: 6, x: 464, y: 87, w: 260, h: 260, color: "#2e2e2e" },
  { id: 7, x: 1270, y: 339, w: 220, h: 330, color: "#1f1f1f" },
  { id: 8, x: 674, y: 911, w: 340, h: 230, color: "#4d4d4d" },
  { id: 9, x: 1310, y: 682, w: 200, h: 300, color: "#5f5f5f" },
];

const originalSize = { w: 1600, h: 1200, aspectRatio: 1600 / 1200 };

const createScrollValues = () => ({
  ease: 0.06,
  current: { x: 0, y: 0 },
  target: { x: 0, y: 0 },
  last: { x: 0, y: 0 },
  delta: {
    x: {
      current: 0,
      target: 0,
    },
    y: {
      current: 0,
      target: 0,
    },
  },
});

const createDragValues = () => ({
  // the finger/mouse that owns the drag; every other pointer is ignored
  pointerId: null as number | null,
  time: 0,
  x: { start: 0, scroll: 0, last: 0, velocity: 0 },
  y: { start: 0, scroll: 0, last: 0, velocity: 0 },
});

// how far a flick is projected past the release point, in ms of travel
const FLICK_STRENGTH = 150;
// a finger that rests this long before lifting is not a flick
const FLICK_TIMEOUT = 100;
const VELOCITY_EASE = 0.3;

const MOUSE_EASE = 0.04;
const MAX_SHIFT = 11.538;

function clamp(min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}

type Plane = {
  element: HTMLElement;
  rect: { x: number; y: number; width: number; height: number };
  extraX: number;
  extraY: number;
  ease: number;
};

export default function Page() {
  const planeRefs = useRef<Plane[]>([]);
  const scaleFactor = useRef(0);
  const tileSize = useRef({ h: originalSize.h, w: originalSize.w });
  const scrollRef = useRef(createScrollValues());
  const mousePosition = useRef({
    x: {
      target: 0.5,
      current: 0.5,
    },
    y: {
      target: 0.5,
      current: 0.5,
    },
  });
  const previousTimeElapsedRef = useRef(0);
  const dragRef = useRef(createDragValues());

  useEffect(() => {
    let raf: number;
    function handleResize() {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      scaleFactor.current = Math.max(
        screenWidth / originalSize.w,
        screenHeight / originalSize.h,
      );

      scaleFactor.current = Math.max(scaleFactor.current, 0.75);

      tileSize.current = {
        h: originalSize.h * scaleFactor.current,
        w: originalSize.w * scaleFactor.current,
      };

      for (let i = 0; i < planeRefs.current.length; i++) {
        const item = planeRefs.current[i];

        const currentPlane = boxPosition[i % boxPosition.length];

        const group = Math.floor(i / boxPosition.length);
        const col = group % 2;
        const row = Math.floor(group / 2);

        const left =
          currentPlane.x * scaleFactor.current + col * tileSize.current.w;
        const top =
          currentPlane.y * scaleFactor.current + row * tileSize.current.h;
        const width = currentPlane.w * scaleFactor.current;
        const height = currentPlane.h * scaleFactor.current;

        item.rect = { x: left, y: top, width, height };
        item.extraX = 0;
        item.extraY = 0;
        item.ease = Math.random() + 1;

        item.element.style.left = `${left}px`;
        item.element.style.top = `${top}px`;
        item.element.style.width = `${width}px`;
        item.element.style.height = `${height}px`;
        // item.element.style.background = currentPlane.color;
        // item.element.style.background = "red";
      }
    }

    function handlePointerDown(e: PointerEvent) {
      const drag = dragRef.current;
      if (drag.pointerId !== null) return;

      e.preventDefault();

      drag.pointerId = e.pointerId;
      drag.time = e.timeStamp;

      drag.x.start = drag.x.last = e.clientX;
      drag.y.start = drag.y.last = e.clientY;
      drag.x.scroll = scrollRef.current.target.x;
      drag.y.scroll = scrollRef.current.target.y;
      drag.x.velocity = 0;
      drag.y.velocity = 0;
    }

    function handlePointerMove(e: PointerEvent) {
      const drag = dragRef.current;

      // a touch has no hover, so it would teleport the cursor parallax on every tap
      if (e.pointerType !== "touch") {
        mousePosition.current.x.target = e.clientX / window.innerWidth;
        mousePosition.current.y.target = e.clientY / window.innerHeight;
      }

      if (drag.pointerId !== e.pointerId) return;

      const elapsed = e.timeStamp - drag.time;
      if (elapsed > 0) {
        const velocityX = (e.clientX - drag.x.last) / elapsed;
        const velocityY = (e.clientY - drag.y.last) / elapsed;

        drag.x.velocity += (velocityX - drag.x.velocity) * VELOCITY_EASE;
        drag.y.velocity += (velocityY - drag.y.velocity) * VELOCITY_EASE;

        drag.time = e.timeStamp;
        drag.x.last = e.clientX;
        drag.y.last = e.clientY;
      }

      scrollRef.current.target.x = drag.x.scroll + (e.clientX - drag.x.start);
      scrollRef.current.target.y = drag.y.scroll + (e.clientY - drag.y.start);
    }

    // pointercancel fires instead of pointerup whenever the browser or the OS
    // claims the gesture, so both have to release the drag
    function handlePointerUp(e: PointerEvent) {
      const drag = dragRef.current;
      if (drag.pointerId !== e.pointerId) return;

      drag.pointerId = null;

      if (e.type === "pointercancel") return;
      if (e.timeStamp - drag.time > FLICK_TIMEOUT) return;

      scrollRef.current.target.x += drag.x.velocity * FLICK_STRENGTH;
      scrollRef.current.target.y += drag.y.velocity * FLICK_STRENGTH;
    }

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const factor = 0.4;

      scrollRef.current.target.x -= e.deltaX * factor;
      scrollRef.current.target.y -= e.deltaY * factor;
    }

    function tick(t: number) {
      const delta = t - previousTimeElapsedRef.current;
      previousTimeElapsedRef.current = t;

      const scroll = scrollRef.current;
      const mouse = mousePosition.current;

      const scrollEase = lerpFactor(scroll.ease, delta);
      const mouseEase = lerpFactor(MOUSE_EASE, delta);
      const scrolLDeltaEase = lerpFactor(MOUSE_EASE, delta);

      scroll.current.x += (scroll.target.x - scroll.current.x) * scrollEase;
      scroll.current.y += (scroll.target.y - scroll.current.y) * scrollEase;

      scroll.delta.x.target = scroll.current.x - scroll.last.x;
      scroll.delta.y.target = scroll.current.y - scroll.last.y;
      scroll.delta.x.current +=
        (scroll.delta.x.target - scroll.delta.x.current) * scrolLDeltaEase;
      scroll.delta.y.current +=
        (scroll.delta.y.target - scroll.delta.y.current) * scrolLDeltaEase;

      mouse.x.current += (mouse.x.target - mouse.x.current) * mouseEase;
      mouse.y.current += (mouse.y.target - mouse.y.current) * mouseEase;

      const dirX = scroll.current.x > scroll.last.x ? "right" : "left";
      const dirY = scroll.current.y > scroll.last.y ? "down" : "up";

      const spanX = tileSize.current.w * 2;
      const spanY = tileSize.current.h * 2;

      for (let i = 0; i < planeRefs.current.length; i++) {
        const item = planeRefs.current[i];

        const parallaxX =
          (-(mouse.x.current - 0.5) * item.rect.width * 0.5 -
            8 * scroll.delta.x.current * item.ease) *
          1;
        const parallaxY =
          (-(mouse.y.current - 0.5) * item.rect.height * 0.5 -
            8 * scroll.delta.y.current * item.ease) *
          1;

        const errorSpaceX = item.rect.width * 0.5;
        const errorSpaceY = item.rect.height * 0.5;

        const posX = item.rect.x + scroll.current.x + item.extraX + parallaxX;
        const posY = item.rect.y + scroll.current.y + item.extraY + parallaxY;

        const beforeX = posX > window.innerWidth + errorSpaceX;
        const afterX = posX + item.rect.width < 0 - errorSpaceX;
        if (dirX === "right" && beforeX) item.extraX -= spanX;
        if (dirX === "left" && afterX) item.extraX += spanX;

        const beforeY = posY > window.innerHeight + errorSpaceY;
        const afterY = posY + item.rect.height < 0 - errorSpaceY;
        if (dirY === "down" && beforeY) item.extraY -= spanY;
        if (dirY === "up" && afterY) item.extraY += spanY;

        const newPosX = scroll.current.x + item.extraX + parallaxX;
        const newPosY = scroll.current.y + item.extraY + parallaxY;

        const centeredX = newPosX + item.rect.x + item.rect.width * 0.5;
        const centeredY = newPosY + item.rect.y + item.rect.height * 0.5;

        const viewportCenterX = window.innerWidth * 0.5;
        const viewportCenterY = window.innerHeight * 0.5;

        const tx = (centeredX - viewportCenterX) / viewportCenterX;
        const ty = (centeredY - viewportCenterY) / viewportCenterY;

        const clampedX = clamp(-1, 1, tx);
        const clampedY = clamp(-1, 1, ty);

        const shiftX = -clampedX * MAX_SHIFT;
        const shiftY = -clampedY * MAX_SHIFT;

        const img = item.element.querySelector<HTMLElement>("[data-box]");

        item.element.style.transform = `translate(${newPosX}px, ${newPosY}px)`;
        if (img) {
          img.style.transform = `translate3d(${shiftX}%, ${shiftY}%, 0)`;
        }
        // item.element.style.transform = `translateX(${fx}px)`;
      }

      scroll.last.x = scroll.current.x;
      scroll.last.y = scroll.current.y;

      raf = requestAnimationFrame(tick);
    }

    handleResize();

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("wheel", handleWheel, { passive: false });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("wheel", handleWheel);

      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="w-full h-dvh overflow-hidden relative touch-none select-none overscroll-none">
      {Array(boxPosition.length * 4)
        .fill(0)
        .map((_, index) => {
          return (
            <div
              key={index}
              ref={(el) => {
                if (!el) return;
                planeRefs.current[index] = {
                  element: el,
                  rect: { x: 0, y: 0, width: 0, height: 0 },
                  extraX: 0,
                  extraY: 0,
                  ease: 0,
                };
              }}
              className="absolute bg-[rd]"
            >
              <div className="relative w-full h-full overflow-hidden">
                {/* {!showImage && <h1 className="text-5xl">{index + 1}</h1>} */}

                <Image
                  data-box={index}
                  src={IMAGES[index % IMAGES.length]}
                  alt="parallax"
                  fill
                  className="absolute left-[-15%]! h-[130%]! w-[130%]! max-w-none top-[-15%]! object-cover"
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}
