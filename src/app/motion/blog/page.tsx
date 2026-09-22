"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CaretLeft } from "@/components/icons";
import { TabButton } from "../stack/page";
import Image from "next/image";

export const tabOptions = [
  { id: 1, label: "Grid", value: "grid" },
  { id: 2, label: "Row", value: "row" },
];

const data = [
  {
    id: 1,
    title: "",
    details: "",
    dp: "https://cdn.cosmos.so/ff35a8a4-7e3a-4a04-ade8-5e276d5b3401?format=webp",
  },
  {
    id: 2,
    title: "",
    details: "",
    dp: "https://cdn.cosmos.so/9cfdcc7a-2ad8-40db-86e3-31b8e8848052?format=webp",
  },
  {
    id: 3,
    title: "",
    details: "",
    dp: "https://cdn.cosmos.so/9aad77c1-c3a1-4aa1-b22f-03fa9d9ad6f1?format=webp",
  },
  {
    id: 4,
    title: "",
    details: "",
    dp: "https://cdn.cosmos.so/1b71014d-2c5f-4b33-a49c-ebf4b2712035?format=webp",
  },
];

type IData = (typeof data)[0];

interface IGridItem {
  onClick?: () => void;
  data: IData;
  delay?: number;
}

interface ITextBlock {
  delayIndex?: number;
}

function TextBlock(props: ITextBlock) {
  const { delayIndex = 1 } = props;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.3,
          delay: delayIndex * 0.1,
        },
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.1,
        },
      }}
      className="max-w-75 w-full"
    >
      <p className="text-sm leading-5 tracking-[-1.6%] text-[oklch(0.54_0.006_240)]">
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illum aut
        dignissimos tempora ab sequi reiciendis omnis libero facere! Dignissimos
        quidem excepturi numquam accusamus iure recusandae temporibus eos
        expedita aut hic reprehenderit doloremque adipisci quo modi dolorum
      </p>
    </motion.div>
  );
}

function GridItem(props: IGridItem) {
  const { onClick, data, delay = 0 } = props;

  return (
    <motion.div
      className="flex gap-4 items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.1, delay } }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        layoutId={`app_image_${data.id}`}
        className="w-20 h-20 bg-[oklch(0.894_0_0)] relative z-3 rounded-xl overflow-hidden"
      >
        <Image
          src={data?.dp}
          alt="img"
          width={80}
          height={80}
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <motion.div
            layoutId={`app_first_title_${data.id}`}
            className="w-30 h-3 0 bg-[oklch(0.894_0_0)]"
          ></motion.div>
          <motion.div
            layoutId={`app_second_title_${data.id}`}
            className="w-30 h-3 0 bg-[oklch(0.894_0_0)]"
          ></motion.div>
        </div>

        <motion.div layoutId={`app_btn_${data.id}`} className="flex">
          <button
            type="button"
            className="bg-[oklch(0.2_0.003_240)] text-[oklch(0.98_0.001_240)] text-[10px] font-medium leading-4 px-2 py-1 rounded-3xl cursor-pointer tracking-[-4%]"
            onClick={onClick}
          >
            Learn More
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function RowItem(props: IGridItem) {
  const { data, onClick, delay = 0 } = props;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2, delay } }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col max-w-50 w-full shrink-0 gap-4"
    >
      <motion.div
        layoutId={`app_image_${data.id}`}
        className="w-full h-40 bg-[oklch(0.894_0_0)] rounded-3xl overflow-hidden"
      >
        <Image
          src={data.dp}
          alt="img"
          width={160}
          height={200}
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="flex flex-col gap-2 px-2">
        <div className="flex flex-col gap-0.5">
          <motion.div
            layoutId={`app_first_title_${data.id}`}
            className="w-30 h-5 0 bg-[oklch(0.894_0_0)]"
          ></motion.div>
          <motion.div
            layoutId={`app_second_title_${data.id}`}
            className="w-30 h-5 0 bg-[oklch(0.894_0_0)]"
          ></motion.div>
        </div>

        <motion.div layoutId={`app_btn_${data.id}`} className="flex">
          <button
            type="button"
            className="bg-[oklch(0.2_0.003_240)] text-[oklch(0.98_0.001_240)] text-[10px] font-medium leading-4 px-2 py-1 rounded-3xl cursor-pointer tracking-[-4%]"
            onClick={onClick}
          >
            Learn More
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface IFullmodeImage {
  delayIndex?: number;
}
function FullmodeImage(props: IFullmodeImage) {
  const { delayIndex = 0 } = props;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: { duration: 0.2, delay: 0.1 * delayIndex },
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="w-125 h-75 bg-[oklch(0.94_0.002_240)] rounded-3xl shrink-0"
    ></motion.div>
  );
}

