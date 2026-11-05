"use client";
import React from "react";
import { MotionConfig } from "motion/react";

// Motion's own layout and transform animations (the sliding mode pills, the
// picture-in-picture morph) follow the OS reduced motion setting. Animations
// started with animate() aren't covered; the demos handle those themselves.
export function IosMotionConfig(props: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{props.children}</MotionConfig>;
}
