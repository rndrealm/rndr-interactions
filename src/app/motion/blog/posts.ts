// Content model for the blog demo.
//
// The shape mirrors a long-form engineering post: a meta block, a two-paragraph
// intro, a table of contents, then H2 sections whose bodies interleave prose with
// media — wide figures and horizontal scrollers.
//
// The section list and the block rhythm of the first post follow the structure of
// interfere.com/blog/how-we-built-interferes-new-website, which is the layout this
// page is being built against. The prose is our own.

export type Figure = { src: string; caption?: string };

export type Block =
  | { type: "p"; text: string }
  | { type: "figure"; figure: Figure }
  | { type: "scroller"; figures: Figure[] };

export type Section = {
  id: string;
  heading: string;
  blocks: Block[];
};

export type Post = {
  id: number;
  category: string;
  title: string;
  description: string;
  authors: { name: string; initials: string; role: string; avatar: string }[];
  date: string;
  cover: string;
  intro: string[];
  sections: Section[];
  cta: { heading: string; primary: string; secondary: string };
};

const IMAGES = [
  "/blog/fixed-1.webp",
  "/blog/fixed-2.webp",
  "/blog/fixed-3.webp",
  "/blog/fixed-4.webp",
];

const p = (text: string): Block => ({ type: "p", text });
// A standalone image with no caption.
const img = (src: string): Block => ({ type: "figure", figure: { src } });

