import React from "react";
import Link from "next/link";
import { NavLinks } from "./nav-menu/nav-links";

export function Nav() {
  return (
    <div className="app_landing_con flex justify-between items-center h-16">
      <Link href="/yonda">
        <div className="w-45">
          <div className="w-40 h-8 bg-[#F5F5F5]"></div>
        </div>
      </Link>

      <NavLinks />

      <div className="flex gap-4">
        <button
          type="button"
          className="text-[#646464] font-medium leading-none tracking-0 text-[13px] h-9 rounded-lg shadow-[0_0_0_1px_#0000000A,0_1px_3px_0_#00000017] px-3"
        >
          Sign Up
        </button>

        <button
          type="button"
          className="text-white bg-[#0B0B0B] font-medium leading-none tracking-0 text-[13px] h-9 rounded-lg px-3"
        >
          Join Waitlist
        </button>
      </div>
    </div>
  );
}
