import React from "react";
import { FomoedIcon } from "@/components/icons";
import { NavArea } from "@/components/fomoed-nav/nav-area";
import { navTheme } from "@/components/fomoed-nav/theme";

export type NavState = "offer" | "prediction" | null;

const THEME = "light";

export default function Page() {
  const t = navTheme[THEME];

  return (
    <div className={`h-screen w-full ${t.pageBg} flex flex-col`}>
      <nav className="h-16 flex items-center px-20">
        <div className="w-50">
          <div className={`w-8 h-8 ${t.promo}`}></div>
          {/* <FomoedIcon color={t.logo} /> */}
        </div>

        <div className="flex-1 h-full flex items-center justify-center relative">
          <NavArea theme={THEME} />
        </div>

        <div className="w-50 flex items-center">
          <button
            type="button"
            className={`${t.signUpButton} w-25 text-sm leading-[-0.56%] font-medium h-8 cursor-pointer font-geist`}
          >
            Sign Up
          </button>

          <button
            type="button"
            className={`${t.loginButton} w-25 text-sm leading-[-0.56%] font-medium h-8 rounded-[32px] cursor-pointer font-geist`}
          >
            Login
          </button>
        </div>
      </nav>
    </div>
  );
}
