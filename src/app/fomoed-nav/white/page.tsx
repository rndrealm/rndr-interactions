import React from "react";
import { FomoedIcon } from "@/components/icons";
import { NavArea } from "@/components/fomoed-nav/nav-area";
import { navTheme } from "@/components/fomoed-nav/theme";
import { AuthButtons } from "@/components/fomoed-nav/auth-buttons";

export type NavState = "offer" | "prediction" | null;

const THEME = "light";

export default function Page() {
  const t = navTheme[THEME];

  return (
    <div className={`h-screen w-full ${t.pageBg} flex flex-col`}>
      <nav className="h-16 w-full max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 xl:px-16 grid grid-cols-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)] items-center">
        <div className="w-max justify-self-start">
          <div className={`w-8 h-8 ${t.promo}`}></div>
          {/* <FomoedIcon color={t.logo} /> */}
        </div>

        <div className="self-stretch flex items-center justify-center relative">
          <NavArea theme={THEME} />
        </div>

        <AuthButtons theme={THEME} />
      </nav>
    </div>
  );
}
