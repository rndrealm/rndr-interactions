import { Bell, Gallery, Home, Stats, Vr } from "@/components/icons/sidebar";

export const SidebarLinks = [
  {
    icon: (color: string) => <Home color={color} />,
    route: "/sidebar-morph/home",
  },
  {
    icon: (color: string) => <Gallery color={color} />,
    route: "/sidebar-morph/gallery",
  },
  {
    icon: (color: string) => <Vr color={color} />,
    route: "/sidebar-morph/vr",
  },
  {
    icon: (color: string) => <Stats color={color} />,
    route: "/sidebar-morph/stats",
  },
  {
    icon: (color: string) => <Bell color={color} />,
    route: "/sidebar-morph/notifications",
  },
];
