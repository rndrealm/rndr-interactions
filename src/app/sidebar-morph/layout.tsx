"use client";

import React from "react";

const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-[#2B2B2B] h-screen w-screen flex">
      {children}
    </main>
  );
};

export default SidebarLayout;
