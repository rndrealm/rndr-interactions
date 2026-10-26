import React from "react";

export function Exists() {
  return (
    <div className="app_landing_con mt-35">
      <div className="w-full flex justify-between pr-13.5">
        <p className="text-[#0B0B0B] text-[28px] leading-9 tracking-[-0.28px] font-medium">
          Why Yonda Exisits
        </p>

        <div className="flex flex-col gap-9.25 max-w-118">
          <p className="text-[#0B0B0B99] text-[20px] leading-8 tracking-[-0.28px] font-medium">
            Yonda was born from a revolutionary vision to transform the lending
            and borrowing landscape within the decentralized finance (DeFi)
            sector.
          </p>
          <div className="flex flex-col gap-6">
            <p className="text-[#646464] text-[15px] leading-6 tracking-normal font-medium">
              We started Yonda in 2018 around a simple observation: retail
              investors had no good way to follow the companies they cared
              about. Earnings calls meant dialing into conference lines and
              clunky IR pages.
            </p>

            <p className="text-[#646464] text-[15px] leading-6 tracking-normal font-medium">
              The first product was a free mobile app. It grew fast and taught
              us something more valuable than traction: professionals had the
              same frustrations as retail investors, just with higher stakes.
              That insight reoriented the company.
            </p>

            <p className="text-[#646464] text-[15px] leading-6 tracking-normal font-medium">
              IR material – the primary input in company research – had never
              been structured or made queryable at scale. That was tolerable for
              decades. Analysts did the work by hand. AI cannot. In an AI-first
              world, that became an infrastructure gap worth solving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
