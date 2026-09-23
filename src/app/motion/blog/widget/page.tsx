"use client";
import React, { useState } from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { posts } from "../posts";
import { AvatarStack, GradientImage } from "../page";

// The house split, from posts[2]: one curve for anything that travels, and the
// same curve's quieter sibling at half the duration for anything that only
// appears. Everything in the widget moves on MOVE so it lands on one beat.
const MOVE: Transition = { duration: 0.4 * 1, ease: [0.32, 0.72, 0, 1] };
const FADE: Transition = { duration: 0.2, ease: [0.2, 0, 0, 1] };

const sizeMap = {
  sm: {
    height: 68,
  },
  lg: {
    height: 500,
  },
};

type ISizeMapKey = keyof typeof sizeMap;

export default function Page() {
  const [size, setSize] = useState<ISizeMapKey>("sm");

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <div className="h-130">
        <motion.div
          initial={false}
          animate={{ height: sizeMap[size].height }}
          // transition={MOVE}
          className="w-72 bg-[oklch(0.94_0.002_240)] rounded-2xl px-3 py-4"
          onClick={() => {
            setSize((prev) => {
              return prev === "lg" ? "sm" : "lg";
            });
          }}
        >
          <AnimatePresence mode="popLayout">
            {size === "sm" && (
              <motion.div
                key="sm_view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={FADE}
                className="flex gap-4"
              >
                <motion.div
                  layout="preserve-aspect"
                  layoutId="app_blog_widget_image"
                  className="w-9 h-9 rounded-sm bg-[oklch(0.85_0.004_240)] relative z-2 overflow-hidden"
                  transition={MOVE}
                >
                  <GradientImage src={posts[0].cover} height={36} width={36} />
                </motion.div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-5 tracking-[-1.5%] text-[#121212]">
                    {posts[0].title}
                  </p>

                  <p className="text-[11px] leading-4 font-medium tracking-normal text-[color(display-p3_0.517647_0.509804_0.505882)]">
                    {posts[0].date} · {posts[0].category}
                  </p>
                </div>
              </motion.div>
            )}

            {size === "lg" && (
              <motion.div
                key="lg_view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={FADE}
                className="w-full h-full flex flex-col gap-4"
              >
                <div className="w-full flex flex-col gap-4">
                  <div className="flex gap-3">
                    <AvatarStack authors={posts[0].authors} />
                    <div className="flex flex-col">
                      <p className="text-xs font-medium leading-3.5 tracking-[-1.5%] text-[oklch(0.3_0.004_240)">
                        {posts[0].authors
                          .map((author) => author.name)
                          .join(", ")}
                      </p>

                      <p className="text-[10px] leading-3.5 tracking-normal text-[color(display-p3_0.517647_0.509804_0.505882)]">
                        {posts[0].date} · {posts[0].category}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h4 className="text-base font-medium leading-5 tracking-0 text-[#121212]">
                      {posts[0].title}
                    </h4>

                    <p className="text-[13px] leading-4.5 text-[oklch(0.54_0.006_240)]">
                      {posts[0].description}
                    </p>
                    <p></p>
                  </div>
                </div>

                <motion.div
                  layout="preserve-aspect"
                  layoutId="app_blog_widget_image"
                  className="w-66 h-66 rounded-sm bg-[oklch(0.85_0.004_240)] aspect-square relative z-2 "
                  transition={MOVE}
                >
                  <div className="w-66 h-66 rounded-sm overflow-hidden bg-[red] flex relative">
                    <GradientImage
                      src={posts[0].cover}
                      height={264}
                      width={264}
                      className="w-full h-full flex-1"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
