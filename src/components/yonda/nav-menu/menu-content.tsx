"use client";
import React, { useState } from "react";
import { MenuGroup } from "@/components/fomoed-nav/menu-group";
import { navTheme } from "@/components/fomoed-nav/theme";
import { MENUS, type IMenuItem, type MenuId } from "./menu-data";

const THEME = "light";

/** As many group slots as the widest menu; a menu without a group there folds it away. */
const SLOTS = Math.max(...Object.values(MENUS).map((groups) => groups.length));

/**
 * What a folded slot shows while it closes: the first group any menu puts
 * there, so it keeps its rows instead of emptying mid-fold.
 */
const FALLBACK = Array.from(
  { length: SLOTS },
  (_, i) => Object.values(MENUS).find((groups) => groups[i])![i],
);

interface IProps {
  menu: MenuId;
}

export function MenuContent(props: IProps) {
  const { menu } = props;

  const t = navTheme[THEME];
  const groups = MENUS[menu];

  /**
   * The last row hovered. It sticks when the pointer leaves, so crossing the
   * gap between rows doesn't flash back to the default.
   */
  const [hovered, setHovered] = useState<IMenuItem | null>(null);

  const items = groups.flatMap((group) => group.items);
  const active = hovered && items.includes(hovered) ? hovered : items[0];

  return (
    <div
      className={`relative h-77.5 overflow-hidden rounded-[20px] ${t.panel} flex gap-0`}
    >
      {FALLBACK.map((fallback, i) => {
        const group = groups[i] ?? fallback;
        return (
          <MenuGroup
            key={i}
            title={group.title}
            data={group.items}
            isVisible={Boolean(groups[i])}
            onItemHover={(item) => setHovered(item)}
            theme={THEME}
          />
        );
      })}

      <div className="w-60 h-full py-3 mr-3">
        <IllustrationPlaceholder label={active.title} />
      </div>
    </div>
  );
}

/** Stands in for the promo illustration until each row has its own. */
function IllustrationPlaceholder({ label }: { label: string }) {
  const t = navTheme[THEME];
  return (
    <div
      className={`w-full h-full ${t.promo} rounded-[8px] flex items-end p-3`}
    >
      <p className={`${t.itemDescription} text-[11px] leading-3 font-sans`}>
        {label}
      </p>
    </div>
  );
}
