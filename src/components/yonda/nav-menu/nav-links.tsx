"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import { MenuContent } from "./menu-content";
import type { MenuId } from "./menu-data";

const links: { id: number; label: string; href?: string; menu?: MenuId }[] = [
  { id: 1, label: "About", href: "/yonda/about" },
  { id: 2, label: "Use Cases", menu: "useCases" },
  { id: 3, label: "Products", menu: "products" },
  { id: 4, label: "Company" },
  { id: 5, label: "Contacts" },
];

const LABEL = "text-[13px] leading-none tracking-0";

/**
 * The Yonda links with the fomoed mega-menu under them. Hover opens on a mouse,
 * tap toggles on touch and pen; see fomoed-nav's NavButton for why it all
 * hangs off `pointerType`.
 */
export function NavLinks() {
  const [open, setOpen] = useState<MenuId | null>(null);
  const pointerType = useRef("mouse");

  return (
    <div
      className="flex items-center relative"
      // Mouse only: a tap fires enter -> down -> up -> leave in one gesture.
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setOpen(null);
      }}
    >
      {links.map((item) => {
        const menu = item.menu ?? null;

        if (!menu) {
          return (
            <Link
              key={item.id}
              href={item.href ?? "#"}
              onPointerEnter={() => setOpen(null)}
              className="h-10 flex items-center px-3"
            >
              <p className={`text-[#646464] ${LABEL}`}>{item.label}</p>
            </Link>
          );
        }

        const isActive = open === menu;
        return (
          <button
            key={item.id}
            type="button"
            onPointerDown={(e) => {
              pointerType.current = e.pointerType;
            }}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setOpen(menu);
            }}
            onFocus={(e) => {
              if (e.target.matches(":focus-visible")) setOpen(menu);
            }}
            onClick={() => {
              if (pointerType.current !== "mouse")
                setOpen((current) => (current === menu ? null : menu));
            }}
            aria-expanded={isActive}
            className={`h-10 flex items-center px-3 rounded-lg cursor-pointer transition-colors duration-150 ${
              isActive
                ? "bg-[#F5F5F5] text-[#0B0B0B]"
                : "text-[#646464] hover:text-[#0B0B0B]"
            }`}
          >
            <span className={LABEL}>{item.label}</span>
          </button>
        );
      })}

      {open && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 top-full pt-4">
          <MenuContent menu={open} />
        </div>
      )}
    </div>
  );
}
