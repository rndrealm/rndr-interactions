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

/**
 * Hover-to-open on a mouse, tap-to-toggle on touch and pen.
 *
 * It all hangs off `pointerType`, which pointer events carry and mouse events
 * don't: browsers synthesise `mouseenter` after a tap, so `onMouseEnter` can't
 * tell a finger from a cursor. Hover is therefore gated to mouse, and touch/pen
 * fall through to `onClick`, which toggles. `onFocus` needs the
 * `:focus-visible` gate because a tap fires focus *before* click — ungated, it
 * opens the menu and the toggle then reads its own write and closes it again.
 */
function NavButton(props: INavButton) {
  const { label, menuState, activeState, onOpen, onToggle, theme } = props;

  const t = navTheme[theme];

  const hasMenu = menuState !== null;
  const isActive = hasMenu && menuState === activeState;

  const pointerType = useRef("mouse");

  return (
    <button
      type="button"
      onPointerDown={(e) => {
        pointerType.current = e.pointerType;
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") onOpen();
      }}
      onFocus={(e) => {
        if (e.target.matches(":focus-visible")) onOpen();
      }}
      onClick={() => {
        if (pointerType.current !== "mouse") onToggle();
      }}
      aria-expanded={hasMenu ? isActive : undefined}
      className={`h-7 px-2 font-sans font-medium text-[13px] leading-5 tracking-[-0.56%] cursor-pointer rounded-[6px] transition-colors duration-150 ${
        isActive ? t.navButtonActive : `${t.navButtonText} ${t.navButtonHover}`
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
      // Mouse only: one tap fires enter -> down -> up -> leave in a single
      // gesture, so an ungated leave would close what the tap just opened.
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
