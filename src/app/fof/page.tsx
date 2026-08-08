"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { PerspectiveCamera, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion } from "motion/react";
import { Squircle } from "@squircle-js/react";
import Link from "next/link";

// Matches the smoothing used on the motion/stack surfaces.
const CORNER_SMOOTHING = 0.8;

const content = {
  error: "404",
  message1: "Something went wrong",
  message2: "We couldn't find the page you're looking for, let's get back on track.",
  label: "Home",
};

export default function FourOhFourPage() {
  return <Error3DComponent />;
}

function Error3DComponent() {
  return (
    <div className="fixed inset-0 h-[100svh] w-full overflow-hidden">
      <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#000]">
        <div className="flex h-full w-full items-center justify-center">
          {/* 0.735 = the original 1.05 reduced by 30%. The scale stays on the
              artwork only — scaling the copy too would render every specified px
              value off and land text between pixels. */}
          <div className="pointer-events-none relative flex h-full w-full scale-[0.735] items-center justify-center gap-[180px] pb-[200px]">
            <motion.div
              style={{ opacity: 0 }}
              className="relative flex h-full items-center justify-center"
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
            >
              <SvgLeft />
            </motion.div>

            {/* pointer-events-auto re-enables input inside the pointer-events-none
                artwork wrapper; touch-none stops the drag from scrolling on mobile. */}
            <div className="pointer-events-auto absolute top-[calc(50%-95px)] left-1/2 flex aspect-square h-[260px] -translate-x-[52.5%] -translate-y-1/2 cursor-grab touch-none items-center justify-center overflow-hidden active:cursor-grabbing">
              <Experience />
            </div>

            <motion.div
              style={{ opacity: 0 }}
              className="relative flex h-full items-center justify-center"
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5, ease: "easeInOut" }}
            >
              <SvgRight />
            </motion.div>
          </div>

          <motion.div
            style={{ opacity: 0 }}
            className="absolute top-[calc(60%_+_60px)] left-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
          >
            <h2 className="text-center text-[14px] leading-[14px] tracking-[-0.0046em] text-white">
              {content.message1}
            </h2>

            {/* 8px below the heading; the button's own mt-[21px] handles the
                gap on the other side. */}
            {/* Regular weight against the heading's medium — body inherits 500
                from globals.css, so font-normal has to be explicit. */}
            <p className="mt-[8px] text-center text-[14px] leading-[20px] font-normal whitespace-nowrap text-[oklch(0.993_0_0)]/60">
              {content.message2}
            </p>

            {/* A single <Link> carries the interaction — an <a> nested inside a <button>
                is invalid HTML and has undefined activation behaviour. The squircle
                clip-path lives on the inner <span> so it doesn't clip away the Link's
                ::after hit-area extension. */}
            <Link
              href="/"
              className="relative mt-[21px] mx-[14px] inline-flex w-fit transition-[scale,filter] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:brightness-110 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white after:absolute after:inset-x-0 after:top-1/2 after:h-[40px] after:-translate-y-1/2 after:content-['']"
            >
              {/* 18px = half the 36px height, i.e. fully rounded ends. */}
              <Squircle asChild cornerRadius={18} cornerSmoothing={CORNER_SMOOTHING}>
                <span className="inline-flex h-[36px] w-fit items-center justify-center border-[1px] border-[oklch(0.25_0_0)] bg-[oklch(0.375_0_0)] shadow-[inset_0px_0px_0_0_rgba(255,255,255,0.25),inset_-0px_-0px_0_0_rgba(185,185,185,0.25)] px-[16px] py-[6px] text-[14px] leading-[20px] font-medium text-[oklch(0.94_0_0)] [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                  {content.label}
                </span>
              </Squircle>
            </Link>
          </motion.div>
        </div>
      </div>

      <HelpButton />
    </div>
  );
}

/** The provided help-circle icon, unmodified apart from stroke="currentColor"
 *  in place of the hardcoded black so it inherits the button's text colour. */
function HelpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 16V16.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 13C12 11.3608 14 11.9319 14 10C14 8.89543 13.1046 8 12 8C11.2597 8 10.6134 8.4022 10.2676 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Floating help affordance. Deliberately a sibling of the artwork rather than a
 * child — that wrapper is `pointer-events-none`, which would swallow the click.
 */
function HelpButton() {
  return (
    <button
      type="button"
      aria-label="Help"
      // after: pads the 32px circle out to a 44px target without changing what
      // it looks like — same trick the Home button uses.
      className="fixed right-6 bottom-6 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full border-[1px] border-white/10 bg-[oklch(0.16_0.01_265)] text-white transition-[scale,filter] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:brightness-125 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white after:absolute after:-inset-1.5 after:content-['']"
    >
      <HelpIcon className="size-[20px]" />
    </button>
  );
}

type DragState = {
  active: boolean;
  lastX: number;
  pendingDelta: number;
  lastDirection: number;
  movedPx: number;
  /** Set to ±1 on release to fire off a full spin in that direction. */
  swipe: number;
};

/** Radians of spin per pixel dragged. */
const DRAG_SENSITIVITY = 0.008;
/** The baked intro spins about world Y (axis (0,-1,0.05), ~2 turns); dragging
 *  reuses that axis so the cursor spin reads as the same motion. */
const WORLD_Y = new THREE.Vector3(0, 1, 0);
/** A release only counts as a swipe past this much travel, so a plain click
 *  or a jittery press doesn't launch a spin. */
const SWIPE_MIN_PX = 4;
/** One swipe replays the whole thing: the baked clip is 717deg (~2 turns) over
 *  39.67s at timeScale 10, i.e. 3.97s. */
const SPIN_TURNS = 2;
const SPIN_DURATION = 3.97;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function Experience() {
  return (
    <Canvas
      shadows
      className="webgl"
      flat
      dpr={[1, 2]}
      // r3f measures with getBoundingClientRect, which reports the size *after*
      // the artwork wrapper's scale — so the canvas sized itself to the scaled
      // box and the transform then scaled it again, shrinking the coin by
      // scale² while the SVG digits only shrank by scale. offsetSize switches
      // to offsetWidth/offsetHeight, which transforms don't touch.
      resize={{ offsetSize: true }}
      gl={{
        antialias: true,
      }}
    >
      <Scene />

      <PerspectiveCamera makeDefault position={[0.0, 1.7, 5.5]} near={0.01} far={50} />

      <spotLight position={[3, 7, 2]} intensity={500} angle={Math.PI / 6} penumbra={0.5} distance={20} />

      <spotLight position={[3, 3, -3]} intensity={100} angle={Math.PI / 4} penumbra={0.3} distance={15} />
    </Canvas>
  );
}

function Scene() {
  return (
    <group position={[0, 0.2, 0]}>
      <CoinModel />
    </group>
  );
}

