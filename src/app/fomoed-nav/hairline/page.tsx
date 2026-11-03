import React from "react";
import { navTheme } from "@/components/fomoed-nav/theme";

/**
 * Hairline versions of the Offers illustrations. Each figure is a standalone
 * page built by the hairline-create skill (sources in /hairline, output in
 * /public/hairline), so it's framed rather than imported.
 */
const figures = [
  {
    title: "Trading Terminal",
    concept: "Replay — scrub the session; candles after the pointer sink to stubs.",
    src: "/hairline/hairline-replay.html",
  },
];

export default function Page() {
  const t = navTheme.dark;

  return (
    <div className={`min-h-screen w-full ${t.pageBg} font-sans`}>
      <div className="max-w-[1376px] mx-auto px-6 md:px-12 py-12 flex flex-col gap-12">
        <p className={`${t.itemTitle} text-[13px] font-medium`}>
          Hairline illustrations
        </p>

        {figures.map((figure) => (
          <section key={figure.src} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className={`${t.groupTitle} text-[11px] font-medium`}>
                {figure.title.toUpperCase()}
              </p>
              <p className={`${t.itemDescription} text-[11px]`}>
                {figure.concept}
              </p>
            </div>
            <iframe
              src={figure.src}
              title={`${figure.title} — Hairline`}
              className="w-full max-w-[640px] h-[720px] rounded-[12px] border-0"
            />
          </section>
        ))}
      </div>
    </div>
  );
}
