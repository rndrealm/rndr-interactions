import { yondaAssets } from "@/lib/assests/yonda";
import Image from "next/image";
import React from "react";

export function Infrastructure() {
  return (
    <div className="flex gap-6 mt-30 app_landing_con">
      <div className="flex-1">
        <h3 className="text-[#646464] tracking-[-0.28px] text-[28px] leading-9 font-medium">
          Human verified, AI infrastructure that understands your budget, Flight
          Plans and trips.
        </h3>
      </div>
      <div className="flex-1 flex flex-col gap-4">
        <div className="aspect-410/518 w-full rounded-[10px] overflow-hidden">
          <Image src={yondaAssets.infrastructure} alt="infrastructure" />
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-[#1E1E1E] font-medium text-[15px] leading-6">
            Get Trips planned by our Infrastructure, verified by humans
          </p>
          <p className="text-[#646464] font-medium text-[15px] leading-6">
            Yonda takes trip planning and preparations and weighs it against
            organic human experiences.
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-4">
        <div className="aspect-410/518 w-full rounded-[10px] overflow-hidden">
          <Image src={yondaAssets.infrastructure2} alt="infrastructure" />
        </div>
        <div className="flex  flex-col gap-4">
          <p className="text-[#1E1E1E] font-medium text-[15px] leading-6">
            Every OS needs a great mind, meet YASI!
          </p>
          <p className="text-[#646464] font-medium text-[15px] leading-6">
            Yonda takes trip planning and preparations and weighs it against
            organic human experiences.
          </p>
        </div>
      </div>
    </div>
  );
}
