"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import MorphSwitch from "@/app/morph-elements/morph-switch";

const MorphSwitchPage = () => {
  const [morphEnabled, setMorphEnabled] = useState(true);

  return (
    <main className="flex flex-col items-center justify-center w-screen h-screen bg-white gap-10">
      <MorphSwitch morphEnabled={morphEnabled} />
      <motion.button
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        onClick={() => setMorphEnabled((prev) => !prev)}
        className="px-4 py-2 rounded-full font-geist text-sm font-medium cursor-pointer transition-colors"
        style={{
          background: morphEnabled ? "#000" : "#F5F5F5",
          color: morphEnabled ? "#fff" : "#353535",
        }}
      >
        Morph {morphEnabled ? "On" : "Off"}
      </motion.button>
    </main>
  );
};

export default MorphSwitchPage;