export const posts: Post[] = [
  {
    id: 1,
    category: "Craft",
    title: "How we built the new rndr website",
    description:
      "A week-long sprint on identity, homepage graphics and animation, and why every asset on the site is code.",
    authors: [
      {
        name: "Jason Udi",
        initials: "JU",
        role: "Design",
        avatar: "/blog/fixed-1.webp",
      },
      {
        name: "Stephen Oye",
        initials: "SO",
        role: "Front end engineer",
        avatar: "/blog/fixed-2.webp",
      },
    ],
    date: "September 1, 2026",
    cover: IMAGES[0],
    intro: [
      "Rebuilding a website is never easy, especially when you're also defining the visual identity for an early-stage studio that's still relatively unknown. We did a week-long sprint to work out how we wanted rndr to look and feel.",
      "There were a lot of interesting discussions, explorations and iterations during that week, and we distilled some of them into this post.",
    ],
    sections: [
      {
        id: "visual-identity",
        heading: "Visual identity",
        blocks: [
          p(
            "We started with the visual identity. We had very little to go off of, so we explored dozens of completely different directions in Figma until one of them clicked: a clean and minimal look that is unmistakably rndr.",
          ),
          img(IMAGES[0]),
          p(
            "These explorations ranged from ethereal to very technical, to see what rndr could feel like. They gave us the two signature details the site is built on: the depth gradient, and a headline whose final word dissolves into the grid behind it.",
          ),
          p(
            "The gradient shows up throughout the website. It's behind the graphics, in the command menu, under the quote block and in a dozen other places. It's a nice visual thread that ties seemingly unrelated elements together and makes the site feel cohesive.",
          ),
        ],
      },
      {
        id: "homepage-graphics",
        heading: "Homepage graphics",
        blocks: [
          p(
            "For the homepage graphics, we wanted to find the right level of transparency — one that would let the gradient show through while still blending with the main container.",
          ),
          {
            type: "scroller",
            figures: [
              { src: IMAGES[0], caption: "One — a plain background." },
              { src: IMAGES[1], caption: "Two — too dark." },
              { src: IMAGES[2], caption: "Three — almost there." },
              { src: IMAGES[3], caption: "Four — where we landed." },
            ],
          },
          p(
            "You can see in the examples above that example number one uses a plain background, which doesn't connect with the gradient behind it.",
          ),
          p(
            "Example number two is too dark, and makes the navigation icons almost invisible.",
          ),
          p(
            "Example number three is close, but the top of the sidebar sits too near the pure white of the main container, which makes the overall structure harder to read.",
          ),
          p(
            "We settled on the semi-transparent grey in example number four, the only option that met every criterion.",
          ),
          p(
            "An extra challenge was the different rendering of the same colour between Figma and the browser. Figma renders shadows behind transparent fills; browsers don't. The result is two visibly different outputs from one value, which makes Figma a poor testing ground for colour.",
          ),
        ],
      },
      {
        id: "ui-graphics",
        heading: "UI graphics",
        blocks: [
          p(
            "We put a lot of effort into every small detail of the work itself, but showing a real interface as-is can introduce noise and clutter that takes away from whatever you're actually trying to communicate.",
          ),
          p(
            "So we simplified the graphics, using skeleton UI for the unimportant parts of a screen. It lets each asset say exactly one thing.",
          ),
          {
            type: "figure",
            figure: {
              src: IMAGES[2],
              caption:
                "The same panel, before and after the unimportant rows were reduced to skeletons.",
            },
          },
        ],
      },
      {
        id: "animations",
        heading: "Animations",
        blocks: [
          p(
            "We put a lot of effort into animating parts of the website too. On a landing page you can generally be more creative and playful than you can inside a product.",
          ),
          p(
            "We still wanted the animations to be performant and tasteful, and we didn't want to animate things for the sake of animating. Most of the animations give you a glimpse of how the work is actually made.",
          ),
        ],
      },
      {
        id: "homepage-animations",
        heading: "Homepage animations",
        blocks: [
          p(
            "The first animation we built was the staggered hero sequence. The only properties animated are blur, opacity and translateY. Blur goes from 10px to 0px, opacity from 0 to 1, and translateY from 20% to 0%.",
          ),
          p(
            "The elements are grouped by kind. The main title animates by word, while the description and the buttons each animate as a single block. The stagger timing differs slightly per group, so the sequence doesn't feel robotic.",
          ),
          img(IMAGES[1]),
          p(
            "The second part of the hero is the timeline sequence. With this one we wanted to show how the work comes together, on the homepage itself.",
          ),
          p(
            "We're big fans of sites where the marketing page is the product. That wasn't quite realistic for us, but we wanted to do something in the same spirit.",
          ),
          img(IMAGES[2]),
          p(
            "It animates many of the same properties and values as the hero sequence. Every item runs the same three steps in order: the line draws down, the marker animates in, then the content animates in. As soon as one line finishes drawing, the next begins.",
          ),
          p(
            "The animation is heavy and long, so we only play it the first time you land on the page. Navigating back to the homepage later doesn't replay it, because that would get annoying quickly.",
          ),
          img(IMAGES[3]),
          p(
            "There are subtler animations too. Below the hero there's a loop of three steps that explains how the studio works. Nobody arrives knowing what we do, so it felt important to explain it clearly.",
          ),
          p(
            "These are intentionally much quieter than the hero animations. The page is already heavily animated and we didn't want it to be overwhelming. Over-animation is a real thing, especially now that it's so easy to animate anything.",
          ),
          img(IMAGES[0]),
          p(
            "The last one is the text reveal on scroll in the testimonial block. As you scroll, the words animate in with blur and opacity, grouped in threes. Slow it down and you'll see three words moving at any moment; animating them one by one feels robotic.",
          ),
          img(IMAGES[1]),
        ],
      },
      {
        id: "product-hero-animations",
        heading: "Product hero animations",
        blocks: [
          p(
            "After launching the homepage we realised we needed dedicated pages for different audiences, since each one wants something different. We decided to make every hero distinct, and animate each in its own way.",
          ),
          p(
            "The engineering hero is an animated diagram built out of SVG paths. The animation is a single CSS keyframe, looping, animating stroke-dashoffset to -5 over 0.7s.",
          ),
          p(
            "The design hero is an animated stack of previews. It's a simple thing — blur, opacity and scale as the stack cycles.",
          ),
          img(IMAGES[2]),
          img(IMAGES[3]),
          p(
            "The third hero is a field of cards tied to a single point by a dotted pattern. We first tried an SVG for the dots, but rendering thousands of DOM nodes was a serious performance drain, so we moved it to canvas.",
          ),
          p(
            "The last hero isn't animated at all. We built the asset entirely in code and then applied a transform to give it an isometric look.",
          ),
          img(IMAGES[0]),
        ],
      },
      {
        id: "assets",
        heading: "Assets",
        blocks: [
          p(
            "Every asset on the website is built in code, with a few exceptions where that wasn't possible. It's significantly more work, but we weren't willing to compromise or take shortcuts.",
          ),
          p(
            "A landing page with assets built in code feels very different from one that uses images. Sometimes images are inevitable, and some things are genuinely hard to build in code — but for the main assets, images were never a consideration.",
          ),
          p(
            "It's also a big performance win. Even heavily optimised images lose to good code.",
          ),
        ],
      },
      {
        id: "tech-stack",
        heading: "Tech stack",
        blocks: [
          p(
            "We build with Next and the app router, Tailwind for styles, Motion for animation, Base UI for primitives, and plain GLSL behind react-three-fiber for anything that needs the GPU.",
          ),
        ],
      },
      {
        id: "easter-eggs",
        heading: "Easter eggs",
        blocks: [
          p(
            "The first isn't really an easter egg, more a quality-of-life detail: right-clicking the logo in the navigation lets you copy it or download the brand assets.",
          ),
          p(
            "The other is better hidden. Clicking the plus in the list of avatars in the hero takes you somewhere we haven't linked from anywhere else. We'd been waiting for someone to find it, and someone finally did.",
          ),
        ],
      },
      {
        id: "join-us",
        heading: "Join us",
        blocks: [
          p(
            "If you like what you've read and you care deeply about craft and quality, we're always looking for people to work with.",
          ),
          p(
            "We're a small team building interfaces for people who notice the easing curve nobody names and the hairline that has to hold on every surface.",
          ),
          p(
            "Have a look at the work and see whether there's something here you'd want to make. And even if there isn't, we're always happy to talk.",
          ),
        ],
      },
    ],
    cta: {
      heading: "Interfaces that never feel cheap",
      primary: "Start a project",
      secondary: "See the work",
    },
  },
  {
    id: 2,
    category: "Engineering",
    title: "Infinite grids without infinite draw calls",
    description:
      "Nine tiles, one instanced mesh and a modulo. The wrap, the instancing, and the seam on fractional pixel ratios.",
    authors: [
      {
        name: "Raji Deji",
        initials: "RD",
        role: "Full stack",
        avatar: "/blog/fixed-3.webp",
      },
      {
        name: "Jason Udi",
        initials: "JU",
        role: "Design",
        avatar: "/blog/fixed-1.webp",
      },
    ],
    date: "August 12, 2026",
    cover: IMAGES[1],
    intro: [
      "An infinite grid is a trick of arithmetic, not of memory. You render a fixed number of tiles and move them, and a modulo does the rest.",
      "This post covers the three things that took us longest to get right: the wrap, the instancing, and the seam that appears on fractional pixel ratios.",
    ],
    sections: [
      {
        id: "the-wrap",
        heading: "The wrap",
        blocks: [
          p(
            "Each tile's position is its index offset by the scroll, taken modulo the span of the grid. As a tile passes the far edge it reappears at the near one — still the same instance, still the same buffer.",
          ),
          p(
            "The only real constraint is that the span has to exceed the viewport diagonal, or you'll catch a tile teleporting while it's still on screen.",
          ),
          {
            type: "figure",
            figure: {
              src: IMAGES[1],
              caption:
                "Nine tiles covering a viewport that would otherwise need dozens.",
            },
          },
        ],
      },
      {
        id: "instancing",
        heading: "Instancing",
        blocks: [
          p(
            "Once positions are arithmetic, the whole grid collapses into a single instanced mesh. Per-tile data — offset, texture index, a scalar for parallax depth — rides along as instanced attributes.",
          ),
          img(IMAGES[2]),
        ],
      },
      {
        id: "the-seam",
        heading: "The seam",
        blocks: [
          p(
            "Sub-pixel gaps appear where two tiles meet on fractional device-pixel ratios. Snapping the wrapped offset to whole device pixels before it reaches the vertex shader removes them, with no visible loss of smoothness.",
          ),
        ],
      },
    ],
    cta: {
      heading: "Interfaces that never feel cheap",
      primary: "Start a project",
      secondary: "See the work",
    },
  },
  {
    id: 3,
    category: "Craft",
    title: "Notes on easing and duration",
    description:
      "Two curves cover almost everything. How we split the work between them, and why nothing runs past 300ms.",
    authors: [
      {
        name: "Stephen Oye",
        initials: "SO",
        role: "Front end engineer",
        avatar: "/blog/fixed-2.webp",
      },
    ],
    date: "July 28, 2026",
    cover: IMAGES[2],
    intro: [
      "Two curves cover nearly everything an interface needs to do. Reaching for a third is usually a sign that the duration is wrong, not the easing.",
      "Here's how we divide the work between them, and why almost nothing here runs longer than 300ms.",
    ],
    sections: [
      {
        id: "movement",
        heading: "Movement",
        blocks: [
          p(
            "Anything travelling across the screen uses cubic-bezier(0.32, 0.72, 0, 1) — a fast departure and a long, quiet settle. It reads as weight, with no spring physics to tune.",
          ),
          img(IMAGES[2]),
        ],
      },
      {
        id: "reveal-and-press",
        heading: "Reveal and press",
        blocks: [
          p(
            "Opacity changes and press states use cubic-bezier(0.2, 0, 0, 1) at half the duration. A reveal that eases like a moving object feels slow even when it isn't.",
          ),
        ],
      },
      {
        id: "duration",
        heading: "Duration",
        blocks: [
          p(
            "Under 300ms, always. Past that the animation stops being feedback and starts being a wait, and people begin routing around it.",
          ),
        ],
      },
    ],
    cta: {
      heading: "Interfaces that never feel cheap",
      primary: "Start a project",
      secondary: "See the work",
    },
  },
  {
    id: 4,
    category: "Engineering",
    title: "Shipping shaders in a Next app",
    description:
      "One bundler rule, uniforms declared once, and hot reload that keeps scene state. The setup we've settled on.",
    authors: [
      {
        name: "Raji Deji",
        initials: "RD",
        role: "Full stack",
        avatar: "/blog/fixed-3.webp",
      },
      {
        name: "Stephen Oye",
        initials: "SO",
        role: "Front end engineer",
        avatar: "/blog/fixed-2.webp",
      },
    ],
    date: "June 30, 2026",
    cover: IMAGES[3],
    intro: [
      "Shaders want to live in .glsl files, with syntax highlighting and a diff you can read. Getting there takes one bundler rule and a little discipline about uniforms.",
      "This is the setup we've settled on, and the one thing it still can't do.",
    ],
    sections: [
      {
        id: "loading",
        heading: "Loading",
        blocks: [
          p(
            "A Turbopack rule maps .glsl, .vert and .frag through raw-loader and emits them as modules. From the component's side a shader is just a string import, which keeps it out of the JSX entirely.",
          ),
          {
            type: "figure",
            figure: {
              src: IMAGES[3],
              caption:
                "Fragment source living beside the material that consumes it.",
            },
          },
        ],
      },
      {
        id: "uniforms",
        heading: "Uniforms",
        blocks: [
          p(
            "Every uniform is declared once, in the material, with a default. Passing them ad hoc from the render loop is how you end up with a shader that only works on the page it was written for.",
          ),
        ],
      },
      {
        id: "hot-reload",
        heading: "Hot reload",
        blocks: [
          p(
            "Editing a .glsl file recompiles the program in place and keeps the scene's state, which turns shader work into something you iterate on rather than restart into.",
          ),
        ],
      },
    ],
    cta: {
      heading: "Interfaces that never feel cheap",
      primary: "Start a project",
      secondary: "See the work",
    },
  },
];
