import React from "react";
import { Canvas } from "@react-three/fiber";
import { Experience } from "./experience";
import { ScrollApi } from "./infinite-row";
import { Stats } from "@react-three/drei";
import { Mode } from "@/app/photoyoshi/page";

interface IProps {
  api: React.RefObject<ScrollApi | null>;
  mode: Mode;
}

export function Webgl(props: IProps) {
  const { api, mode } = props;

  return (
    <Canvas
      // orthographic at zoom 1 makes one world unit exactly one CSS pixel,
      // which is what lets the planes sit on the DOM boxes with no projection
      // maths. Any camera control would break that mapping, so there is none.
      orthographic
      camera={{ position: [0, 0, 100], zoom: 1, near: 0.1, far: 1000 }}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 99,
      }}
    >
      {/* <Stats /> */}
      <Experience api={api} mode={mode} />
    </Canvas>
  );
}
