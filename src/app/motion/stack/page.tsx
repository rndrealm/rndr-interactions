"use client";
import React, { useCallback, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { Squircle } from "@squircle-js/react";
import image1 from "../../../../public/media/motion/stack/image.png";
import image2 from "../../../../public/media/motion/stack/image2.png";

const CORNER_SMOOTHING = 0.8;

const RADIUS = {
  skeleton: 6,
  thumb: 12,
  card: 20,
  pack: 14,
} as const;

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
      // `before:` extends the hit area to 40px tall without changing the 32px
      // visible pill. Vertical only — the 8px gap would make a horizontal
      // extension collide with the neighbouring tab.
      className={`group relative flex h-8 cursor-pointer items-center px-4 rounded-[20px] before:absolute before:inset-x-0 before:-inset-y-1 before:content-['']`}
      onClick={onClick}
    >
      {isActive && (
        <motion.div
          layoutId="app_motion_stack_tab"
          className="absolute inset-0 rounded-[20px] bg-gray-3/80"
        ></motion.div>
      )}
      <p
        // Press-scale lives on the label, not the button: a CSS transform on an
        // ancestor of the layoutId pill would corrupt Motion's layout projection
        // at exactly the moment the pill starts travelling.
        className={`text-sm font-medium leading-4 tracking-[-0.46%] relative z-1 transition-[color,scale] duration-150 ease-out group-active:scale-[0.96] ${isActive ? " text-gray-12" : " text-gray-9"}`}
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

type Collectible = (typeof data)[number];

interface IThumb {
  item: Collectible;
  cornerRadius: number;
  className: string;
  isLoaded: boolean;
  onLoaded: (id: number) => void;
}

function Thumb(props: IThumb) {
  const { item, cornerRadius, className, isLoaded, onLoaded } = props;

  // A cached image can finish before React attaches onLoad, in which case the
  // event never fires and the shimmer would sit there forever.
  const captureRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete) onLoaded(item.id);
    },
    [item.id, onLoaded],
  );

  return (
    <Squircle
      asChild
      cornerRadius={cornerRadius}
      cornerSmoothing={CORNER_SMOOTHING}
    >
      <motion.div
        layoutId={`${item.profileId}_${item.id}`}
        // No `relative` here: Tailwind emits it after `absolute`, so it would
        // win over any positioning a caller passes in. Each call site brings
        // its own — `Image fill` needs one of them either way.
        className={`overflow-hidden ${className}`}
      >
        <Image
          ref={captureRef}
          src={item.img}
          alt=""
          fill
          sizes="192px"
          className="object-cover"
          priority
          onLoad={() => onLoaded(item.id)}
        />
        <span
          aria-hidden="true"
          className={`skeleton-shimmer pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out ${
            isLoaded ? "opacity-0 [animation-play-state:paused]" : "opacity-100"
          }`}
        />
      </motion.div>
    </Squircle>
  );
}

export default function Page() {
  const [tab, setTab] = useState(tabOptions[0].value);
  const [loadedIds, setLoadedIds] = useState<Record<number, boolean>>({});

  // Lifted above AnimatePresence on purpose: switching tabs unmounts the view,
  // and per-Thumb state would replay the shimmer on an already-cached image.
  const handleLoaded = useCallback((id: number) => {
    setLoadedIds((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-screen w-full items-center justify-center bg-white">
        {/* px-4 is the card's gutter — heading, divider and content all start on
          it. The tab row cancels it with -mx-4 so each pill's own px-4 lands its
          label on the same vertical. */}
        <div className="w-100 h-75 flex flex-col gap-4 px-4">
          <p className="text-base leading-5 font-medium tracking-[-3.6%] text-gray-12">
            Collectibles
          </p>
          <div className="flex gap-2 items-center -mx-4">
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
          <AnimatePresence initial={false} mode="popLayout">
            {tab === tabOptions[0].value && (
              <motion.div
                key="list_view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
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
                        <Thumb
                          item={item}
                          cornerRadius={RADIUS.thumb}
                          className="relative w-15 h-15"
                          isLoaded={!!loadedIds[item.id]}
                          onLoaded={handleLoaded}
                        />
                        <motion.div className="flex flex-col gap-1">
                          <motion.div
                            layoutId={`${item?.nameId}_${item?.id}`}
                            className="w-40 h-4 bg-gray-2 rounded-md corner-squircle"
                          ></motion.div>
                          <motion.div
                            layoutId={`${item?.priceId}_${item?.id}`}
                            className="w-15 h-4 bg-gray-2 rounded-md corner-squircle"
                          ></motion.div>
                        </motion.div>
                      </div>

                      <motion.div
                        layoutId={`${item?.serialNosId}_${item?.id}`}
                        className="w-12.5 h-4 bg-gray-2 rounded-md corner-squircle"
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
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.2 }}
                className="flex gap-4 flex-1"
              >
                {data?.map((item) => {
                  return (
                    <div
                      key={item?.id}
                      className="flex-1 flex flex-col gap-2 w-full"
                    >
                      <Thumb
                        item={item}
                        cornerRadius={RADIUS.card}
                        className="relative aspect-square w-full"
                        isLoaded={!!loadedIds[item.id]}
                        onLoaded={handleLoaded}
                      />
                      <motion.div className="flex flex-col gap-1">
                        <motion.div
                          layoutId={`${item?.nameId}_${item?.id}`}
                          className="w-40 h-4 bg-gray-2 rounded-md corner-squircle"
                        ></motion.div>

                        <div className="flex items-center justify-between">
                          <motion.div
                            layoutId={`${item?.priceId}_${item?.id}`}
                            className="w-15 h-4 bg-gray-2 rounded-md corner-squircle"
                          ></motion.div>
                          <motion.div
                            layoutId={`${item?.serialNosId}_${item?.id}`}
                            className="w-15 h-4 bg-gray-2 rounded-md corner-squircle"
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
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.2 }}
                className="flex-1 relative"
              >
                {/* 84px = 60 × 1.4. Rotated 15°, that sweeps a ~103px box, which
                    is what the skeleton bars below have to clear. */}
                <div className="absolute top-0 left-[50%] translate-x-[-50%] w-21 h-21">
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
                        <Thumb
                          item={item}
                          cornerRadius={RADIUS.pack}
                          className="absolute left-0 top-0 w-full h-full"
                          isLoaded={!!loadedIds[item.id]}
                          onLoaded={handleLoaded}
                        />
                      </motion.div>
                    );
                  })}
                </div>

                {/* These carry the first item's layoutIds so the pack's title and
                  subtitle travel into row one of the list rather than
                  cross-fading across the card while the artwork glides. */}
                <div className="mt-28 flex flex-col items-center gap-1">
                  <motion.div
                    layoutId={`${data[0].nameId}_${data[0].id}`}
                    className="w-20 h-4 bg-gray-2 rounded-md corner-squircle"
                  ></motion.div>
                  <motion.div
                    layoutId={`${data[0].priceId}_${data[0].id}`}
                    className="w-10 h-4 bg-gray-2 rounded-md corner-squircle"
                  ></motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
