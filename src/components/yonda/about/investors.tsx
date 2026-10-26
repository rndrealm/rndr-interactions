import React from "react";

export function Investors() {
  return (
    <div className="app_landing_con flex flex-col gap-30 mt-12">
      <div className="h-18 flex items-center justify-center">
        <p className="text-[#646464] text-[13px] leading-[100%] tracking-normal">
          Backed by amazing Investors and Partners
        </p>
      </div>
      <div className="flex flex-col gap-10">
        <div className="flex gap-4">
          <div className="flex-1 bg-[#FAFAFA] h-42 shadow-[0_0_0_1px_#0000001F] rounded-xl"></div>
          <div className="flex-1 bg-[#FAFAFA] h-42 shadow-[0_0_0_1px_#0000001F] rounded-xl"></div>
          <div className="flex-1 bg-[#FAFAFA] h-42 shadow-[0_0_0_1px_#0000001F] rounded-xl"></div>
        </div>

        <div className="grid grid-cols-3 gap-0">
          <div className="h-23 flex flex-col justify-center gap-2 border-r border-b border-[#0000001F]">
            <p className="text-[#1E1E1E] text-[15px] font-medium leading-6 tracking-normal">
              David Anyakora
            </p>
            <p className="text-[#646464] text-[15px] leading-6 tracking-normal">
              Investor
            </p>
          </div>
          <div className="h-23 flex flex-col justify-center gap-2 border-r border-b border-[#0000001F] pl-7">
            <p className="text-[#1E1E1E] text-[15px] font-medium leading-6 tracking-normal">
              Carl Phillip
            </p>
            <p className="text-[#646464] text-[15px] leading-6 tracking-normal">
              Investor
            </p>
          </div>
          <div className="h-23 flex flex-col justify-center gap-2 border-b border-[#0000001F] pl-7">
            <p className="text-[#1E1E1E] text-[15px] font-medium leading-6 tracking-normal">
              Johnnie Kurosawa
            </p>
            <p className="text-[#646464] text-[15px] leading-6 tracking-normal">
              Investor
            </p>
          </div>
          <div className="h-23 flex flex-col justify-center gap-2 border-r border-b border-[#0000001F]">
            <p className="text-[#1E1E1E] text-[15px] font-medium leading-6 tracking-normal">
              Jason Udi
            </p>
            <p className="text-[#646464] text-[15px] leading-6 tracking-normal">
              Investor
            </p>
          </div>
          <div className="h-23 flex flex-col justify-center gap-2 border-r border-b border-[#0000001F] pl-7">
            <p className="text-[#1E1E1E] text-[15px] font-medium leading-6 tracking-normal">
              Gideon Tesfaye
            </p>
            <p className="text-[#646464] text-[15px] leading-6 tracking-normal">
              Engineer at Meta
            </p>
          </div>
          <div className="h-23 flex flex-col justify-center gap-2 border-b border-[#0000001F] border-r pl-7">
            <p className="text-[#1E1E1E] text-[15px] font-medium leading-6 tracking-normal">
              Abel Tesfaye
            </p>
            <p className="text-[#646464] text-[15px] leading-6 tracking-normal">
              Investor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
