"use client";
import React from "react";
import MorphSwitch from "./morph-switch";
import MorphCheckbox from "./morph-checkbox";
import MorphRadio from "./morph-radio";

const MorphElements = () => {
  return (
    <main className="flex items-center justify-center w-screen h-screen bg-white gap-16">
      <MorphSwitch />
      <MorphCheckbox />
      <MorphRadio />
    </main>
  );
};

export default MorphElements;
