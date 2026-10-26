import React from "react";

export function TravelIdentity() {
  return (
    <div className="app_landing_con flex flex-col gap-16">
      <div className="max-w-56 w-full">
        <h4 className="text-[#646464] text-[28px] leading-9 tracking-[-0.28px] font-medium">
          Travel built around who you are.
        </h4>
      </div>
      <div className="flex gap-7.5">
        <div className="flex flex-1 flex-col gap-4 items-start">
          <div className="h-9 px-2 flex items-center bg-[#E5EFFF] rounded-[9px]">
            <p className="text-[#619DFF] text-[15px] leading-6 font-medium">
              Travel Identity
            </p>
          </div>
          <p className="text-[#646464] text-[15px] leading-6">
            Who you are as a traveller.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="h-9 px-2 flex items-center">
            <p className="text-[#646464] text-[15px] leading-6 font-medium">
              Travel Intelligence
            </p>
          </div>
          <p className="text-[#646464] text-[15px] leading-6">
            What YONDA learns and understands about you over time.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="h-9 px-2 flex items-center">
            <p className="text-[#646464] text-[15px] leading-6 font-medium">
              Travel Points
            </p>
          </div>
          <p className="text-[#646464] text-[15px] leading-6">
            Where your membership, Travel Credits, Travel Fund and future travel
            value live.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="h-9 px-2 flex items-center">
            <p className="text-[#646464] text-[15px] leading-6 font-medium">
              Travel Points
            </p>
          </div>
          <p className="text-[#646464] text-[15px] leading-6">
            What YONDA learns and understands about you over time.
          </p>
        </div>
      </div>
    </div>
  );
}
