import React from "react";
import {
  BatteryFull,
  Bell,
  ChevronLeft,
  ChevronRight,
  Globe,
  Hand,
  HardDrive,
  Info,
  type LucideIcon,
  RefreshCw,
  Search,
  Settings,
  Sun,
  Volume2,
} from "lucide-react";
import { SQUIRCLE } from "../squircle";

type Row = {
  label: string;
  icon?: LucideIcon;
  // Shown on the right, greyed
  value?: string;
  // Tapping pushes this page
  to?: string;
};

type PageData = {
  // Plain rows only; the root also gets search and the profile card
  groups: Row[][];
};

export const ROOT = "Settings";

export const PAGES: Record<string, PageData> = {
  Settings: {
    groups: [
      [
        { label: "General", icon: Settings, to: "General" },
        { label: "Display", icon: Sun, to: "Display" },
        { label: "Sounds", icon: Volume2, to: "Sounds" },
        { label: "Notifications", icon: Bell, to: "Notifications" },
      ],
      [
        { label: "Privacy", icon: Hand, to: "Privacy" },
        { label: "Battery", icon: BatteryFull, to: "Battery" },
      ],
    ],
  },
  General: {
    groups: [
      [
        { label: "About", icon: Info, to: "About" },
        { label: "Software Update", icon: RefreshCw, to: "Software Update" },
      ],
      [
        { label: "Language & Region", icon: Globe, to: "Language & Region" },
        { label: "Storage", icon: HardDrive, to: "Storage" },
      ],
    ],
  },
  About: {
    groups: [
      [
        { label: "Name", value: "Ada's iPhone" },
        { label: "iOS Version", value: "26.1" },
        { label: "Model", value: "iPhone 17 Pro" },
      ],
      [
        { label: "Capacity", value: "256 GB" },
        { label: "Available", value: "184 GB" },
        { label: "Songs", value: "1,204" },
        { label: "Photos", value: "8,931" },
      ],
    ],
  },
  "Software Update": {
    groups: [
      [
        { label: "Automatic Updates", value: "On" },
        { label: "Beta Updates", value: "Off" },
      ],
      [{ label: "iOS 26.1", value: "Up to date" }],
    ],
  },
  "Language & Region": {
    groups: [
      [
        { label: "iPhone Language", value: "English" },
        { label: "Region", value: "United Kingdom" },
      ],
      [
        { label: "Calendar", value: "Gregorian" },
        { label: "Temperature", value: "°C" },
        { label: "First Day of Week", value: "Monday" },
      ],
    ],
  },
  Storage: {
    groups: [
      [
        { label: "Photos", value: "41.2 GB" },
        { label: "Apps", value: "18.6 GB" },
        { label: "Messages", value: "6.3 GB" },
        { label: "System", value: "5.9 GB" },
      ],
    ],
  },
  Display: {
    groups: [
      [
        { label: "Appearance", value: "Light" },
        { label: "True Tone", value: "On" },
        { label: "Night Shift", value: "Off" },
      ],
      [
        { label: "Auto-Lock", value: "30 sec" },
        { label: "Text Size", value: "Default" },
      ],
    ],
  },
  Sounds: {
    groups: [
      [
        { label: "Ringtone", value: "Reflection" },
        { label: "Text Tone", value: "Note" },
      ],
      [
        { label: "Keyboard Clicks", value: "On" },
        { label: "Lock Sound", value: "On" },
      ],
    ],
  },
  Notifications: {
    groups: [
      [
        { label: "Show Previews", value: "When Unlocked" },
        { label: "Scheduled Summary", value: "Off" },
      ],
      [
        { label: "Messages", value: "Banners" },
        { label: "Calendar", value: "Banners" },
        { label: "Mail", value: "Off" },
      ],
    ],
  },
  Privacy: {
    groups: [
      [
        { label: "Location Services", value: "On" },
        { label: "Tracking", value: "Off" },
      ],
      [
        { label: "Camera", value: "3 apps" },
        { label: "Microphone", value: "2 apps" },
        { label: "Photos", value: "5 apps" },
      ],
    ],
  },
  Battery: {
    groups: [
      [
        { label: "Battery Percentage", value: "On" },
        { label: "Low Power Mode", value: "Off" },
      ],
      [
        { label: "Maximum Capacity", value: "98%" },
        { label: "Charge Limit", value: "80%" },
      ],
    ],
  },
};

