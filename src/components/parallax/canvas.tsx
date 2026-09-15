import React, { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import { Experience } from "./experience";
import { DomApi } from "@/app/parallax/page";

interface IProps {
  domApi: RefObject<DomApi | null>;
}

export function ParallaxCanvas(props: IProps) {
  const { domApi } = props;

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 100], zoom: 1, near: 0.1, far: 1000 }}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9,
      }}
    >
      <Stats />
      <Experience domApi={domApi} />
      {/* <OrbitControls /> */}
    </Canvas>
  );
}
