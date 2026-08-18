"use client";

import React from "react";

const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // The page paints its own backdrop so the theme toggle can drive it; the layout
    // only centres.
    <main className="h-screen w-screen flex items-center justify-center relative">
      {children}
    </main>
  );
};

export default SidebarLayout;