export default function Page() {
  const [mode, setMode] = useState("grid");
  const [selectedId, setSelectedId] = useState<IData | null>(null);
  const rowContainerRef = useRef<HTMLDivElement | null>(null);
  const rowScrollLeftRef = useRef(0);

  const [listDelay, setListDelay] = useState(0);

  useEffect(() => {
    rowContainerRef.current?.scroll({
      left: rowScrollLeftRef.current || 0,
      behavior: "instant",
    });
  }, [selectedId, mode]);

  return (
    <div className="flex flex-col min-h-screen w-full items-center justify-center overflow-x-hidden">
      <div className="flex flex-col gap-6">
        {/* {selectedId === null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.2 } }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col"
          >
            <div className="flex gap-2 items-center">
              {tabOptions.map((item) => {
                return (
                  <TabButton
                    key={item?.id}
                    isActive={mode === item?.value}
                    label={item?.label}
                    onClick={() => {
                      if (rowContainerRef.current) {
                        rowScrollLeftRef.current =
                          rowContainerRef.current.scrollLeft;
                      }
                      // setListDelay(0);
                      setMode(item?.value);
                    }}
                  />
                );
              })}
            </div>
          </motion.div>
        )} */}

        <AnimatePresence mode="popLayout">
          {selectedId === null && mode === "grid" && (
            <div
              key="grid_view"
              className="grid grid-cols-2 gap-8 max-w-125 w-full min-h-60"
            >
              {data.map((item) => {
                return (
                  <GridItem
                    key={item.id}
                    data={item}
                    delay={listDelay}
                    onClick={() => {
                      setSelectedId(item);
                    }}
                  />
                );
              })}
            </div>
          )}

          {selectedId === null && mode === "row" && (
            <div
              ref={rowContainerRef}
              key="row_view"
              className="flex gap-4 max-w-125 w-full min-h-60 overflow-x-scroll scrollbar-none"
            >
              {data.map((item) => {
                return (
                  <RowItem
                    key={item.id}
                    data={item}
                    delay={listDelay}
                    onClick={() => {
                      if (rowContainerRef.current) {
                        rowScrollLeftRef.current =
                          rowContainerRef.current.scrollLeft;
                      }

                      setSelectedId(item);
                    }}
                  />
                );
              })}
            </div>
          )}

          {selectedId !== null && (
            <div
              key="fullscreen"
              className="flex flex-col w-full items-center flex-1 py-12 gap-4"
            >
              <div className="flex max-w-125 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setListDelay(0.1);
                    setSelectedId(null);
                  }}
                  className="cursor-pointer"
                >
                  <div className="w-10 h-10 flex items-center">
                    <CaretLeft />
                  </div>
                </button>
              </div>
              <div className="max-w-125 w-full">
                <motion.div
                  layoutId={`app_image_${selectedId.id}`}
                  className="w-full h-100 bg-[oklch(0.894_0_0)] rounded-3xl overflow-hidden relative z-3"
                >
                  <Image
                    src={selectedId.dp}
                    alt="img"
                    width={500}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>

              <div className="max-w-75 w-full flex flex-col gap-1">
                <motion.div
                  layoutId={`app_first_title_${selectedId.id}`}
                  className="h-6 w-full bg-[oklch(0.894_0_0)]"
                ></motion.div>
                <motion.div
                  layoutId={`app_second_title_${selectedId.id}`}
                  className="h-6 w-full bg-[oklch(0.894_0_0)]"
                ></motion.div>
              </div>
              <TextBlock delayIndex={1} />
              <TextBlock delayIndex={2} />

              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.2, delay: 0.1 * 3 },
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full flex gap-4 overflow-x-scroll scrollbar-none"
                style={{
                  padding: "0 calc(50% - 250px)",
                }}
              >
                <div className="w-125 h-75 bg-[oklch(0.94_0.002_240)] rounded-3xl shrink-0"></div>
                <div className="w-125 h-75  bg-[oklch(0.9_0.003_240)]  rounded-3xl shrink-0"></div>
                <div className="w-125 h-75 bg-[oklch(0.85_0.004_240)] rounded-3xl shrink-0"></div>
              </motion.div>

              {/* <div
                className="w-full flex gap-4 overflow-x-scroll scrollbar-none"
                style={{
                  padding: "0 calc(50% - 250px)",
                }}
              >
                <FullmodeImage delayIndex={3} />
                <FullmodeImage delayIndex={3.5} />
                <FullmodeImage delayIndex={4} />
              </div> */}

              <TextBlock delayIndex={4} />
              <TextBlock delayIndex={5} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
