"use client";
import React from "react";
import { OrbitControls, shaderMaterial, Stats } from "@react-three/drei";
import { Canvas, extend } from "@react-three/fiber";
import vertexShader from "../../shaders/color-mix/vertex.glsl";
import fragmentShader from "../../shaders/color-mix/fragment.glsl";
import { Color, Vector3 } from "three";
import { useControls } from "leva";

export const CardMaterial = shaderMaterial(
  {
    uColorA: new Vector3(0),
    uColorB: new Vector3(0),
    uColorProgressAB: 0,
    uColorProgressABC: 0,
    uEdgeX1: 0,
    uEdgeX2: 0.9,
    uEdgeY1: 0,
    uEdgeY2: 0.5,
  },
  vertexShader,
  fragmentShader,
);

extend({ CardMaterial });

const colorMap = {
  dark: {
    a: "#070707",
    b: "#fff",
  },
  light: {
    a: "#4c9eff",
    b: "#c893ff",
  },
};

function Experience() {
  const {
    theme,
    colorProgressAB,
    colorProgressABC,
    edgeX1,
    edgeX2,
    edgeY1,
    edgeY2,
  } = useControls({
    theme: {
      options: ["dark", "light"],
      value: "dark",
    },
    colorProgressAB: {
      label: "color progress AB",
      value: 0,
      min: 0,
      max: 1,
      step: 0.1,
    },
    colorProgressABC: {
      label: "color progress ABC",
      value: 0,
      min: 0,
      max: 1,
      step: 0.1,
    },
    edgeX1: {
      label: "edge X1",
      value: 0,
      min: 0,
      max: 1,
      step: 0.01,
    },
    edgeX2: {
      label: "edge X2",
      value: 0.9,
      min: 0,
      max: 1,
      step: 0.01,
    },
    edgeY1: {
      label: "edge Y1",
      value: 0,
      min: 0,
      max: 1,
      step: 0.01,
    },
    edgeY2: {
      label: "edge Y2",
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
    },
  });
  const currentColor = colorMap[theme];

  const colorA = new Color(currentColor.a);
  const colorB = new Color(currentColor.b);

  return (
    <mesh>
      <planeGeometry args={[4, 4]} />
      {/* @ts-ignore */}
      <cardMaterial
        uColorA={new Vector3(colorA.r, colorA.g, colorA.b)}
        uColorB={new Vector3(colorB.r, colorB.g, colorB.b)}
        uColorProgressAB={colorProgressAB}
        uColorProgressABC={colorProgressABC}
        uEdgeX1={edgeX1}
        uEdgeX2={edgeX2}
        uEdgeY1={edgeY1}
        uEdgeY2={edgeY2}
      />
    </mesh>
  );
}

export default function Page() {
  return (
    <Canvas
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <Stats />

      <OrbitControls />

      <Experience />
    </Canvas>
  );
}
