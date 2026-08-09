"use client";
import React, { useRef } from "react";
import { OrbitControls, shaderMaterial, useTexture } from "@react-three/drei";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import vertexShader from "../../shaders/shimmer/vertex.glsl";
import fragmentShader from "../../shaders/shimmer/fragment.glsl";

export const CardMaterial = shaderMaterial(
  {
    uTexture: null,
    uDirection: 0,
    uProgress: 0,
    uTime: 0,
    uRefract: 0.06,
    uBrightness: 1,
  },
  vertexShader,
  fragmentShader,
);

const CARD_WIDTH = 7;

extend({ CardMaterial });

function Experience() {
  const { direction, progress, refract, brightness } = useControls({
    direction: {
      min: 0,
      max: 1,
      value: 0,
      step: 0.01,
      label: "Direction (0=vert, 0.5=45°, 1=horiz)",
    },
    progress: {
      min: 0,
      max: 1,
      value: 0,
      step: 0.01,
    },
    refract: {
      min: 0,
      max: 2,
      value: 0.1,
      step: 0.005,
      label: "Distortion",
    },
    brightness: {
      min: 0,
      max: 3,
      value: 1,
      step: 0.05,
      label: "Brightness",
    },
  });

  const matRef = useRef<any>(null);

  useFrame((state) => {
    if (matRef.current) {
      const elapsedTime = state.clock.elapsedTime;

      matRef.current.uniforms.uTime.value = elapsedTime;
      // matRef.current.uniforms.uProgress.value = (elapsedTime * 0.25) % 1.5;
    }
  });

  const [texture] = useTexture([
    "https://cdn.cosmos.so/0b645789-a162-4764-932e-cd2d069eb993?format=webp&w=2048",
  ]);

  const image = texture?.source?.data as
    | HTMLImageElement
    | ImageBitmap
    | undefined;

  const aspectRatio =
    image?.width && image?.height ? image.width / image.height : 1;

  return (
    <mesh>
      <planeGeometry args={[CARD_WIDTH * aspectRatio, CARD_WIDTH]} />
      {/* @ts-ignore */}
      <cardMaterial
        ref={matRef}
        uTexture={texture}
        uDirection={direction}
        uProgress={progress}
        uRefract={refract}
        uBrightness={brightness}
      />
    </mesh>
  );
}

export default function Page() {
  return (
    <div className="w-full h-screen bg-white">
      <Leva hidden={false} />
      <Canvas>
        <OrbitControls />

        <Experience />
      </Canvas>
    </div>
  );
}
