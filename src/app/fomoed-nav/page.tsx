"use client";
import React, { useState } from "react";
import { NavArea } from "@/components/fomoed-nav/nav-area";
import { navTheme, type Theme } from "@/components/fomoed-nav/theme";
import { AuthButtons } from "@/components/fomoed-nav/auth-buttons";

export type NavState = "offer" | "prediction" | null;

export default function Page() {
  // Temporary: the Login button flips the theme while we iterate.
  const [theme, setTheme] = useState<Theme>("dark");

  const t = navTheme[theme];

  return (
    <div className={`h-screen w-full ${t.pageBg} flex flex-col`}>
      <nav className="h-16 w-full max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 xl:px-16 grid grid-cols-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)] items-center">
        <div className="w-max justify-self-start">
          {/* <FomoedIcon /> */}
          <div className={`w-8 h-8 ${t.promo}`}></div>
        </div>

        <div className="self-stretch flex items-center justify-center relative">
          <NavArea theme={theme} />
        </div>

        <AuthButtons
          theme={theme}
          onLogin={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      </nav>
    </div>
  );
}
