"use client";
import React, { useRef } from "react";
import type { IDemo } from "../demo";
import Image from "next/image";
import { iosAssets } from "@/lib/assests/ios";

export function PinchDemo(props: IDemo) {
  const { embedded = false } = props;

  const boundaryRef = useRef(null);

  return (
    <div className="w-full flex items-center justify-center px-4 py-8">
      <div className="flex flex-col max-w-100 w-full gap-6">
        {!embedded && (
          <p className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
            Pull the box past the edge of its container. It tracks 1:1 inside,
            then resists harder the further you pull, and can never go more than
            d past the edge.
          </p>
        )}
        <div
          ref={boundaryRef}
          className="max-w-100 w-full h-70 bg-[oklch(0.865_0_0)] rounded-2xl overflow-hidden"
        >
          <div className="">
            <Image src={iosAssets.pinch} alt="pinch" />
          </div>
        </div>
      </div>
    </div>
  );
}
