"use client";

import { useEffect, useRef } from "react";
import { PerspectiveCamera, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion } from "motion/react";
import Link from "next/link";

const content = {
  error: "404",
  message: "You seem a little off-course",
  message2: "We couldn't find the page you're looking for, but we'll help you get back on track.",
  label: "Go Back Home",
};

export default function FourOhFourPage() {
  return <Error3DComponent />;
}

function Error3DComponent() {
  return (
    <div className="fixed inset-0 h-[100svh] w-full overflow-hidden">
      <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#000]">
        <div className="flex h-full w-full scale-105 items-center justify-center">
          <div className="pointer-events-none relative flex h-full w-full items-center justify-center gap-[180px] pb-[200px]">
            <motion.div
              style={{ opacity: 0 }}
              className="relative flex h-full items-center justify-center"
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
            >
              <SvgLeft />
            </motion.div>

            <div className="absolute top-[calc(50%-95px)] left-1/2 flex aspect-square h-[260px] -translate-x-[52.5%] -translate-y-1/2 items-center justify-center overflow-hidden">
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
            className="absolute top-[60%] left-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-between gap-1"
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
          >
            <h2 className="text-[18px] text-white">{content.message}</h2>
            <p className="w-[280px] text-center text-[14px] leading-[1.275] text-[#9A9E9E]">{content.message2}</p>

            <button className="mt-[18px] rounded-[36px] border-[1px] border-[#464646] bg-white px-5 py-2 text-[14px] font-medium text-black">
              <Link href="/" className="">
                {content.label}
              </Link>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Experience() {
  return (
    <Canvas
      shadows
      className="webgl"
      flat
      dpr={[1, 2]}
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

  const { scene } = useThree();
  const coinModelRef = useRef(null);

  const coinBakedMap = useTexture("/bakedCoin.webp");
  coinBakedMap.flipY = false;
  coinBakedMap.colorSpace = THREE.SRGBColorSpace;

  const ridgesBakedMap = useTexture("/bakedRidges.webp");
  ridgesBakedMap.flipY = false;
  ridgesBakedMap.colorSpace = THREE.SRGBColorSpace;

  const mixer = useRef<THREE.AnimationMixer>(new THREE.AnimationMixer(gltf.scene));

  useEffect(() => {
    if (!gltf) return;

    const gltfScene = gltf.scene;
    const animations = gltf.animations;

    if (animations && animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(gltfScene);
      animations.forEach((clip) => {
        const action = mixer.current.clipAction(clip);
        action.setEffectiveTimeScale(10);

        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;

        action.play();
      });
    }
  }, [gltf]);

  useFrame((state, delta) => {
    mixer.current?.update(delta);
  });

  useEffect(() => {
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
