import React from "react";
import { navTheme, type Theme } from "./theme";

/** Same geometry and type as the nav buttons, plus room for the shortcut chip. */
const BUTTON =
  "h-7 px-2 flex items-center gap-1.5 font-sans font-medium text-[13px] leading-5 tracking-[-0.56%] cursor-pointer rounded-[6px] transition-colors duration-150";

interface IShortcut {
  char: string;
  className: string;
}

/** Decorative keyboard hint. Hidden from a11y and from touch, where it means nothing. */
function Shortcut({ char, className }: IShortcut) {
  return (
    <kbd
      aria-hidden="true"
      className={`pointer-events-none select-none pointer-coarse:hidden inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] font-sans text-[11px] leading-none uppercase ${className}`}
    >
      {char}
    </kbd>
  );
}

interface IProps {
  theme?: Theme;
}

export function AuthButtons(props: IProps) {
  const { theme = "dark" } = props;

  const t = navTheme[theme];

  return (
    <div className="flex items-center gap-2 justify-self-end">
      <button type="button" className={`${t.loginButton} ${BUTTON}`}>
        Login
        <Shortcut char="L" className={t.kbd} />
      </button>

      <button type="button" className={`${t.signUpButton} ${BUTTON}`}>
        Sign up
        <Shortcut char="S" className={t.kbdPrimary} />
      </button>
    </div>
  );
}
