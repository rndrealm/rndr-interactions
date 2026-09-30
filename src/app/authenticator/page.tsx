"use client";
import React, { Fragment, useState } from "react";
import { GridButton } from "@/components/photoyoshi/grid-button";
import { RowButton } from "@/components/photoyoshi/row-button";
import { AnimatePresence, motion } from "motion/react";

const testData = [
  { id: 1, label: "Stripe" },
  { id: 2, label: "Github" },
  { id: 3, label: "Stripe" },
  { id: 4, label: "Github" },
  { id: 5, label: "Stripe" },
  { id: 6, label: "Github" },
];

interface IListItem {
  item: (typeof testData)[0];
}

function ListItem(props: IListItem) {
  const { item } = props;

  return (
    <div className="flex rounded-[38px] bg-[oklch(0.993_0_0)] px-2 py-2 gap-4">
      <motion.div
        layoutId={`app_authenticator_logo_${item.id}`}
        className="w-14 h-14 rounded-full bg-[oklch(0.894_0_0)]"
      ></motion.div>
      <div className="flex flex-col justify-center gap-1">
        <p className="text-[oklch(0.503_0_0)] text-sm font-medium leading-5 tracking-[-1.4%]">
          Stripe
        </p>
        <p className="text-[oklch(0.375_0_0)] text-sm font-medium leading-5 tracking-[1.4%]">
          <span>225</span> <span>175</span>
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  const [isList, setIsList] = useState(false);

  return (
    <div className="w-full h-screen flex flex-col items-center">
      <div className="max-w-105 w-full h-full py-6 flex flex-col gap-4 bg-[#f4f4f4]">
        <div className="flex items-center justify-between px-4">
          <div className="w-8 h-8 bg-[oklch(0.894_0_0)]"></div>

          <div className="flex">
            <GridButton
              isActive={false}
              onClick={() => {
                setIsList(false);
              }}
            />
            <RowButton
              isActive={false}
              onClick={() => {
                setIsList(true);
              }}
            />
          </div>

          <div className="w-8 h-8 bg-[oklch(0.894_0_0)]"></div>
        </div>
        <AnimatePresence mode="wait">
          {!isList && (
            <Fragment>
              <div className="px-4">
                <h2 className="text-4xl text-center leading-12 font-medium text-[oklch(0.375_0_0)]">
                  Github
                </h2>
              </div>

              <div className="flex justify-center px-4">
                <p className="text-[oklch(0.503_0_0)] text-sm leading-4.5 tracking-[-1.4%]">
                  Rndr Realm
                </p>
              </div>

              <div className="px-4">
                <h2 className="text-5xl text-center leading-15 font-medium text-[oklch(0.375_0_0)] tracking-[2.5%]">
                  <span>225</span> <span>174</span>
                </h2>
              </div>

              <div className="px-4 flex justify-center">
                <p className="text-[oklch(0.503_0_0)] text-[13px] leading-4.5 tracking-[-1.4%]">
                  Your token expires in 7 sec
                </p>
              </div>

              <div className="px-4 grid grid-cols-4 gap-4 mt-4">
                {testData.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 items-center"
                    >
                      <motion.div
                        layoutId={`app_authenticator_logo_${item.id}`}
                        className="w-14 h-14 rounded-full bg-[oklch(0.894_0_0)]"
                      ></motion.div>
                      <p className="text-[oklch(0.503_0_0)] text-xs font-medium leading-4.5 tracking-[-1.4%]">
                        Stripe
                      </p>
                    </div>
                  );
                })}
              </div>
            </Fragment>
          )}
          {isList && (
            <div className="flex flex-col gap-4 px-4 mt-6">
              {testData.map((item) => {
                return <ListItem key={item.id} item={item} />;
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
