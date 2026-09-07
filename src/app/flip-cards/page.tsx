"use client";
import React, { Fragment, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import { DoubleSide, Group } from "three";

const CARD_COLORS = [
  "#ff4d6d", // rose
  "#ff9f1c", // amber
  "#ffd60a", // yellow
  "#43aa3b", // green
  "#00b4d8", // cyan
  "#3a5fcd", // indigo
  "#9d4edd", // violet
];

const NUMBER_OF_CARDS = 10;
const CARD_SIZE = 1 - 0.2;
// Offset that centers the stack on y = 0, whatever NUMBER_OF_CARDS is.
const MIDDLE_INDEX = (NUMBER_OF_CARDS - 1) / 2;
// One full loop of travel: n cards spaced exactly CARD_SIZE apart.
const TOTAL_HEIGHT = CARD_SIZE * NUMBER_OF_CARDS;

function Experience() {
  const { progress, testAngle } = useControls({
    progress: {
      max: 10,
      min: 0,
      value: 0,
      step: 0.01,
    },
    testAngle: {
      max: Math.PI,
      min: -Math.PI,
      value: 0,
      step: 0.1,
    },
  });

  const groupRef = useRef<Group>(null);

  console.log(progress % 1);

  useFrame(() => {
    // if (groupRef.current) {
    //   groupRef.current.position.y = progress * TOTAL_HEIGHT;
    // }
  });

  return (
    <Fragment>
      <group ref={groupRef}>
        {Array(NUMBER_OF_CARDS)
          .fill(0)
          .map((_, index) => {
            // Where this card sits in its loop, wrapped to [-0.5, 0.5):
            // -0.5 at the bottom, 0 at the center, +0.5 at the top.
            const s =
              ((((index / NUMBER_OF_CARDS + (progress % 1) + 0.5) % 1) + 1) %
                1) -
              0.5;

            // Position and rotation both come from s, so the card is always
            // flat when it reaches the center and flipped at either extreme.
            const y = s * TOTAL_HEIGHT;
            const angle = s * 2 * Math.PI;

            return (
              <mesh key={index} position={[0, y, 0]} rotation={[-angle, 0, 0]}>
                <planeGeometry args={[1.3, 1]} />
                <meshBasicMaterial
                  color={CARD_COLORS[index % CARD_COLORS.length]}
                  side={DoubleSide}
                />
              </mesh>
            );
          })}
      </group>

      <mesh visible={false}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshNormalMaterial />
      </mesh>
    </Fragment>
  );
}

export default function Page() {
  return (
    <div className="w-full h-screen bg-white">
      <Leva hidden={false} />
      <Canvas
        camera={{
          position: [0, 0, 2.4],
        }}
      >
        <OrbitControls />

        <Experience />
      </Canvas>
    </div>
  );
}
