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
    navButtonActive: "bg-[#131313] text-[#FFFFFF]",
    navButtonHover: "hover:bg-[#131313] hover:text-[#FFFFFF]",
    loginButton: "bg-transparent text-[#E6E6E6] hover:bg-[#131313] hover:text-[#FFFFFF]",
    signUpButton:
      "bg-[oklch(0.587_0.193_252)] text-[oklch(1_0_0)] hover:bg-[oklch(0.53_0.193_252)]",
    kbd: "bg-white/12 text-[#8F8F8F]",
    kbdPrimary: "bg-white/20 text-[oklch(1_0_0)]",
    panel:
      "bg-[#101010] shadow-[inset_0_0_0_0.5px_#ffffff12,0_8px_40px_0_#0000000d,0_12px_32px_-16px_#00000026]",
    groupBorder: "border-[#1A1A1A]",
    groupTitle: "text-[#6C6C6C]",
    itemHover: "hover:bg-[#131313]",
    itemThumb: "bg-[#26262680] shadow-[inset_0_0_0_0.5px_#ffffff12,0_1px_2px_-1px_#0000001a]",
    itemTitle: "text-[#E6E6E6] group-hover:text-[#FFFFFF]",
    itemDescription: "text-[#6C6C6C]",
    promo: "bg-[#1D1D1D]",
  },
  light: {
    pageBg: "bg-[#FFFFFF]",
    logo: "oklch(0.145 0 0)",
    // Nav labels sit at the muted step; every text role is one rung
    // lighter than the base mapping.
    navButtonText: "text-[oklch(0.556_0_0)]",
    navButtonActive: "bg-[#F1F1F1] text-[oklch(0.205_0_0)]",
    navButtonHover: "hover:bg-[#F1F1F1] hover:text-[oklch(0.205_0_0)]",
    loginButton:
      "bg-transparent text-[oklch(0.556_0_0)] hover:bg-[#F1F1F1] hover:text-[oklch(0.205_0_0)]",
    signUpButton:
      "bg-[oklch(0.587_0.193_252)] text-[oklch(1_0_0)] hover:bg-[oklch(0.53_0.193_252)]",
    kbd: "bg-black/8 text-[oklch(0.556_0_0)]",
    kbdPrimary: "bg-white/20 text-[oklch(1_0_0)]",
    panel:
      "bg-[#FFFFFF] shadow-[0_0_0_0.5px_#0000000f,0_8px_40px_0_#0000000d,0_12px_32px_-16px_#00000026]",
    groupBorder: "border-[#ECECEC]",
    groupTitle: "text-[oklch(0.708_0_0)]",
    itemHover: "hover:bg-[#F5F5F5]",
    itemThumb: "bg-[#FFFFFF] shadow-[0_0_0_0.5px_#0000000f,0_1px_2px_-1px_#0000001a]",
    itemTitle:
      "text-[oklch(0.556_0_0)] group-hover:text-[oklch(0.205_0_0)]",
    itemDescription: "text-[oklch(0.708_0_0)]",
    promo: "bg-[#F1F1F1]",
  },
} as const satisfies Record<Theme, Record<string, string>>;
