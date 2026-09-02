import { useState } from "react";
import { motion } from "motion/react";

const bars = [0.4, 0.6, 0.9, 0.4, 0.85, 0.3];

const AudioButton = () => {
  const [hoverKey, setHoverKey] = useState(0);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onMouseEnter={() => setHoverKey((k) => k + 1)}
      className="bg-[rgba(249,249,249,0.06)] rounded-full cursor-pointer size-8 flex items-center justify-center"
      style={{ boxShadow: "0px 0px 0px 1px rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-0.5">
        {bars.map((bar, i) => {
          const base = 14 * bar;
          const extended = base * 1.7;
          return (
            <motion.div
              key={`${i}-${hoverKey}`}
              className="w-[1.5px] rounded-full bg-[rgba(249,249,249,0.5)]"
              initial={{ height: base }}
              animate={{ height: [base, extended, base] }}
              transition={{
                duration: 0.35,
                ease: "easeInOut",
                delay: i * 0.03,
              }}
            />
          );
        })}
      </div>
    </motion.button>
  );
};

export default AudioButton;
