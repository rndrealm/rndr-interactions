import React from "react";
import Link from "next/link";

const links = [
  { id: 1, label: "About", href: "/yonda/about" },
  { id: 2, label: "Use Cases" },
  { id: 3, label: "Products" },
  { id: 4, label: "Company" },
  { id: 5, label: "Contacts" },
];

export function Nav() {
  return (
    <div className="app_landing_con flex justify-between items-center h-16">
      <Link href="/yonda">
        <div className="w-45">
          <div className="w-40 h-8 bg-[#F5F5F5]"></div>
        </div>
      </Link>

      <div className="flex items-center">
        {links.map((item) => {
          return (
            <Link key={item.id} href={item?.href || "#"}>
              <div className="h-10 flex items-center px-3">
                <p className="text-[#646464] text-[13px] leading-none tracking-0">
                  {item.label}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          className="text-[#646464] font-medium leading-none tracking-0 text-[13px] h-9 rounded-lg shadow-[0_0_0_1px_#0000000A,0_1px_3px_0_#00000017] px-3"
        >
          Sign Up
        </button>

        <button
          type="button"
          className="text-white bg-[#0B0B0B] font-medium leading-none tracking-0 text-[13px] h-9 rounded-lg px-3"
        >
          Join Waitlist
        </button>
      </div>
    </div>
  );
}
