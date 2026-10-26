import React from "react";

const footerData = [
  {
    id: 1,
    title: "Product",
    children: [
      { id: 1, label: "Request a Demo" },
      { id: 2, label: "Subscriptions" },
      { id: 3, label: "Yonda Pro" },
      { id: 4, label: "Yonda MCP" },
      { id: 5, label: "Pricing" },
      { id: 6, label: "Features" },
    ],
  },
  {
    id: 2,
    title: "Resources",
    children: [
      { id: 1, label: "Docs" },
      { id: 2, label: "FAQs" },
      { id: 3, label: "Privacy" },
      { id: 4, label: "Terms" },
      { id: 5, label: "Cookie Preferences" },
    ],
  },
  {
    id: 3,
    title: "Company",
    children: [
      { id: 1, label: "About" },
      { id: 2, label: "Careers" },
      { id: 3, label: "Security" },
      { id: 4, label: "Data Processing Agreement" },
      { id: 5, label: "Service Processing Agreement" },
    ],
  },
  {
    id: 4,
    title: "Social",
    children: [
      { id: 1, label: "Discord" },
      { id: 2, label: "Twitter" },
    ],
  },
];

export function Footer() {
  return (
    <div className="flex flex-col mt-56">
      <div className="py-39.25 bg-[#0B0B0B] flex justify-center">
        <div className="flex flex-col items-center max-w-89.5 w-full gap-8">
          <h2 className="text-[#F9F9F9] text-[56px] leading-16 tracking-[-1.27px] font-medium text-center">
            Go Beyond. Go with Yonda
          </h2>

          <div className="flex gap-4">
            <button
              type="button"
              className="text-[#646464] font-medium leading-none tracking-0 text-[13px] h-9 rounded-lg shadow-[0_0_0_1px_#0000000A,0_1px_3px_0_#00000017] px-3 bg-[#FFFFFF]"
            >
              Get Started
            </button>

            <button
              type="button"
              className="text-white bg-[#0B0B0B] font-medium leading-none tracking-0 text-[13px] h-9 rounded-lg px-3"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
      <div className="app_landing_con flex flex-col">
        <div className="flex items-center gap-4 pt-9 pb-11 border-b border-[#0000000A]">
          <p className="text-[#646464] leading-6 text-[15px] font-medium">
            Ask about Yonda on
          </p>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-[#FAFAFA] rounded-lg flex items-center justify-center shadow-[0_0_0_1px_#0000000D]">
              <div className="w-4.5 h-4.5 bg-[#0B0B0B]"></div>
            </div>
            <div className="w-8 h-8 bg-[#FAFAFA] rounded-lg flex items-center justify-center shadow-[0_0_0_1px_#0000000D]">
              <div className="w-4.5 h-4.5 bg-[#0B0B0B]"></div>
            </div>
            <div className="w-8 h-8 bg-[#FAFAFA] rounded-lg flex items-center justify-center shadow-[0_0_0_1px_#0000000D]">
              <div className="w-4.5 h-4.5 bg-[#0B0B0B]"></div>
            </div>
            <div className="w-8 h-8 bg-[#FAFAFA] rounded-lg flex items-center justify-center shadow-[0_0_0_1px_#0000000D]">
              <div className="w-4.5 h-4.5 bg-[#0B0B0B]"></div>
            </div>
          </div>
        </div>
        <div className="flex justify-between pt-20 pb-18">
          <div className="w-5 h-5 bg-[#0B0B0B]"></div>
          <div className="flex">
            {footerData.map((footer) => {
              return (
                <div key={footer.id} className="w-60 flex flex-col gap-6">
                  <p className="text-[15px] text-[#646464] leading-5 font-medium">
                    {footer.title}
                  </p>

                  <div className="flex flex-col">
                    {footer.children.map((child) => {
                      return (
                        <div
                          key={child.id}
                          className="h-8 flex items-center pr-2.5"
                        >
                          <p className="text-[#64646499] text-[15px] leading-5">
                            {child.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-full bg-[#FAFAFA] h-20"></div>
        <div className="pt-6 pb-10 flex flex-col gap-2">
          <p className="text-[#64646499] text-[11px] leading-4 tracking-0">
            Copyright © Yonda, Inc. All rights reserved
          </p>

          <p className="text-[#64646499] text-[11px] leading-4 tracking-0">
            Yonda™ , and the Yonda logo are trademarks of the Yonda, Inc.
            Trademark applications pending in South America and Europe
          </p>
        </div>
        <div className="w-full h-45"></div>
      </div>
    </div>
  );
}
