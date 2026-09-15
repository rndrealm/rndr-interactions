"use client";
import React, { useRef } from "react";
import { ParallaxDom } from "@/components/parallax/dom";
import { ParallaxCanvas } from "@/components/parallax/canvas";
import { Leva, useControls } from "leva";

export type PlaneInfo = {
  element: HTMLElement;
  index: number;
  rect: {
    top: number;
    left: number;
    height: number;
    width: number;
  };
};

export type DomApi = {
  planesInfo: PlaneInfo[];
};

export default function Page() {
  const domApiRef = useRef<DomApi>(null);

  const { showDom } = useControls({
    showDom: {
      value: true,
      label: "Show Dom",
    },
  });

  return (
    <div className="h-screen w-full">
      <Leva hidden={false} />
      <ParallaxDom ref={domApiRef} isVisible={showDom} />
      <ParallaxCanvas domApi={domApiRef} />
    </div>
  );
}
