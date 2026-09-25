import React from "react";
import Link from "next/link";
import { HAIRLINE, INK, MUTED } from "./ui";

const LINKS = ["Marketplace", "Gallery", "About"];

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-6 md:px-10">
        <Link href="#" className="flex items-center gap-2.5">
          <span className="size-6 rounded-md bg-[oklch(0.15_0_0)]" />
          <span
            className={`text-[15px] leading-5 font-semibold tracking-[-0.02em] ${INK}`}
          >
            rndr realm
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link}
              href="#"
              className={`grid h-10 place-items-center rounded-full px-3.5 text-[14px] leading-5 font-medium transition-colors duration-150 hover:bg-[oklch(0.96_0_0)] hover:text-[oklch(0.15_0_0)] ${MUTED}`}
            >
              {link}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="h-10 cursor-pointer rounded-full bg-[oklch(0.15_0_0)] px-5 text-[14px] leading-5 font-semibold tracking-[-0.01em] text-white transition-[background-color,scale] duration-150 hover:bg-[oklch(0.25_0_0)] active:scale-[0.96]"
        >
          Connect wallet
        </button>
      </div>
      <div className={`h-px w-full ${HAIRLINE}`} />
    </header>
  );
}
