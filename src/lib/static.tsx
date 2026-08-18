import { Bell, Payments, Home, Stats, History } from "@/components/icons/sidebar";

export const SidebarLinks = [
  {
    icon: (color: string) => <Home color={color} />,
    route: "/sidebar-morph/home",
  },
  {
    icon: (color: string) => <Payments color={color} />,
    route: "/sidebar-morph/payments",
  },
  {
    icon: (color: string) => <History color={color} />,
    route: "/sidebar-morph/history",
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