const GROUP = `flex flex-col overflow-hidden rounded-[10px] supports-[corner-shape:squircle]:rounded-[16px] ${SQUIRCLE} bg-[oklch(0.982_0_0)]`;
const TEXT = "font-geist text-xs leading-4 tracking-[-0.08px]";

function RowItem(props: { row: Row; onOpen: (to: string) => void }) {
  const { row, onOpen } = props;
  const Icon = row.icon;

  const content = (
    <>
      {Icon && (
        <span
          className={`flex size-6 shrink-0 items-center justify-center rounded-[5px] supports-[corner-shape:squircle]:rounded-[8px] ${SQUIRCLE} bg-[oklch(0.918_0_0)] text-[oklch(0.503_0_0)]`}
        >
          <Icon size={13} aria-hidden />
        </span>
      )}
      {/* The divider starts at the text, like iOS, not at the icon */}
      <span className="flex h-10 min-w-0 flex-1 items-center gap-2 border-b border-[oklch(0.94_0_0)] group-last:border-b-0">
        <span className={`${TEXT} flex-1 truncate text-[oklch(0.375_0_0)]`}>
          {row.label}
        </span>
        {row.value && (
          <span className={`${TEXT} shrink-0 text-[oklch(0.649_0_0)]`}>
            {row.value}
          </span>
        )}
        {row.to && (
          <ChevronRight
            size={14}
            className="shrink-0 text-[oklch(0.649_0_0)]"
            aria-hidden
          />
        )}
      </span>
    </>
  );

  const className =
    "group flex w-full items-center gap-2.5 pl-3 pr-2.5 text-left";

  if (!row.to) return <div className={className}>{content}</div>;

  const to = row.to;
  return (
    <button
      type="button"
      onClick={() => onOpen(to)}
      className={`${className} cursor-pointer outline-none transition-colors active:bg-[oklch(0.961_0_0)] focus-visible:bg-[oklch(0.961_0_0)]`}
    >
      {content}
    </button>
  );
}

interface ISettingsPage {
  name: string;
  // Title of the page underneath, for the back button
  back?: string;
  onOpen: (to: string) => void;
  onBack: () => void;
}

// One screen of a Settings-style navigation stack. Fills its parent; the
// page positions and slides it.
export function SettingsPage(props: ISettingsPage) {
  const { name, back, onOpen, onBack } = props;
  const page = PAGES[name];

  return (
    <div className="flex h-full w-full flex-col bg-[oklch(0.961_0_0)]">
      <div className="flex h-8 shrink-0 items-end px-2 pt-10 box-content">
        {back && (
          <button
            type="button"
            onClick={onBack}
            className={`${TEXT} flex cursor-pointer items-center text-[oklch(0.503_0_0)] outline-none`}
          >
            <ChevronLeft size={18} aria-hidden />
            <span className="max-w-24 truncate">{back}</span>
          </button>
        )}
      </div>

      {/* touch-pan-y here too: a scroller doesn't inherit the container's
          touch-action, and without it the browser claims sideways drags
          (pointercancel) and the swipe back fires mid-drag */}
      <div className="no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain touch-pan-y px-3 pb-8">
        <h2 className="mt-3 px-1 font-geist text-xl font-semibold leading-7 tracking-[-0.4px] text-[oklch(0.375_0_0)]">
          {name}
        </h2>

        {name === ROOT && (
          <>
            <div
              className={`-mt-1 flex h-8 shrink-0 items-center gap-1.5 rounded-[8px] supports-[corner-shape:squircle]:rounded-[14px] ${SQUIRCLE} bg-[oklch(0.94_0_0)] px-2.5 text-[oklch(0.649_0_0)]`}
            >
              <Search size={13} aria-hidden />
              <span className={TEXT}>Search</span>
            </div>
            <div className={`${GROUP} shrink-0`}>
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[oklch(0.894_0_0)] font-geist text-xs font-medium text-[oklch(0.503_0_0)]">
                  AL
                </span>
                <span className="flex min-w-0 flex-col">
                  <span
                    className={`${TEXT} truncate font-medium text-[oklch(0.375_0_0)]`}
                  >
                    Ada Lovelace
                  </span>
                  <span
                    className={`truncate font-geist text-[10px] leading-3.5 text-[oklch(0.649_0_0)]`}
                  >
                    Apple Account, iCloud, and more
                  </span>
                </span>
              </div>
            </div>
          </>
        )}

        {page.groups.map((group, index) => (
          <div key={index} className={`${GROUP} shrink-0`}>
            {group.map((row) => (
              <RowItem key={row.label} row={row} onOpen={onOpen} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
