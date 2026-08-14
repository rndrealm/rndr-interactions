"use client";

import React, { useRef, useState } from "react";
import { animate } from "motion";
import { SidebarLinks } from "@/lib/static";
import { Help, Search, Settings, Out } from "@/components/icons/sidebar";

const circle =
  "M 20,2 C 29.94,2 38,10.06 38,20 C 38,29.94 29.94,38 20,38 C 10.06,38 2,29.94 2,20 C 2,10.06 10.06,2 20,2 Z";

const squished =
  "M 20,6 C 29.94,6 38,12.06 38,20 C 38,27.94 29.94,34 20,34 C 10.06,34 2,27.94 2,20 C 2,12.06 10.06,6 20,6 Z";

const stretchedDown =
  "M 20,2 C 29.94,2 38,10.06 38,20 C 38,35.94 29.94,48 20,48 C 10.06,48 2,35.94 2,20 C 2,10.06 10.06,2 20,2 Z";

const stretchedUp =
  "M 20,-8 C 29.94,-8 38,10.06 38,20 C 38,29.94 29.94,38 20,38 C 10.06,38 2,29.94 2,20 C 2,10.06 10.06,-8 20,-8 Z";

const nudgeDown =
  "M 20,2 C 29.94,2 38,10.06 38,20 C 38,32.94 29.94,42 20,42 C 10.06,42 2,32.94 2,20 C 2,10.06 10.06,2 20,2 Z";

const nudgeUp =
  "M 20,-2 C 29.94,-2 38,10.06 38,20 C 38,29.94 29.94,38 20,38 C 10.06,38 2,29.94 2,20 C 2,10.06 10.06,-2 20,-2 Z";

const LINK_SIZE = 40;
const LINK_GAP = 8;

const getY = (index: number) => index * (LINK_SIZE + LINK_GAP);

const SidebarMorphPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const indicatorRef = useRef<SVGPathElement>(null);
  const isAnimating = useRef(false);
  const isNudged = useRef(false);
  const currentY = useRef(getY(0));

  const handleHover = (index: number) => {
    if (isAnimating.current || !indicatorRef.current || index === activeIndex) return;
    if (!isNudged.current) {
      isNudged.current = true;
      const nudgeShape = index > activeIndex ? nudgeDown : nudgeUp;
      animate(indicatorRef.current, { d: nudgeShape }, { duration: 0.15 });
    }
  };

  const handleHoverEnd = () => {
    if (isAnimating.current || !indicatorRef.current || !isNudged.current) return;
    isNudged.current = false;
    animate(indicatorRef.current, { d: circle }, { duration: 0.15 });
  };

  const handleClick = async (index: number) => {
    if (index === activeIndex || isAnimating.current || !indicatorRef.current) return;
    isAnimating.current = true;
    isNudged.current = false;

    const movingDown = index > activeIndex;
    const toY = getY(index);

    await animate(indicatorRef.current, { d: squished }, { duration: 0.1, ease: "easeIn" }).finished;

    animate(indicatorRef.current, { d: movingDown ? stretchedDown : stretchedUp }, { duration: 0.15, ease: "easeOut" });
    await animate(indicatorRef.current, { y: toY }, { duration: 0.3, ease: [0.42, 0, 0.58, 1] }).finished;

    currentY.current = toY;

    await animate(indicatorRef.current, { d: squished }, { duration: 0.08, ease: "easeOut" }).finished;
    await animate(indicatorRef.current, { d: circle }, { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }).finished;

    setActiveIndex(index);
    isAnimating.current = false;
  };

  const pageLabels = ["Home", "Gallery", "VR", "Stats", "Notifications"];

  return (
    <>
      <div className="bg-[#252525] w-14 h-full">
        <aside className="p-4 flex flex-col justify-between h-full">
          <div className="flex flex-col items-center gap-16">
            <div className="w-8 h-8"></div>
            <button>
              <Search color="#868686" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-2 relative">
            <svg
              viewBox="0 0 40 40"
              className="absolute left-1/2 -translate-x-1/2 top-0"
              style={{ width: 40, height: 40, overflow: "visible" }}
            >
              <path
                ref={indicatorRef}
                d={circle}
                fill="#2D2D2D"
                style={{ transform: `translateY(${getY(0)}px)` }}
              />
            </svg>
            {SidebarLinks.map((link, i) => {
              const active = i === activeIndex;
              const activeColor = active ? "#C2C2C2" : "#868686";
              return (
                <button
                  key={i}
                  onClick={() => handleClick(i)}
                  onMouseEnter={() => handleHover(i)}
                  onMouseLeave={handleHoverEnd}
                  className="w-10 h-10 flex items-center justify-center bg-transparent relative cursor-pointer"
                >
                  {link.icon(activeColor)}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-[7px]">
              <Help color="#f4f4f4" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-[7px]">
              <Settings color="#f4f4f4" />
            </button>
            <button
              title="Logout"
              className="w-10 h-10 flex items-center justify-center rounded-[7px]"
            >
              <Out color="#f4f4f4" />
            </button>
          </div>
        </aside>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#868686] text-lg">{pageLabels[activeIndex]}</p>
      </div>
    </>
  );
};

export default SidebarMorphPage;
