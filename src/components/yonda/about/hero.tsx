"use client";
import React from "react";
import Image from "next/image";
import { yondaAssets } from "@/lib/assests/yonda";
import { Play } from "../svg";

export function Hero() {
  return (
    <div className="app_landing_con flex flex-col gap-16 mt-32">
      <div className="flex justify-between items-center">
        <div className="max-w-77.75 w-full">
          <h3 className="text-black text-[32px] leading-10 font-medium tracking-normal">
            Building the operating system for travel
          </h3>
        </div>
        <div className="max-w-102.5 w-full">
          <p className="text-[#646464] text-[15px] leading-6 font-medium tracking-normal text-right">
            Travel is changing, everything about our world around us is moving
            at a pace we do not understand.
          </p>
        </div>
      </div>
      <div className="w-full">
        <div className="w-full aspect-1283/658 rounded-[20px] overflow-hidden relative shadow-[0_0_0_1px_#00000017]">
          <Image
            src={yondaAssets.aboutHero}
            alt="about hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 right-0 h-10 flex items-center px-3.5 bg-[#FFFFFFCC] backdrop-blur-xs">
            <p className="text-[#414141] text-right text-[15px] leading-6 font-medium">
              Building the next frontier to be discovered with travel
            </p>
          </div>

          <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            <h2 className="text-[56px] font-bricolage leading-16 font-medium text-white tracking-[-2%]">
              Yonda
            </h2>
          </div>

          <div className="absolute bottom-10 left-13.75">
            <div className="w-6 h-6 flex justify-center items-center">
              <Play />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
