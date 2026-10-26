import React from "react";
import Image from "next/image";
import { yondaAssets } from "@/lib/assests/yonda";
import { UsedBy } from "./used-by";

export function Hero() {
  return (
    <div className="flex flex-col gap-6 mt-32">
      <div className="app_landing_con flex justify-between items-end">
        <div className="max-w-139.25 w-full">
          <h1 className="text-black font-semibold text-[56px] leading-16">
            Building the operating system for travel
          </h1>
        </div>
        <div className="max-w-102.5 w-full flex flex-col gap-4 items-end">
          <p className="text-right text-[#646464] text-[15px] leading-6 font-medium">
            Human Verified trips planned by your very own AI trip planner built
            to save you time, money and
          </p>

          <div className="flex gap-4">
            <button
              type="button"
              className="text-white bg-[#0B0B0B] font-medium leading-none tracking-0 text-[13px] h-9 rounded-lg px-3"
            >
              Book Demo
            </button>

            <button
              type="button"
              className="text-[#646464] font-medium leading-none tracking-0 text-[13px] h-9 rounded-lg shadow-[0_0_0_1px_#0000000A,0_1px_3px_0_#00000017] px-3"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
      <div className="">
        <Image src={yondaAssets.hero} alt="hero" />
      </div>
      <UsedBy />
    </div>
  );
}