const CoinModel = () => {
  const gltf = useGLTF("/coinModel.glb");

  const { scene, gl } = useThree();
  const drag = useRef<DragState>({
    active: false,
    lastX: 0,
    pendingDelta: 0,
    lastDirection: 0,
    movedPx: 0,
    swipe: 0,
  });
  const coinModelRef = useRef<THREE.Group>(null);

  const coinBakedMap = useTexture("/bakedCoin.webp");
  coinBakedMap.flipY = false;
  coinBakedMap.colorSpace = THREE.SRGBColorSpace;

  const ridgesBakedMap = useTexture("/bakedRidges.webp");
  ridgesBakedMap.flipY = false;
  ridgesBakedMap.colorSpace = THREE.SRGBColorSpace;

  const mixer = useRef<THREE.AnimationMixer>(new THREE.AnimationMixer(gltf.scene));
  const introDone = useRef(false);
  const coinObject = useRef<THREE.Object3D | null>(null);
  const spin = useRef<{ elapsed: number; prevEased: number; direction: number } | null>(null);

  // Listeners live on the canvas element rather than on <Canvas> props so the
  // drag state is owned by this component — mutating a ref passed down as a
  // prop is what the react-hooks immutability rule objects to.
  useEffect(() => {
    const el = gl.domElement;

    const onDown = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      drag.current.active = true;
      drag.current.lastX = e.clientX;
      drag.current.movedPx = 0;
      drag.current.lastDirection = 0;
      drag.current.swipe = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.lastX;
      if (dx !== 0) drag.current.lastDirection = Math.sign(dx);
      drag.current.movedPx += Math.abs(dx);
      drag.current.pendingDelta += dx * DRAG_SENSITIVITY;
      drag.current.lastX = e.clientX;
    };

    const onUp = (e: PointerEvent) => {
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      drag.current.active = false;
      if (drag.current.movedPx > SWIPE_MIN_PX) {
        drag.current.swipe = drag.current.lastDirection || 1;
      }
    };

    const onCancel = () => {
      drag.current.active = false;
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onCancel);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
    };
  }, [gl]);

  useEffect(() => {
    if (!gltf) return;

    const gltfScene = gltf.scene;
    const animations = gltf.animations;

    // "Coin" is the single root node; the ridges and logos are its children,
    // so rotating it turns the whole model as one piece.
    coinObject.current = gltfScene.getObjectByName("Coin") ?? gltfScene;

    if (animations && animations.length > 0) {
      const m = new THREE.AnimationMixer(gltfScene);
      mixer.current = m;

      const onFinished = () => {
        introDone.current = true;
      };
      m.addEventListener("finished", onFinished);

      animations.forEach((clip) => {
        const action = m.clipAction(clip);
        action.setEffectiveTimeScale(10);

        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;

        action.play();
      });

      return () => m.removeEventListener("finished", onFinished);
    }
  }, [gltf]);

  useFrame((state, delta) => {
    // Grabbing the coin takes over from the intro clip.
    if (drag.current.active) introDone.current = true;

    // The baked clip owns the coin's transform until it clamps — updating the
    // mixer past that point would overwrite the drag rotation every frame.
    if (!introDone.current) {
      mixer.current?.update(delta);
      return;
    }

    const coin = coinObject.current;
    if (!coin) return;

    // A release past the travel threshold launches the whole spin again.
    if (drag.current.swipe !== 0) {
      spin.current = { elapsed: 0, prevEased: 0, direction: drag.current.swipe };
      drag.current.swipe = 0;
    }

    // rotateOnWorldAxis turns the node about its own origin, so the coin spins
    // in place rather than orbiting the group origin it was translated away from.
    if (drag.current.pendingDelta !== 0) {
      // Grabbing it mid-spin hands control back to the cursor.
      spin.current = null;
      coin.rotateOnWorldAxis(WORLD_Y, drag.current.pendingDelta);
      drag.current.pendingDelta = 0;
      return;
    }

    if (spin.current === null || drag.current.active) return;

    spin.current.elapsed += delta;
    const t = Math.min(1, spin.current.elapsed / SPIN_DURATION);
    const eased = easeOutCubic(t);
    const step = (eased - spin.current.prevEased) * SPIN_TURNS * Math.PI * 2 * spin.current.direction;
    coin.rotateOnWorldAxis(WORLD_Y, step);
    spin.current.prevEased = eased;

    if (t >= 1) spin.current = null;
  });

  // useLayoutEffect, not useEffect: this runs synchronously after commit and
  // before the browser paints, so no frame is ever drawn with the GLB's own
  // materials. An untextured MeshStandardMaterial is white, and under the
  // intensity-500 spotlight it flashed bright white on every reload.
  // Safe from the SSR useLayoutEffect warning — Canvas children are only ever
  // rendered by the r3f reconciler on the client.
  useLayoutEffect(() => {
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        if (child.name.includes("Ridges")) {
          if (child.geometry.attributes.uv1) {
            child.geometry.setAttribute("uv", child.geometry.attributes.uv1);
            child.geometry.attributes.uv.needsUpdate = true;
          }

          child.material = new THREE.MeshStandardMaterial({
            map: ridgesBakedMap,
            envMap: scene.environment,
            roughness: 0.5,
            metalness: 1.0,
            envMapIntensity: 0.01,
          });
        } else if (child.name.includes("Coin")) {
          if (child.geometry.attributes.uv1) {
            child.geometry.setAttribute("uv", child.geometry.attributes.uv1);
            child.geometry.attributes.uv.needsUpdate = true;
          }

          child.material = new THREE.MeshStandardMaterial({
            map: coinBakedMap,
            envMap: scene.environment,
            roughness: 0.4,
            metalness: 1.0,
            envMapIntensity: 0.1,
          });
        } else {
          if (child.geometry.attributes.uv1) {
            child.geometry.setAttribute("uv", child.geometry.attributes.uv1);
            child.geometry.attributes.uv.needsUpdate = true;
          }

          child.material = new THREE.MeshStandardMaterial({
            map: coinBakedMap,
            envMap: scene.environment,
            roughness: 0.4,
            metalness: 1.0,
            envMapIntensity: 0.25,
          });
        }
      }
    });
  }, [gltf, coinBakedMap, ridgesBakedMap, scene.environment]);

  return (
    <group ref={coinModelRef}>
      <primitive object={gltf.scene} />
    </group>
  );
};

