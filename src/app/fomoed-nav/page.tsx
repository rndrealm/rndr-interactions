import React from "react";
import { FomoedIcon } from "@/components/icons";
import { NavArea } from "@/components/fomoed-nav/nav-area";

export type NavState = "offer" | "prediction" | null;

export default function Page() {
  return (
    <div className="h-screen w-full bg-[#0B0B0B] flex flex-col">
      <nav className="h-16 flex items-center px-20">
        <div className="w-50">
          <FomoedIcon />
        </div>

        <div className="flex-1 h-full flex items-center justify-center relative">
          <NavArea />
        </div>

        <div className="w-50 flex items-center">
          <button
            type="button"
            className="bg-[#0B0B0B] w-25 text-[#E6E6E6] text-sm leading-[-0.56%] font-medium h-8 cursor-pointer font-geist"
          >
            Sign Up
          </button>

          <button
            type="button"
            className="bg-[#FFFFFF] w-25 text-[#0B0B0B] text-sm leading-[-0.56%] font-medium h-8 rounded-[32px] cursor-pointer font-geist"
          >
            Login
          </button>
        </div>
      </nav>
    </div>
  );
}
