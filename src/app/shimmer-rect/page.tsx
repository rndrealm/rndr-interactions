"use client";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { OrbitControls, shaderMaterial, useTexture } from "@react-three/drei";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import vertexShader from "../../shaders/shimmer-rect/vertex.glsl";
import fragmentShader from "../../shaders/shimmer-rect/fragment.glsl";

// Own name again — extend() writes into a global R3F catalogue shared with
// /shimmer and /shimmer-v2, so each page needs a distinct key.
export const CardMaterialRect = shaderMaterial(
  {
    uTexture: null,
    uDirection: 0,
    uProgress: 0,
    uTime: 0,
    uRefract: 0.06,
    uBrightness: 1,
    uWarp: 0.35,
    uSquircle: 4,
    uRadius: 1,
    uSize: new THREE.Vector2(1, 1),
  },
  vertexShader,
  fragmentShader,
);

// Card face artwork. Served with `access-control-allow-origin: *`, so
// TextureLoader's default crossOrigin="anonymous" is enough to sample it.
const TEXTURE_URL =
  "https://cdn.cosmos.so/63c55375-4814-48bf-aaaf-e29306cd8779?format=webp";
// Intrinsic size of that file. The card takes its aspect from the artwork so
// the image sits on the face uncropped and unstretched.
const TEXTURE_W_PX = 1200;
const TEXTURE_H_PX = 848;

// The squircle, in CSS pixels. Converted to world units at render time off the
// R3F viewport factor, so it holds these dimensions on screen at any size.
const RECT_W_PX = 513;
// const RECT_H_PX = 324; // credit-card 1.583:1, from the painted card face
const RECT_H_PX = RECT_W_PX * (TEXTURE_H_PX / TEXTURE_W_PX); // 1.415:1
const RADIUS_PX = 26; // 20px +30%

const SWEEP_DURATION = 1.4;

// linear-gradient(131.76deg, ...) — CSS angles run clockwise from "to top".
const CARD_GRADIENT_ANGLE = 131.76;
const CARD_GRADIENT_STOPS: [number, string][] = [
  [-0.0019, "#fbfbfb"],
  [0.3844, "#f0f0f0"],
  [0.6443, "#e3e3e3"],
  [1.1214, "#d1d1d1"],
];

// EMV chip. x/y are from the card's top-left; measured off the reference, it
// sits inset from the left edge and centred on the card's horizontal axis.
const CHIP = {
  x: 55,
  y: (RECT_H_PX - 65) / 2,
  w: 73,
  h: 65,
  r: 8,
  angle: 204.94,
  // +0.05 OKLCH lightness on both stops: 0.97 -> 1.00 (clamped at white),
  // 0.65 -> 0.70.
  stops: [
    [-0.0038, "#ffffff"],
    [2.3792, "#9e9e9e"],
  ] as [number, string][],
};

// Texture is painted at 2x so the chip's 1px edges survive on HiDPI.
const TEXTURE_SCALE = 2;

extend({ CardMaterialRect });

// CSS gradient-line geometry: centred on the box, length |W·sinA| + |H·cosA|,
// pointing (sinA, -cosA) in this y-down space. Stops outside 0..1 are handled
// by stretching the line to span them, since addColorStop rejects those.
function cssLinearGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  angleDeg: number,
  stops: [number, string][],
) {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const len = Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad));

  const first = stops[0][0];
  const last = stops[stops.length - 1][0];
  const at = (p: number) => ({
    x: x + w / 2 + dx * (p - 0.5) * len,
    y: y + h / 2 + dy * (p - 0.5) * len,
  });
  const a = at(first);
  const b = at(last);

  const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
  for (const [stop, color] of stops) {
    grad.addColorStop((stop - first) / (last - first), color);
  }
  return grad;
}

function roundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// An inset box-shadow with no blur or spread is exactly the region inside the
// shape that the shape-offset-by-(dx,dy) does not cover. Painted on its own
// layer so destination-out carves the shadow and not the card beneath it.
function paintInsetEdge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  dx: number,
  dy: number,
  color: string,
) {
  const layer = document.createElement("canvas");
  layer.width = ctx.canvas.width;
  layer.height = ctx.canvas.height;
  const lctx = layer.getContext("2d")!;
  lctx.scale(TEXTURE_SCALE, TEXTURE_SCALE);

  roundedPath(lctx, x, y, w, h, r);
  lctx.fillStyle = color;
  lctx.fill();
  lctx.globalCompositeOperation = "destination-out";
  roundedPath(lctx, x + dx, y + dy, w, h, r);
  lctx.fill();

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
}

