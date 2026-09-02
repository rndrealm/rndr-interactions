"use client";
import React, { useState } from "react";
import { FomoedIcon } from "@/components/icons";
import { MenuContent } from "@/components/fomoed-nav/menu-content";

const navButtonOptions = [
  { id: 1, label: "What we offer" },
  { id: 2, label: "Prediction" },
  { id: 3, label: "B2B" },
  { id: 4, label: "Terminal" },
  { id: 5, label: "Pricing" },
  { id: 6, label: "Learn" },
  { id: 7, label: "Support" },
];

export type NavState = "offer" | "prediction" | null;

interface INavButton {
  label: string;
}

function NavButton(props: INavButton) {
  const { label } = props;
  return (
    <button
      type="button"
      className="h-8 px-4 font-diatype font-medium text-sm leading-5 text-[#E6E6E6] tracking-[-0.56%] cursor-pointer hover:bg-[#131313] rounded-[16px]"
    >
      {label}
    </button>
  );
}

export default function Page() {
  const [navState, setNavState] = useState<NavState>(null);

  return (
    <div className="h-screen w-full bg-[#0B0B0B] flex flex-col">
      <nav className="h-16 flex items-center px-20">
        <div className="w-50">
          <FomoedIcon />
        </div>

        <div className="flex-1 h-full flex items-center justify-center gap-2.25 relative">
          {navButtonOptions.map((item) => {
            return <NavButton key={item.id} label={item.label} />;
          })}

          {/* <div className="absolute left-[50%] -translate-x-1/2 top-full w-[820px] h-[310px] bg-[red]"></div> */}
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

      <div className="flex justify-center gap-2">
        <button
          type="button"
          className="text-white cursor-pointer"
          onClick={() => {
            setNavState("offer");
          }}
        >
          What we offer
        </button>
        <button
          type="button"
          className="text-white cursor-pointer"
          onClick={() => {
            setNavState("prediction");
          }}
        >
          Prediction
        </button>
      </div>
      <div className="flex-1 bg- flex justify-center items-center">
        <MenuContent state={navState} />
      </div>
    </div>
  );
}
