"use client";
import React, { useEffect, useRef, useState } from "react";
import { OrbitControls, shaderMaterial, useTexture } from "@react-three/drei";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import vertexShader from "../../shaders/shimmer-v2/vertex.glsl";
import fragmentShader from "../../shaders/shimmer-v2/fragment.glsl";

// Distinct name from /shimmer's CardMaterial — extend() writes into a global
// R3F catalogue, so reusing the key would let whichever page mounted last
// overwrite the other's material.
export const CardMaterialV2 = shaderMaterial(
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

// Seconds for one fired sweep. uProgress 0->1 is a full pass: the shader maps
// it from -0.3 to span+0.3 and fades the band out at both ends, so the card is
// back to rest when it lands.
const SWEEP_DURATION = 1.4;

extend({ CardMaterialV2 });

function Experience({ fireSignal }: { fireSignal: number }) {
  const { direction, progress, refract, brightness, loop, duration, gap } =
    useControls({
      loop: {
        value: true,
        label: "Loop",
      },
      duration: {
        min: 0.2,
        max: 6,
        value: SWEEP_DURATION,
        step: 0.05,
        label: "Sweep duration (s)",
      },
      gap: {
        min: 0,
        max: 4,
        value: 0.4,
        step: 0.05,
        label: "Loop gap (s)",
      },
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
  // Start time of the running sweep, or null when idle. `pending` defers
  // reading the clock until the next frame, since the click handler has no
  // access to it.
  const sweepStartRef = useRef<number | null>(null);
  const pendingRef = useRef(false);
  // When the last sweep finished, so the loop can wait out `gap` before the
  // next one. Null means "no sweep has landed yet".
  const restingSinceRef = useRef<number | null>(null);

  useEffect(() => {
    if (fireSignal === 0) return; // initial mount, nothing fired yet
    pendingRef.current = true; // a re-click restarts the sweep
  }, [fireSignal]);

  useFrame((state) => {
    if (matRef.current) {
      const elapsedTime = state.clock.elapsedTime;

      matRef.current.uniforms.uTime.value = elapsedTime;

      if (pendingRef.current) {
        pendingRef.current = false;
        sweepStartRef.current = elapsedTime;
      }

      // Loop: once the gap has elapsed since the last sweep landed, fire again.
      if (loop && sweepStartRef.current === null) {
        if (restingSinceRef.current === null) {
          restingSinceRef.current = elapsedTime;
        }
        if (elapsedTime - restingSinceRef.current >= gap) {
          sweepStartRef.current = elapsedTime;
        }
      }

      if (sweepStartRef.current === null) {
        // Idle: the Leva slider owns uProgress so the sweep stays scrubbable.
        matRef.current.uniforms.uProgress.value = progress;
      } else {
        const t = (elapsedTime - sweepStartRef.current) / duration;
        if (t >= 1) {
          sweepStartRef.current = null;
          restingSinceRef.current = elapsedTime;
          matRef.current.uniforms.uProgress.value = progress;
        } else {
          matRef.current.uniforms.uProgress.value = t;
        }
      }
    }
  });

  const [texture] = useTexture([
    "https://cdn.cosmos.so/0b645789-a162-4764-932e-cd2d069eb993?format=webp&w=2048",
  ]);

  const image = texture?.source?.data as
    HTMLImageElement | ImageBitmap | undefined;

  const aspectRatio =
    image?.width && image?.height ? image.width / image.height : 1;

  return (
    <mesh>
      <planeGeometry args={[CARD_WIDTH * aspectRatio, CARD_WIDTH]} />
      {/* @ts-ignore */}
      <cardMaterialV2
        ref={matRef}
        uTexture={texture}
        uDirection={direction}
        uRefract={refract}
        uBrightness={brightness}
      />
    </mesh>
  );
}

export default function Page() {
  const [fireSignal, setFireSignal] = useState(0);

  return (
    <div className="relative w-full h-screen bg-white">
      <Leva hidden={false} />
      <Canvas>
        <OrbitControls />

        <Experience fireSignal={fireSignal} />
      </Canvas>

      <button
        type="button"
        onClick={() => setFireSignal((n) => n + 1)}
        // h-9 = 36px tall, text-sm = 14px
        className="absolute bottom-10 left-1/2 -translate-x-1/2 h-9 text-sm px-4 rounded-lg bg-black text-white font-medium tracking-tight transition-colors hover:bg-neutral-800 active:bg-neutral-700"
      >
        Shimmer
      </button>
    </div>
  );
}
