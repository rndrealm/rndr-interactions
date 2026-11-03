import React from "react";
import {
  Briefcase,
  Clock,
  Dumbbell,
  House,
  Mic,
  Plus,
  Search,
} from "lucide-react";
import { SQUIRCLE } from "./page";

// A Maps-style search sheet, sized so each detent shows a natural amount:
// closed peeks just the search field, half adds favourites and the top of
// recents (the cut-off row hints there's more), full shows the list.
const FAVOURITES = [
  { label: "Home", icon: House },
  { label: "Work", icon: Briefcase },
  { label: "Gym", icon: Dumbbell },
  { label: "Add", icon: Plus },
];

const RECENTS = [
  { name: "Tartine Bakery", detail: "Bakery · 0.6 mi" },
  { name: "Ferry Building", detail: "Market · 1.3 mi" },
  { name: "Dolores Park", detail: "Park · 1.8 mi" },
  { name: "City Lights Books", detail: "Bookstore · 0.9 mi" },
  { name: "Golden Gate Park", detail: "Park · 2.1 mi" },
  { name: "Mission Cinema", detail: "Cinema · 0.7 mi" },
  { name: "Coit Tower", detail: "Landmark · 1.6 mi" },
];

// The map behind the sheet: land, blocks and water in the light greys, white
// roads, and the location dot placed above the half detent so it stays visible
export function MapBackground({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return (
    <svg
      className="absolute inset-0 size-full"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
    >
      <path
        d="M170 -10 C190 60 230 90 274 100 V-10 Z"
        fill="oklch(0.918 0 0)"
      />
      <rect
        x="18"
        y="70"
        width="80"
        height="60"
        rx="10"
        fill="oklch(0.94 0 0)"
      />
      <rect
        x="150"
        y="150"
        width="96"
        height="70"
        rx="12"
        fill="oklch(0.94 0 0)"
      />
      <rect
        x="22"
        y="200"
        width="70"
        height="90"
        rx="10"
        fill="oklch(0.94 0 0)"
      />
      <rect
        x="140"
        y="290"
        width="100"
        height="80"
        rx="14"
        fill="oklch(0.94 0 0)"
      />
      <rect
        x="20"
        y="360"
        width="90"
        height="110"
        rx="12"
        fill="oklch(0.94 0 0)"
      />
      <g stroke="oklch(0.993 0 0)" strokeLinecap="round" fill="none">
        <path d="M-10 175 L280 165" strokeWidth="10" />
        <path d="M120 -10 L126 540" strokeWidth="10" />
        <path d="M-10 330 C80 320 180 340 280 260" strokeWidth="7" />
        <path d="M-10 50 L170 40" strokeWidth="5" />
        <path d="M250 120 L242 540" strokeWidth="5" />
      </g>
      <circle cx="123" cy="120" r="20" fill="oklch(0.649 0 0)" opacity="0.15" />
      <circle
        cx="123"
        cy="120"
        r="7"
        fill="oklch(0.649 0 0)"
        stroke="oklch(0.993 0 0)"
        strokeWidth="3"
      />
    </svg>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-geist text-xs font-medium leading-4 tracking-[-0.08px] text-[oklch(0.503_0_0)]">
        {children}
      </span>
      <span className="font-geist text-[10px] leading-4 tracking-[-0.08px] text-[oklch(0.649_0_0)]">
        More
      </span>
    </div>
  );
}

// height: the scroll area's height, so it ends at the bottom of the screen
// when the sheet is full
export function MapsSheetContent({ height }: { height: number }) {
  return (
    <div className="flex flex-col">
      {/* Closed: the sheet peeks exactly this far */}
      <div className="pb-2">
        <div
          className={`flex h-9 shrink-0 items-center gap-2 px-3 rounded-[7px] supports-[corner-shape:squircle]:rounded-[12px] ${SQUIRCLE} bg-[oklch(0.961_0_0)] text-[oklch(0.649_0_0)]`}
        >
          <Search size={14} aria-hidden />
          <span className="flex-1 font-geist text-xs tracking-[-0.08px]">
            Search Maps
          </span>
          <Mic size={14} aria-hidden />
        </div>
      </div>

      <div
        className="-mx-4 flex flex-col overflow-y-auto overscroll-contain no-scrollbar px-4 pb-4"
        style={{ height }}
      >
        <div className="mt-5 flex shrink-0 flex-col gap-2">
          <SectionTitle>Favourites</SectionTitle>
          <div className="flex justify-between px-1">
            {FAVOURITES.map(({ label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="flex size-11 items-center justify-center rounded-full bg-[oklch(0.94_0_0)] text-[oklch(0.649_0_0)]">
                  <Icon size={16} aria-hidden />
                </div>
                <span className="font-geist text-[10px] leading-3.5 tracking-[-0.08px] text-[oklch(0.503_0_0)]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex shrink-0 flex-col gap-1">
          <SectionTitle>Recents</SectionTitle>
          {RECENTS.map((place) => (
            <div
              key={place.name}
              className="flex h-11 shrink-0 items-center gap-3 border-b border-[oklch(0.94_0_0)] last:border-0"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[oklch(0.94_0_0)] text-[oklch(0.649_0_0)]">
                <Clock size={12} aria-hidden />
              </div>
              <div className="flex flex-col">
                <span className="font-geist text-xs font-medium leading-4 tracking-[-0.08px] text-[oklch(0.503_0_0)]">
                  {place.name}
                </span>
                <span className="font-geist text-[10px] leading-3.5 tracking-[-0.08px] text-[oklch(0.649_0_0)]">
                  {place.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
