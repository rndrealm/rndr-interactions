"use client";
import React, { useRef, useState } from "react";
import { animate } from "motion";

const ringOuter =
  "M 30,5 C 43.81,5 55,16.19 55,30 C 55,43.81 43.81,55 30,55 C 16.19,55 5,43.81 5,30 C 5,16.19 16.19,5 30,5 Z";

const dotHidden =
  "M 30,30 C 30,30 30,30 30,30 C 30,30 30,30 30,30 C 30,30 30,30 30,30 C 30,30 30,30 30,30 Z";

const dotOvershoot =
  "M 30,15 C 38.28,15 45,21.72 45,30 C 45,38.28 38.28,45 30,45 C 21.72,45 15,38.28 15,30 C 15,21.72 21.72,15 30,15 Z";

const dotFull =
  "M 30,17 C 37.18,17 43,22.82 43,30 C 43,37.18 37.18,43 30,43 C 22.82,43 17,37.18 17,30 C 17,22.82 22.82,17 30,17 Z";

const ringPulse =
  "M 30,3 C 44.91,3 57,15.09 57,30 C 57,44.91 44.91,57 30,57 C 15.09,57 3,44.91 3,30 C 3,15.09 15.09,3 30,3 Z";

const MorphRadio = () => {
  const [selected, setSelected] = useState(false);
  const ringRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGPathElement>(null);
  const isAnimating = useRef(false);

  const animateRadio = async (toSelected: boolean) => {
    if (!ringRef.current || !dotRef.current || isAnimating.current) return;
    isAnimating.current = true;

    if (toSelected) {
      animate(ringRef.current, { d: ringPulse, stroke: "#4ade80" }, { duration: 0.15, ease: "easeOut" });
      await animate(dotRef.current, { d: dotOvershoot, fill: "#4ade80" }, { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }).finished;
      animate(ringRef.current, { d: ringOuter }, { duration: 0.2, ease: "easeOut" });
      await animate(dotRef.current, { d: dotFull }, { duration: 0.15, ease: "easeOut" }).finished;
    } else {
      animate(ringRef.current, { stroke: "#cbd5e1" }, { duration: 0.3 });
      await animate(dotRef.current, { d: dotOvershoot }, { duration: 0.1, ease: "easeIn" }).finished;
      await animate(dotRef.current, { d: dotHidden, fill: "#cbd5e1" }, { duration: 0.2, ease: "easeIn" }).finished;
    }

    isAnimating.current = false;
  };

  const handleChange = () => {
    const next = !selected;
    setSelected(next);
    animateRadio(next);
  };

  return (
    <div className="relative cursor-pointer">
      <input
        type="checkbox"
        checked={selected}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
      />
      <svg viewBox="0 0 60 60" width="120" height="120">
        <path
          ref={ringRef}
          d={ringOuter}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="3"
        />
        <path
          ref={dotRef}
          d={dotHidden}
          fill="#cbd5e1"
        />
      </svg>
    </div>
  );
};

export default MorphRadio;
