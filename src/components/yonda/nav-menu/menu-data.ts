/**
 * What each nav button opens. A menu is one or more groups, shown side by
 * side; switching menus morphs the shared groups and folds away the rest.
 * Placeholder copy for now.
 */

export interface IMenuItem {
  id: number;
  title: string;
  description: string;
}

export interface IMenuGroupData {
  title: string;
  items: IMenuItem[];
}

export type MenuId = "useCases" | "products";

export const MENUS: Record<MenuId, IMenuGroupData[]> = {
  useCases: [
    {
      title: "USE CASES",
      items: [
        { id: 1, title: "Trip Planning", description: "Plans built around you" },
        { id: 2, title: "Group Travel", description: "Everyone on one itinerary" },
        { id: 3, title: "Business Travel", description: "Policy-aware bookings" },
        { id: 4, title: "Visa & Entry", description: "Where your passport goes" },
        { id: 5, title: "Travel Fund", description: "Save towards the next trip" },
      ],
    },
    {
      title: "FOR TEAMS",
      items: [
        { id: 1, title: "Travel Agencies", description: "Human verified, at scale" },
        { id: 2, title: "Airlines", description: "Reach travellers earlier" },
        { id: 3, title: "Hotels", description: "Stays matched to guests" },
        { id: 4, title: "Tourism Boards", description: "Bring the right visitors" },
        { id: 5, title: "Partners", description: "Build on Yonda" },
      ],
    },
  ],
  products: [
    {
      title: "PRODUCTS",
      items: [
        { id: 1, title: "AI Trip Planner", description: "Verified by humans" },
        { id: 2, title: "Travel Identity", description: "Who you are as a traveller" },
        { id: 3, title: "Travel Credits", description: "Membership that pays back" },
        { id: 4, title: "Travel Intelligence", description: "Learns you over time" },
        { id: 5, title: "Privacy Vault", description: "Your details protected" },
      ],
    },
  ],
};
