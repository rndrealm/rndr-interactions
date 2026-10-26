import React, { ComponentType } from "react";
import { Airline, PrivacyDashLabel, SanMarino, Tropic, VisaFree } from "./svg";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { yondaAssets } from "@/lib/assests/yonda";

const privacyItems = [
  { id: 1, label: "178 Countries visa free", icon: VisaFree },
  { id: 2, label: "178 Countries visa free", icon: VisaFree },
  { id: 3, label: "San Marino", icon: SanMarino },
  { id: 4, label: "178 Countries visa free", icon: VisaFree },
  {
    id: 5,
    label: "38 in tropic season in the next 2 months",
    icon: Tropic,
  },
  { id: 6, label: "14 airlines with 30% discounts", icon: Airline },
];

interface IPrivacyItem {
  icon: ComponentType<{ strokeOpacity?: number }>;
  label: string;
  index: number;
}

function PrivacyItem(props: IPrivacyItem) {
  const { icon: Icon, label, index } = props;
  const isActive = index === 2;

  const strokeOpacity = index < 2 ? 0.4 : 0.7;

  const textClassName = index < 2 ? "text-[#FFFFFF66]" : "text-white";

  const isActiveBgClassName = isActive
    ? "shadow-[0_0_0_1px_#0000000A,0_4px_18px_0_#0000000D,inset_0_0_14px_0_#9158FDB2,inset_0_0.5px_0_0_#DECCFF,inset_0_-0.5px_1px_0_#DECDFE] bg-[linear-gradient(180deg,#AF85FE_-109.37%,#8A54FF_0.53%,#7638FF_101.03%)]"
    : "";

  const isActiveTextClassName = isActive ? "font-medium" : "";

  return (
    <div
      className={cn(
        "h-12 flex gap-4 items-center px-3 rounded-[12px]",
        isActiveBgClassName,
      )}
    >
      <div className="w-6 h-6 flex items-center justify-center">
        <Icon strokeOpacity={isActive ? 1 : strokeOpacity} />
      </div>
      <p
        className={cn(
          "text-[#FFFFFF66] text-[15px] leading-6",
          textClassName,
          isActiveTextClassName,
        )}
      >
        {label}
      </p>
    </div>
  );
}

export function Privacy() {
  return (
    <div className="app_landing_con flex flex-col gap-10.75">
      <div className="bg-[linear-gradient(180.03deg,#8037FF_-15.12%,#5E3AFF_142.85%,#373EFF_176.26%,#EEECFF_208.23%)] rounded-[20px] px-14 pt-15.25 pb-21.5 mt-18.75 flex gap-4.5">
        <div className="max-w-92 w-full flex flex-col justify-between pt-22">
          <div className="flex flex-col gap-px">
            <div className="flex flex-col gap-2">
              <p className="text-[#F9F9F9] text-[15px] leading-6 font-medium">
                Privacy
              </p>

              <p className="text-[#F9F9F9] text-[28px] leading-9 font-medium tracking-[-0.28px]">
                Your details protected
              </p>
            </div>
            <div className="w-full pl-3.5 overflow-hidden">
              <PrivacyDashLabel />
            </div>
          </div>

          <div className="flex flex-col gap-4 max-w-74.5">
            <p className="text-[#F9F9F9] text-[15px] leading-6 font-semibold">
              Built for Privacy
            </p>
            <p className="text-[15px] leading-6 bg-[linear-gradient(180deg,#F9F9F9_25.68%,#8E5FFF_228.47%)] bg-clip-text text-transparent">
              Yonda protects your personal data, and only takes what is
              absolutely necessary to providing the best trips and fees for you
            </p>
          </div>
        </div>
        <div className="max-w-100.25 w-full pt-25">
          <div className="w-full aspect-401/486 rounded-[20px]">
            <Image src={yondaAssets.passport} alt="passport" />
          </div>
        </div>
        <div className="max-w-86.25 w-full flex flex-col justify-between pb-6 items-end">
          <div className="max-w-86.25 w-full flex flex-col gap-0.5">
            {privacyItems.map((item, index) => {
              return (
                <PrivacyItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  index={index}
                />
              );
            })}
          </div>
          <div className="max-w-82 w-full">
            <p className="text-[15px] leading-6 bg-[linear-gradient(180deg,#F9F9F9_25.68%,#8E5FFF_228.47%)] bg-clip-text text-transparent text-right">
              Get human verified Planning trips and ratings backed by thousands
              of hours of curated planning
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4.75 max-w-100.5 mx-auto">
        <div className="w-100.5 h-24.25 rounded-[24px] bg-white shadow-[0_0_0_1px_#0000000A,0_4px_18px_0_#0000000D,1px_4px_60px_0_#0000000A] flex flex-col gap-4 px-3 justify-center">
          <div className="pl-2">
            <p className="text-[#64646499] text-[13px] leading-6">
              Yasi with my passport where can i go on summer vacation
            </p>
          </div>
          <div className="flex justify-end">
            <div className="w-8 h-8 rounded-full bg-[#0866FF]"></div>
          </div>
        </div>

        <div className="max-w-82 w-full">
          <p className="text-[15px] leading-6 bg-[linear-gradient(180deg,rgba(11,11,11,0.5)_25.68%,rgba(142,95,255,0.5)_228.47%)] bg-clip-text text-transparent">
            Get human verified Planning trips and ratings backed by thousands of
            hours of curated planning
          </p>
        </div>
      </div>
    </div>
  );
}
