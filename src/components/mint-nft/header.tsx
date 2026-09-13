import React from "react";
import Link from "next/link";

export function Header() {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-b border-[oklch(0.75_0.005_240)]">
      <div className="w-6 h-6 bg-[oklch(0.918_0_0)]"></div>
      <div className="flex items-center gap-6">
        <Link href="#">
          <p className="uppercase text-[oklch(0.4_0.005_240)] text-[11px] leading-4 tracking-wider font-medium">
            marketplace
          </p>
        </Link>

        <Link href="#">
          <p className="uppercase text-[oklch(0.4_0.005_240)] text-[11px] leading-4 tracking-wider font-medium">
            gallery
          </p>
        </Link>

        <Link href="#">
          <p className="uppercase text-[oklch(0.4_0.005_240)] text-[11px] leading-4 tracking-wider font-medium">
            about
          </p>
        </Link>
      </div>

      <div className="">
        <button type="button" className="cursor-pointer">
          <div className="rounded-full h-8 bg-[oklch(0.2_0.003_240)] px-4 flex items-center justify-center">
            <p className="text-[oklch(0.982_0_0)] text-xs font-medium leading-4">
              Connect Wallet
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
