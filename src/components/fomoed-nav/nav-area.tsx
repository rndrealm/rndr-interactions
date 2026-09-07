"use client";
import React, { useRef, useState } from "react";
import { MenuContent } from "./menu-content";
import { navTheme, type Theme } from "./theme";

export type NavState = "offer" | "prediction" | null;

/** Only these two buttons open the mega-menu; the rest close it. */
const MENU_BY_ID: Record<number, NavState> = {
  1: "offer",
  2: "prediction",
};

const navButtonOptions = [
  { id: 1, label: "What we offer" },
  { id: 2, label: "Prediction" },
  { id: 3, label: "B2B" },
  { id: 4, label: "Terminal" },
  { id: 5, label: "Pricing" },
  { id: 6, label: "Learn" },
];

interface INavButton {
  label: string;
  /** The menu this button opens, or null if it has none. */
  menuState: NavState;
  activeState: NavState;
  onOpen: () => void;
  onToggle: () => void;
  theme: Theme;
}

function NavButton(props: INavButton) {
  const { label, menuState, activeState, onOpen, onToggle, theme } = props;

  const t = navTheme[theme];

  const pointerType = useRef("mouse");

  const hasMenu = menuState !== null;
  // Hold the hover look while this button's menu is open, so it stays lit
  // once the cursor moves down into the panel.
  const isActive = hasMenu && menuState === activeState;

  return (
    <button
      type="button"
      onPointerDown={(e) => {
        pointerType.current = e.pointerType;
      }}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        onOpen();
      }}
      onFocus={(e) => {
        if (!e.target.matches(":focus-visible")) return;
        onOpen();
      }}
      onClick={() => {
        if (pointerType.current === "mouse") return;
        onToggle();
      }}
      aria-expanded={hasMenu ? isActive : undefined}
      className={`h-7 px-2 font-sans font-medium text-[13px] leading-5 tracking-[-0.56%] cursor-pointer rounded-[6px] transition-colors duration-150 ${
        isActive
          ? t.navButtonActive
          : `${t.navButtonText} ${t.navButtonHover}`
      }`}
    >
      {label}
    </button>
  );
}

interface INavArea {
  theme?: Theme;
}

export function NavArea(props: INavArea) {
  const { theme = "dark" } = props;

  const [navState, setNavState] = useState<NavState>(null);

  return (
    <div
      className="flex gap-1 items-center relative"
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        setNavState(null);
      }}
    >
      {navButtonOptions.map((item) => {
        const menuState = MENU_BY_ID[item.id] ?? null;
        return (
          <NavButton
            key={item.id}
            label={item.label}
            menuState={menuState}
            activeState={navState}
            onOpen={() => setNavState(menuState)}
            onToggle={() =>
              setNavState((current) =>
                current === menuState ? null : menuState,
              )
            }
            theme={theme}
          />
        );
      })}

      <div
        className={`absolute left-[50%] -translate-x-1/2 top-full justify-center items-center pt-6 ${
          navState ? "flex" : "hidden"
        }`}
      >
        {navState && <MenuContent state={navState} theme={theme} />}
      </div>
    </div>
  );
}
