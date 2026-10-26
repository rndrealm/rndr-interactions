import React from "react";
import { Signature } from "../svg";

export function About() {
  return (
    <div className="app_landing_con flex flex-col gap-10 mt-30">
      <div className="flex flex-col gap-4">
        <p className="text-[#646464] text-[13px] leading-[100%] tracking-normal">
          About Yonda
        </p>
        <div className="max-w-79.75 w-full">
          <h2 className="text-[#0B0B0B] text-[28px] leading-9 font-medium tracking-[-0.28px]">
            Taking the stress out of planning.
          </h2>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <p className="text-[#646464] text-[13px] leading-[100%] tracking-normal">
          Words from Jonny
        </p>

        <div className="max-w-158.25 w-full flex flex-col gap-6">
          <p className="text-[#646464] text-[15px] leading-6 font-medium tracking-normal">
            We started Yonda in 2018 around a simple observation: retail
            investors had no good way to follow the companies they cared about.
            Earnings calls meant dialing into conference lines and clunky IR
            pages.
          </p>
          <p className="text-[#646464] text-[15px] leading-6 font-medium tracking-normal">
            The first product was a free mobile app. It grew fast and taught us
            something more valuable than traction: professionals had the same
            frustrations as retail investors, just with higher stakes. That
            insight reoriented the company.
          </p>
          <p className="text-[#646464] text-[15px] leading-6 font-medium tracking-normal">
            IR material - the primary input in company research - had never been
            structured or made queryable at scale. That was tolerable for
            decades. Analysts did the work by hand. AI cannot. In an AI-first
            world, that became an infrastructure gap worth solving.
          </p>
          <p className="text-[#646464] text-[15px] leading-6 font-medium tracking-normal">
            Today we serve top hedge funds, asset managers, banks, and the
            largest AI companies in the world through two offerings: Quartr Pro,
            an AI research platform for finance professionals, and Quartr API,
            the world&lsquo;s leading IR data layer for builders.
          </p>
          <p className="text-[#646464] text-[15px] leading-6 font-medium tracking-normal">
            Across Stockholm, New York, and Dublin, we share an obsession with
            quality and the conviction that the most crucial insights lie in the
            narratives behind the numbers. Because the truth is often spoken,
            not just calculated.
          </p>
        </div>

        <div className="flex flex-col gap-10.75">
          <div className="">
            <Signature />
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-black leading-[100%] font-medium text-[15px]">
              Johnnie Kurosawa
            </p>
            <p className="text-[#00000099] leading-[100%] text-[15px]">
              CEO and Co-founder, Quartr
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