useGLTF.preload("/coinModel.glb");

const SvgLeft = () => {
  return (
    <svg width="114" height="146" viewBox="0 0 114 146" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_ii_8352_196685)">
        <path
          d="M0.696734 119.011V98.0597L62.4155 0.54545H79.8871V30.375H69.2337L27.6854 96.2131V97.3494H113.836V119.011H0.696734ZM70.0859 146V112.619L70.37 103.244V0.54545H95.228V146H70.0859Z"
          fill="url(#paint0_linear_8352_196685)"
        />
        <path
          d="M0.696734 119.011V98.0597L62.4155 0.54545H79.8871V30.375H69.2337L27.6854 96.2131V97.3494H113.836V119.011H0.696734ZM70.0859 146V112.619L70.37 103.244V0.54545H95.228V146H70.0859Z"
          fill="url(#paint1_linear_8352_196685)"
          fillOpacity="0.49"
        />
      </g>
      <defs>
        <filter
          id="filter0_ii_8352_196685"
          x="0.695312"
          y="0.545441"
          width="113.141"
          height="145.455"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="2" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_8352_196685" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.45 0" />
          <feBlend mode="normal" in2="effect1_innerShadow_8352_196685" result="effect2_innerShadow_8352_196685" />
        </filter>
        <linearGradient
          id="paint0_linear_8352_196685"
          x1="57"
          y1="-151"
          x2="57"
          y2="335"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.1" stopColor="#555555" />
          <stop offset="0.503054" stopColor="#111111" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="paint1_linear_8352_196685" x1="-10" y1="6" x2="124" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0.662914" stopOpacity="0" />
          <stop offset="1" stopColor="#C0561E" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const SvgRight = () => {
  return (
    <svg width="114" height="146" viewBox="0 0 114 146" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_ii_8352_196687)">
        <path
          d="M0.696734 119.011V98.0597L62.4155 0.54545H79.8871V30.375H69.2337L27.6854 96.2131V97.3494H113.836V119.011H0.696734ZM70.0859 146V112.619L70.37 103.244V0.54545H95.228V146H70.0859Z"
          fill="url(#paint0_linear_8352_196687)"
        />
      </g>
      <defs>
        <filter
          id="filter0_ii_8352_196687"
          x="0.695312"
          y="0.545441"
          width="113.141"
          height="145.455"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_8352_196687" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.45 0" />
          <feBlend mode="normal" in2="effect1_innerShadow_8352_196687" result="effect2_innerShadow_8352_196687" />
        </filter>
        <linearGradient
          id="paint0_linear_8352_196687"
          x1="57"
          y1="-151"
          x2="57"
          y2="335"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.1" stopColor="#555555" />
          <stop offset="0.503054" stopColor="#111111" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  );
};
