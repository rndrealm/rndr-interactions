export type Theme = "dark" | "light";

/**
 * Every colour the nav uses, per theme. Class strings are written out in full
 * so Tailwind's scanner still sees them — never build them by interpolation.
 */
export const navTheme = {
  dark: {
    pageBg: "bg-[#0B0B0B]",
    logo: "#E1E1E1",
    navButtonText: "text-[#E6E6E6]",
    navButtonActive: "bg-[#131313]",
    navButtonHover: "hover:bg-[#131313]",
    signUpButton: "bg-[#0B0B0B] text-[#E6E6E6]",
    loginButton: "bg-[#FFFFFF] text-[#0B0B0B]",
    panel: "bg-[#101010] shadow-[0px_0px_0px_1px_#1B1B1B]",
    groupBorder: "border-[#1A1A1A]",
    groupTitle: "text-[#6C6C6C]",
    itemHover: "hover:bg-[#131313]",
    itemThumb: "bg-[#26262680]",
    itemTitle: "text-[#EEEEEE]",
    itemDescription: "text-[#6C6C6C]",
    caret: "#6C6C6C",
    promo: "bg-[#1D1D1D]",
  },
  light: {
    pageBg: "bg-[#FFFFFF]",
    logo: "#0B0B0B",
    navButtonText: "text-[#1A1A1A]",
    navButtonActive: "bg-[#F1F1F1]",
    navButtonHover: "hover:bg-[#F1F1F1]",
    signUpButton: "bg-[#FFFFFF] text-[#0B0B0B]",
    loginButton: "bg-[#0B0B0B] text-[#FFFFFF]",
    panel:
      "bg-[#FFFFFF] shadow-[0px_0px_0px_1px_#E6E6E6,0px_12px_32px_-8px_#0B0B0B1F]",
    groupBorder: "border-[#ECECEC]",
    groupTitle: "text-[#8F8F8F]",
    itemHover: "hover:bg-[#F5F5F5]",
    itemThumb: "bg-[#E8E8E880]",
    itemTitle: "text-[#111111]",
    itemDescription: "text-[#8F8F8F]",
    caret: "#9B9B9B",
    promo: "bg-[#F1F1F1]",
  },
} as const satisfies Record<Theme, Record<string, string>>;
