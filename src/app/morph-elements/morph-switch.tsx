"use client";
import React, { useRef, useState } from "react";
import { animate } from "motion";

const circleLeft =
  "M 25,22 C 34.94,22 43,30.06 43,40 C 43,49.94 34.94,58 25,58 C 15.06,58 7,49.94 7,40 C 7,30.06 15.06,22 25,22 Z";

const stretched =
  "M 25,22 C 50,22 83,30.06 83,40 C 83,49.94 50,58 25,58 C 15.06,58 7,49.94 7,40 C 7,30.06 15.06,22 25,22 Z";

const circleRight =
  "M 65,22 C 74.94,22 83,30.06 83,40 C 83,49.94 74.94,58 65,58 C 55.06,58 47,49.94 47,40 C 47,30.06 55.06,22 65,22 Z";

const stretchedReverse =
  "M 65,22 C 74.94,22 83,30.06 83,40 C 83,49.94 74.94,58 65,58 C 40,58 7,49.94 7,40 C 7,30.06 40,22 65,22 Z";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const getNudgeRight = (t: number) => {
  const h = lerp(34.94, 42, t);
  const e = lerp(43, 58, t);
  return `M 25,22 C ${h},22 ${e},30.06 ${e},40 C ${e},49.94 ${h},58 25,58 C 15.06,58 7,49.94 7,40 C 7,30.06 15.06,22 25,22 Z`;
};

const getNudgeLeft = (t: number) => {
  const h = lerp(55.06, 48, t);
  const e = lerp(47, 32, t);
  return `M 65,22 C 74.94,22 83,30.06 83,40 C 83,49.94 74.94,58 65,58 C ${h},58 ${e},49.94 ${e},40 C ${e},30.06 ${h},22 65,22 Z`;
};

const MorphSwitch = ({ morphEnabled = true }: { morphEnabled?: boolean }) => {
  const [checked, setChecked] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const trackRef = useRef<SVGRectElement>(null);
  const isAnimating = useRef(false);
  const isNudged = useRef(false);
  const lastNudgePath = useRef<string | null>(null);

  const handleHover = (e: React.MouseEvent<HTMLInputElement>) => {
    if (!morphEnabled) return;
    if (isAnimating.current || !pathRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const onOppositeSide = checked ? x < 0.5 : x > 0.5;

    if (onOppositeSide) {
      isNudged.current = true;
      const t = checked ? 1 - x * 2 : (x - 0.5) * 2;
      const clamped = Math.max(0, Math.min(1, t));
      const nudgePath = checked ? getNudgeLeft(clamped) : getNudgeRight(clamped);
      lastNudgePath.current = nudgePath;
      pathRef.current.setAttribute("d", nudgePath);
    } else if (isNudged.current) {
      isNudged.current = false;
      animate(pathRef.current, { d: checked ? circleRight : circleLeft }, { duration: 0.15 });
    }
  };

  const handleHoverEnd = () => {
    if (!morphEnabled) return;
    if (isAnimating.current || !pathRef.current || !isNudged.current) return;
    isNudged.current = false;
    const restPath = checked ? circleRight : circleLeft;
    const from = lastNudgePath.current || restPath;
    animate(pathRef.current, { d: [from, restPath] }, { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] });
    lastNudgePath.current = null;
  };

  const animateSwitch = async (toChecked: boolean) => {
    if (!pathRef.current || !trackRef.current || isAnimating.current) return;

    if (!morphEnabled) {
      isAnimating.current = true;
      animate(trackRef.current, { fill: toChecked ? "#4ade80" : "#e2e8f0" }, { duration: 0.4 });
      await animate(pathRef.current, { d: toChecked ? circleRight : circleLeft }, { duration: 0.35, ease: [0.4, 0, 0.2, 1] }).finished;
      isAnimating.current = false;
      return;
    }

    isAnimating.current = true;
    isNudged.current = false;

    animate(trackRef.current, { fill: toChecked ? "#4ade80" : "#e2e8f0" }, { duration: 0.4 });

    if (toChecked) {
      await animate(pathRef.current, { d: stretched }, { duration: 0.2, ease: "easeIn" }).finished;
      await animate(pathRef.current, { d: circleRight }, { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }).finished;
    } else {
      await animate(pathRef.current, { d: stretchedReverse }, { duration: 0.2, ease: "easeIn" }).finished;
      await animate(pathRef.current, { d: circleLeft }, { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }).finished;
    }

    isAnimating.current = false;
  };

  const handleChange = () => {
    const next = !checked;
    setChecked(next);
    animateSwitch(next);
  };

  return (
    <div className="relative cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        onMouseMove={handleHover}
        onMouseLeave={handleHoverEnd}
        className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
      />
      <svg viewBox="-5 0 100 80" width="200" height="160">
        <rect ref={trackRef} x="5" y="20" width="80" height="40" rx="20" fill="#e2e8f0" />
        <path ref={pathRef} d={circleLeft} fill="white" />
      </svg>
    </div>
  );
};

export default MorphSwitch;
