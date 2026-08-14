"use client";
import React, { useRef, useState } from "react";
import { animate } from "motion";

const box =
  "M 15,5 L 45,5 C 50.52,5 55,9.48 55,15 L 55,45 C 55,50.52 50.52,55 45,55 L 15,55 C 9.48,55 5,50.52 5,45 L 5,15 C 5,9.48 9.48,5 15,5 Z";

const boxSquished =
  "M 15,8 L 45,8 C 50.52,8 52,12.48 52,18 L 52,42 C 52,47.52 50.52,52 45,52 L 15,52 C 9.48,52 8,47.52 8,42 L 8,18 C 8,12.48 9.48,8 15,8 Z";

const checkHidden =
  "M 14,30 L 14,30 L 14,30";

const checkPartial =
  "M 14,30 L 24,40 L 24,40";

const checkFull =
  "M 14,30 L 24,40 L 46,18";

const MorphCheckbox = () => {
  const [checked, setChecked] = useState(false);
  const boxRef = useRef<SVGPathElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const isAnimating = useRef(false);

  const animateCheck = async (toChecked: boolean) => {
    if (!boxRef.current || !checkRef.current || isAnimating.current) return;
    isAnimating.current = true;

    if (toChecked) {
      await animate(boxRef.current, { d: boxSquished, fill: "#4ade80" }, { duration: 0.12, ease: "easeIn" }).finished;
      animate(boxRef.current, { d: box }, { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] });
      animate(checkRef.current, { opacity: 1 }, { duration: 0.05 });
      await animate(checkRef.current, { d: checkPartial }, { duration: 0.1, ease: "easeOut" }).finished;
      await animate(checkRef.current, { d: checkFull }, { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }).finished;
    } else {
      await animate(checkRef.current, { d: checkPartial }, { duration: 0.1, ease: "easeIn" }).finished;
      animate(checkRef.current, { d: checkHidden, opacity: 0 }, { duration: 0.1, ease: "easeIn" });
      await animate(boxRef.current, { d: boxSquished, fill: "#e2e8f0" }, { duration: 0.12, ease: "easeIn" }).finished;
      await animate(boxRef.current, { d: box }, { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }).finished;
    }

    isAnimating.current = false;
  };

  const handleChange = () => {
    const next = !checked;
    setChecked(next);
    animateCheck(next);
  };

  return (
    <div className="relative cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
      />
      <svg viewBox="0 0 60 60" width="120" height="120">
        <path ref={boxRef} d={box} fill="#e2e8f0" />
        <path
          ref={checkRef}
          d={checkHidden}
          fill="none"
          stroke="white"
          opacity="0"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default MorphCheckbox;
