import Link from "next/link";

type Demo = { href: string; name: string; isNew?: boolean };

const SECTIONS: { heading: string; demos: Demo[] }[] = [
  {
    heading: "Parallax",
    demos: [
      { href: "/parallax", name: "Parallax" },
      { href: "/parallax/demo", name: "Parallax demo" },
      { href: "/parallax/dom", name: "DOM parallax" },
      { href: "/parallax/webgl", name: "WebGL parallax" },
      { href: "/parallax/infinite", name: "Infinite grid", isNew: true },
      { href: "/parallax/infinite/webgl", name: "Infinite grid, WebGL", isNew: true },
    ],
  },
  {
    heading: "Motion",
    demos: [
      { href: "/motion/blog", name: "Motion blog", isNew: true },
      { href: "/motion/stack", name: "Motion stack" },
      { href: "/morph-elements", name: "Morphing elements" },
      { href: "/morph-switch", name: "Morphing switch" },
      { href: "/flip-cards", name: "Flip cards" },
      { href: "/sidebar-morph", name: "Sidebar morph" },
      { href: "/fomoed-nav", name: "Fomoed nav" },
      { href: "/fomoed-nav/white", name: "Fomoed nav, light" },
    ],
  },
  {
    heading: "Shaders & masks",
    demos: [
      { href: "/shimmer", name: "Shimmer" },
      { href: "/shimmer-v2", name: "Shimmer v2" },
      { href: "/shimmer-rect", name: "Shimmer rect" },
      { href: "/color-mix", name: "Colour mix" },
      { href: "/mask-carousel", name: "Mask carousel" },
      { href: "/mask-carousel-v2", name: "Mask carousel v2" },
    ],
  },
  {
    heading: "Input & composer",
    demos: [
      { href: "/composer", name: "Composer" },
      { href: "/ai-input", name: "AI input" },
      { href: "/deep-input", name: "Deep input" },
      { href: "/connected-tabs", name: "Connected tabs" },
      { href: "/cursor-tooltips", name: "Cursor tooltips" },
      { href: "/group-tags", name: "Group tags" },
    ],
  },
  {
    heading: "NFT",
    demos: [
      { href: "/mint-nft", name: "Mint" },
      { href: "/mint-nft/listing", name: "Listing" },
    ],
  },
  {
    heading: "Other",
    demos: [
      { href: "/code-illustrations", name: "Code illustrations" },
      { href: "/photoyoshi", name: "Photoyoshi" },
      { href: "/photoyoshi/buttons", name: "Photoyoshi buttons" },
      { href: "/fof", name: "404" },
    ],
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[640px] px-6 py-20 text-[14px] leading-[20px] font-normal tracking-[-0.09px]">
      <h1 className="text-[18px] leading-[1.2] font-semibold tracking-[-0.008em] text-balance">
        rndr interactions
      </h1>
      <p className="mt-2 text-grey-body-text text-pretty">
        Interaction and motion studies. Each entry is a standalone route.
      </p>

      {SECTIONS.map((section) => (
        <section key={section.heading} className="mt-9">
          <h2 className="text-[14px] leading-[20px] font-medium tracking-[-0.006em]">
            {section.heading}
          </h2>
          <ul className="mt-6">
            {section.demos.map((demo) => (
              <li key={demo.href} className="border-t border-stroke-hairline first:border-t-0">
                <Link
                  href={demo.href}
                  className="-mx-3 flex flex-wrap items-baseline justify-between gap-x-6 rounded-md px-3 py-2.5 transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-grey-component"
                >
                  <span className="font-medium">
                    {demo.name}
                    {demo.isNew && (
                      <span className="ml-2 align-[1px] text-[12px] leading-[16px] font-medium tracking-normal text-grey-solid">
                        new
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[12px] leading-[16px] tracking-normal text-grey-solid">
                    {demo.href}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <footer className="mt-12 border-t border-stroke-hairline pt-6 text-[12px] leading-[1.375] tracking-normal text-grey-solid">
        localhost:3005 · feat/parallax-infinite-blog
      </footer>
    </main>
  );
}
