import React, { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { MenuContentItem } from "./menu-content-item";
import { IMenuData } from "./menu-content";
import { TextMorph } from "torph/react";
import { navTheme, type Theme } from "./theme";

interface IProps {
  data: IMenuData[];
  title: string;
  isVisible?: boolean;
  theme?: Theme;
}

const EXPANDED_WIDTH = 284;
const SPRING = { type: "spring", visualDuration: 0.32, bounce: 0 } as const;

export function MenuGroup(props: IProps) {
  const { data, title, isVisible = true, theme = "dark" } = props;

  const t = navTheme[theme];

  const raw = useMotionValue(isVisible ? EXPANDED_WIDTH : 0);

  /**
   * Snap the animated width to even pixels. The panel is centred, so its left
   * offset is (container - panelWidth) / 2 — an odd width puts the whole
   * subtree on a half-pixel. torph gives every character its own composited
   * layer, so a *changing* subpixel offset makes each one resample on every
   * frame, which is the vibration. Even widths keep that offset whole, and 2px
   * steps are imperceptible over 320ms.
   */
  const width = useTransform(raw, (v) => Math.round(v / 2) * 2);
  const opacity = useTransform(raw, [0, EXPANDED_WIDTH], [0.3, 1]);

  useEffect(() => {
    const controls = animate(raw, isVisible ? EXPANDED_WIDTH : 0, SPRING);
    return () => controls.stop();
  }, [isVisible, raw]);

  return (
    <motion.div
      className="shrink-0 overflow-hidden"
      style={{ width, opacity, pointerEvents: isVisible ? "auto" : "none" }}
    >
      <div
        className={`w-69 shrink-0 pt-3 pb-3.5 pl-3 pr-2 mr-2 flex flex-col border-r ${t.groupBorder}`}
      >
        <div className="w-63.75 flex flex-col">
          <div className="h-7 flex items-center px-2">
            <TextMorph
              as="p"
              className={`${t.groupTitle} text-[11px] leading-3 tracking-[-0.56%] font-medium font-sans`}
              scale={false}
              duration={320}
            >
              {title}
            </TextMorph>
          </div>
          <div className="flex flex-col gap-1">
            {/* Keyed by position, not by item.id, on purpose: the row has to
                be the SAME instance across a dataset swap or torph unmounts
                and hard-swaps instead of morphing. */}
            {data?.map((item, index) => (
              <MenuContentItem
                key={index}
                title={item.title}
                description={item.description}
                theme={theme}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