function paintChip(ctx: CanvasRenderingContext2D) {
  const { x, y, w, h, r } = CHIP;

  roundedPath(ctx, x, y, w, h, r);
  ctx.fillStyle = cssLinearGradient(ctx, x, y, w, h, CHIP.angle, CHIP.stops);
  ctx.fill();

  // Engraved, so the lighting inverts against the card's top-left key light:
  // the near wall of the recess falls into shadow, the far wall catches light,
  // and the surrounding surface picks up a bright lip along its lower edge.

  // Outer lip — the card surface just past the cut, catching the key light.
  roundedPath(ctx, x - 0.5, y + 0.5, w + 1, h + 1, r + 0.5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.stroke();

  // Hairline containing the cut itself.
  roundedPath(ctx, x - 0.5, y - 0.5, w + 1, h + 1, r + 0.5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.09)";
  ctx.stroke();

  // Near wall: occluded, so it reads darker and slightly thicker.
  paintInsetEdge(ctx, x, y, w, h, r, 1.5, 1.5, "rgba(0, 0, 0, 0.3)");
  // Far wall: lit.
  paintInsetEdge(ctx, x, y, w, h, r, -1, -1, "rgba(255, 255, 255, 0.9)");
}

// Unused while the artwork texture is on the face — kept for the painted card.
// Paints the card face into a canvas and hands it over as the base texture.
// Reproducing CSS gradients in GLSL would mean re-deriving gradient-line
// geometry; the 2D context already implements it.
function useCardTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = RECT_W_PX * TEXTURE_SCALE;
    canvas.height = RECT_H_PX * TEXTURE_SCALE;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(TEXTURE_SCALE, TEXTURE_SCALE);

    ctx.fillStyle = cssLinearGradient(
      ctx,
      0,
      0,
      RECT_W_PX,
      RECT_H_PX,
      CARD_GRADIENT_ANGLE,
      CARD_GRADIENT_STOPS,
    );
    ctx.fillRect(0, 0, RECT_W_PX, RECT_H_PX);

    paintChip(ctx);

    // CanvasTexture flips Y by default, which lines the gradient up with CSS.
    const tex = new THREE.CanvasTexture(canvas);
    // Left un-decoded on purpose. This shader writes gl_FragColor with no
    // linear->sRGB encode, so tagging the texture sRGB would decode it to
    // linear on sample and render every mid-tone far too dark. Passing the
    // painted bytes through untouched makes the card match its CSS colours.
    tex.colorSpace = THREE.NoColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
}

// Passed to useTexture as a module-level constant: drei runs onLoad in a layout
// effect keyed on the callback itself, so an inline closure would refire it on
// every render.
function configureTexture(texture: THREE.Texture) {
  // Same reasoning as useCardTexture above — the shader writes gl_FragColor raw,
  // with no linear->sRGB encode, so the texture must not be decoded on sample.
  texture.colorSpace = THREE.NoColorSpace;
  texture.anisotropy = 8;
}

function Experience() {
  const {
    direction,
    refract,
    brightness,
    warp,
    squircle,
    radiusPx,
    loop,
    duration,
    gap,
  } = useControls({
    squircle: {
      min: 2,
      max: 12,
      value: 4,
      step: 0.1,
      label: "Corner profile (2=arc, 4=squircle)",
    },
    radiusPx: {
      min: 0,
      max: Math.min(RECT_W_PX, RECT_H_PX) / 2,
      value: RADIUS_PX,
      step: 1,
      label: "Corner radius (px)",
    },
    warp: {
      min: 0,
      max: 1.5,
      value: 0.35,
      step: 0.01,
      label: "Warp (edge distortion)",
    },
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
      value: 1.4,
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

  // const texture = useCardTexture();
  // Suspends until loaded; R3F's <Canvas> already wraps children in a Suspense
  // boundary, so no extra fallback is needed here.
  const texture = useTexture(TEXTURE_URL, configureTexture);

  // px per world unit at the camera's focal plane; recomputed on resize.
  const factor = useThree((state) => state.viewport.factor);
  const width = RECT_W_PX / factor;
  const height = RECT_H_PX / factor;
  const radius = radiusPx / factor;

  const size = useMemo(() => new THREE.Vector2(width, height), [width, height]);

  const matRef = useRef<any>(null);
  const sweepStartRef = useRef<number | null>(null);
  const restingSinceRef = useRef<number | null>(null);

  useFrame((state) => {
    if (matRef.current) {
      const elapsedTime = state.clock.elapsedTime;

      matRef.current.uniforms.uTime.value = elapsedTime;

      if (loop && sweepStartRef.current === null) {
        if (restingSinceRef.current === null) {
          restingSinceRef.current = elapsedTime;
        }
        if (elapsedTime - restingSinceRef.current >= gap) {
          sweepStartRef.current = elapsedTime;
        }
      }

      if (sweepStartRef.current === null) {
        matRef.current.uniforms.uProgress.value = 0;
      } else {
        const t = (elapsedTime - sweepStartRef.current) / duration;
        if (t >= 1) {
          sweepStartRef.current = null;
          restingSinceRef.current = elapsedTime;
          matRef.current.uniforms.uProgress.value = 0;
        } else {
          matRef.current.uniforms.uProgress.value = t;
        }
      }
    }
  });

  return (
    <mesh>
      {/* Segmented so the vertex displacement has geometry to bend. */}
      <planeGeometry args={[width * 1.5, height * 1.5, 160, 90]} />
      {/* @ts-ignore */}
      <cardMaterialRect
        ref={matRef}
        uTexture={texture}
        uDirection={direction}
        uRefract={refract}
        uBrightness={brightness}
        uWarp={warp}
        uSquircle={squircle}
        uRadius={radius}
        uSize={size}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export default function Page() {
  return (
    <div className="relative w-full h-screen bg-white">
      <Leva hidden={false} />
      <Canvas>
        <OrbitControls />

        <Experience />
      </Canvas>
    </div>
  );
}
