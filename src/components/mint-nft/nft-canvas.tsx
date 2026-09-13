"use client";
import React, { Fragment, useRef } from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  shaderMaterial,
  Stats,
  useTexture,
} from "@react-three/drei";
import vertexShader from "../../shaders/mint-nft/vertex.glsl";
import fragmentShader from "../../shaders/mint-nft/fragment.glsl";
import { Leva, useControls } from "leva";
import { Vector2, Vector3 } from "three";
import { SWEEPS, useMintProgress } from "./mint-progress";
import type { MotionValue } from "motion/react";

/**
 * Cosine-gradient coefficients for `pal()` in the fragment shader:
 * colour = a + b * cos(2PI * (c * t + d)). `c` is the hue frequency — the
 * lower it is, the narrower the range of hues a sweep travels through.
 */
const PALETTES = {
  iridescent: {
    a: new Vector3(0.5, 0.5, 0.5),
    b: new Vector3(0.5, 0.5, 0.5),
    c: new Vector3(1.0, 1.0, 1.0),
    d: new Vector3(0.0, 0.1, 0.2),
  },
  copper: {
    a: new Vector3(0.5, 0.4, 0.35),
    b: new Vector3(0.55, 0.45, 0.4),
    c: new Vector3(1.0, 1.0, 1.0),
    d: new Vector3(0.0, 0.15, 0.25),
  },
  steel: {
    a: new Vector3(0.2, 0.4, 0.55),
    b: new Vector3(0.2, 0.35, 0.45),
    c: new Vector3(1.0, 1.0, 1.0),
    d: new Vector3(0.55, 0.6, 0.65),
  },
  ember: {
    a: new Vector3(0.5, 0.5, 0.5),
    b: new Vector3(0.5, 0.5, 0.5),
    c: new Vector3(2.0, 1.0, 0.0),
    d: new Vector3(0.5, 0.2, 0.25),
  },
  // Narrow hue sweep — reads as light on a metal surface rather than a rainbow.
  pearl: {
    a: new Vector3(0.5, 0.5, 0.5),
    b: new Vector3(0.5, 0.5, 0.5),
    c: new Vector3(0.2, 0.2, 0.2),
    d: new Vector3(0.0, 0.1, 0.2),
  },
  // Identical coefficients per channel, so the band never leaves greyscale.
  mono: {
    a: new Vector3(0.5, 0.5, 0.5),
    b: new Vector3(0.5, 0.5, 0.5),
    c: new Vector3(1.0, 1.0, 1.0),
    d: new Vector3(0.0, 0.0, 0.0),
  },
} as const;

type PaletteName = keyof typeof PALETTES;

export const NftMaterial = shaderMaterial(
  {
    uTexture: null,
    uDirection: 0,
    uProgress: 0,
    uTime: 0,
    uRefract: 0.06,
    uSweeps: 3,
    uPalA: new Vector3(),
    uPalB: new Vector3(),
    uPalC: new Vector3(),
    uPalD: new Vector3(),
    uBrightness: 1,
    uPlaneSize: new Vector2(),
    uImageSize: new Vector2(),
  },
  vertexShader,
  fragmentShader,
);

extend({ NftMaterial });

function Experience({ progress }: { progress: MotionValue<number> }) {
  const { width, height } = useThree((state) => state.viewport);

  const matRef = useRef<any>(null);

  const { direction, refract, brightness, palette, scrub, scrubProgress } =
    useControls({
      direction: {
        min: 0,
        max: 1,
        value: 1,
        step: 0.01,
        label: "Direction (0=vert, 0.5=45°, 1=horiz)",
      },
      refract: {
        min: 0,
        max: 2,
        value: 0.56,
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
      palette: {
        value: "iridescent" as PaletteName,
        options: Object.keys(PALETTES) as PaletteName[],
        label: "Palette",
      },
      scrub: {
        value: false,
        label: "Scrub progress",
      },
      scrubProgress: {
        min: 0,
        max: SWEEPS,
        value: 0,
        step: 0.01,
        label: "Progress",
      },
    });

  const pal = PALETTES[palette];

  const [texture] = useTexture([
    // "https://cdn.cosmos.so/0b645789-a162-4764-932e-cd2d069eb993?format=webp&w=2048",
    // "https://cdn.cosmos.so/cfd8ee19-fcc0-472b-8683-29d6619687a2?format=webp",
    "https://cdn.cosmos.so/c924d205-4ffd-4c58-9fcb-4f50de696b54?format=webp",
  ]);

  const image = texture?.source?.data as
    | HTMLImageElement
    | ImageBitmap
    | undefined;

  useFrame((state) => {
    if (matRef.current) {
      const elapsedTime = state.clock.elapsedTime;

      matRef.current.uniforms.uTime.value = elapsedTime;
      // Read per frame rather than as a prop: the mint sequence animates this
      // outside React, so the canvas never re-renders while it runs. The leva
      // slider takes over only when Scrub is on — the real mint drives it
      // otherwise.
      matRef.current.uniforms.uProgress.value = scrub
        ? scrubProgress
        : progress.get();
    }
  });

  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      {/* @ts-ignore */}
      <nftMaterial
        ref={matRef}
        uTexture={texture}
        uDirection={direction}
        uProgress={progress}
        uRefract={refract}
        uSweeps={SWEEPS}
        uPalA={pal.a}
        uPalB={pal.b}
        uPalC={pal.c}
        uPalD={pal.d}
        uBrightness={brightness}
        uPlaneSize={new Vector2(width, height)}
        uImageSize={new Vector2(image?.width, image?.height)}
      />
      {/* <meshBasicMaterial color={"red"} /> */}
    </mesh>
  );
}

export function NftCanvas() {
  // Read outside <Canvas>: r3f renders into its own reconciler, so the value
  // crosses as a prop rather than through context.
  const { progress } = useMintProgress();

  return (
    <Fragment>
      <Leva hidden={false} />
      <Canvas className="w-full h-full">
        {/* <Stats /> */}
        <Experience progress={progress} />
        {/* <OrbitControls /> */}
      </Canvas>
    </Fragment>
  );
}
