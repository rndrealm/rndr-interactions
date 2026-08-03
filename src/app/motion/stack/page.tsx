"use client";
import React, { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import image1 from "../../../../public/media/motion/stack/image.png";
import image2 from "../../../../public/media/motion/stack/image2.png";

export const tabOptions = [
  { id: 1, label: "List view", value: "list_view" },
  { id: 2, label: "Card view", value: "card_view" },
  { id: 3, label: "Pack view", value: "pack_view" },
];

interface ITabButton {
  label: string;
  onClick: () => void;
  isActive: boolean;
}

export function TabButton(props: ITabButton) {
  const { isActive, label, onClick } = props;
  return (
    <button
      type="button"
      className={`relative px-4 py-1 rounded-[20px]`}
      onClick={onClick}
    >
      {isActive && (
        <motion.div
          layoutId="app_motion_stack_tab"
          className="absolute inset-0 rounded-[20px] bg-[#e9e9e9]"
        ></motion.div>
      )}
      <p
        className={`text-xs font-medium leading-4 tracking-[-0.46%] relative z-1 ${isActive ? " text-[#0d0e11]" : " text-[#878e99]"}`}
      >
        {label}
      </p>
    </button>
  );
}

const data = [
  {
    id: 1,
    profileId: "app_motion_stack_profile",
    nameId: "app_motion_stack_name",
    priceId: "app_motion_stack_price",
    serialNosId: "app_motion_stack_nos",
    img: image1,
  },
  {
    id: 2,
    profileId: "app_motion_stack_profile",
    nameId: "app_motion_stack_name",
    priceId: "app_motion_stack_price",
    serialNosId: "app_motion_stack_nos",
    img: image2,
  },
];

export default function Page() {
  const [tab, setTab] = useState(tabOptions[0].value);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="w-100 h-75 flex flex-col gap-4 bg-[rd]">
        <p className="text-sm leading-4 font-medium tracking-[-3.6%] text-black">
          Collectibles
        </p>
        <div className="flex gap-2 items-center">
          {tabOptions.map((item) => {
            return (
              <TabButton
                key={item?.id}
                isActive={tab === item?.value}
                label={item?.label}
                onClick={() => {
                  setTab(item?.value);
                }}
              />
            );
          })}
        </div>
        <div className="h-px bg-[#e7e9eb] opacity-[0.75]"></div>

        <div className=""></div>

        <AnimatePresence mode="popLayout">
          {tab === tabOptions[0].value && (
            <motion.div
              key="list_view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2 flex-1 flex-col"
            >
              {data.map((item) => {
                return (
                  <div
                    key={item?.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex gap-3 items-center">
                      <motion.div
                        layoutId={`${item?.profileId}_${item?.id}`}
                        className="relative w-15 h-15 rounded-sm overflow-hidden"
                      >
                        <Image
                          src={item?.img}
                          alt="image"
                          fill
                          sizes="192px"
                          className="object-cover"
                          priority
                        />
                      </motion.div>
                      <motion.div className="flex flex-col gap-1">
                        <motion.div
                          layoutId={`${item?.nameId}_${item?.id}`}
                          className="w-40 h-4 bg-[#E7E7E7]"
                        ></motion.div>
                        <motion.div
                          layoutId={`${item?.priceId}_${item?.id}`}
                          className="w-15 h-4 bg-[#E7E7E7]"
                        ></motion.div>
                      </motion.div>
                    </div>

                    <motion.div
                      layoutId={`${item?.serialNosId}_${item?.id}`}
                      className="w-12.5 h-4 bg-[#E7E7E7]"
                    ></motion.div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {tab === tabOptions[1].value && (
            <motion.div
              key="card_view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-4 flex-1"
            >
              {data?.map((item) => {
                return (
                  <div
                    key={item?.id}
                    className="flex-1 flex flex-col gap-2 w-full"
                  >
                    <motion.div
                      layoutId={`${item?.profileId}_${item?.id}`}
                      className="relative aspect-square w-full rounded-lg overflow-hidden"
                    >
                      <Image
                        src={item?.img}
                        alt="image"
                        fill
                        sizes="192px"
                        className="object-cover"
                        priority
                      />
                    </motion.div>
                    <motion.div className="flex flex-col gap-1">
                      <motion.div
                        layoutId={`${item?.nameId}_${item?.id}`}
                        className="w-40 h-4 bg-[#E7E7E7]"
                      ></motion.div>

                      <div className="flex items-center justify-between">
                        <motion.div
                          layoutId={`${item?.priceId}_${item?.id}`}
                          className="w-15 h-4 bg-[#E7E7E7]"
                        ></motion.div>
                        <motion.div
                          layoutId={`${item?.serialNosId}_${item?.id}`}
                          className="w-15 h-4 bg-[#E7E7E7]"
                        ></motion.div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {tab === tabOptions[2].value && (
            <motion.div
              key="pack_view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 relative"
            >
              <div className="absolute top-0 left-[50%] translate-x-[-50%] w-15 h-15">
                {data?.map((item) => {
                  return (
                    <motion.div
                      key={item?.id}
                      className="w-full h-full absolute inset-0"
                      animate={{
                        rotate: item?.id === 1 ? "-15deg" : "15deg",
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                    >
                      <motion.div
                        layoutId={`${item?.profileId}_${item?.id}`}
                        className="absolute left-0 top-0 w-full h-full rounded-xl overflow-hidden"
                      >
                        <Image
                          src={item?.img}
                          alt="image"
                          fill
                          sizes="192px"
                          className="object-cover"
                          priority
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-20 flex flex-col items-center gap-1">
                <motion.div className="w-20 h-4 bg-[#E7E7E7]"></motion.div>
                <motion.div className="w-10 h-4 bg-[#E7E7E7]"></motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
