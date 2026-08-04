# 404 Page — 3D Coin Animation

A standalone 404 page component with a spinning 3D coin (GLTF model) flanked by stylized "4" and "4" SVG numerals, animated fade-ins via Motion, and a "Go Back Home" CTA. Built for Next.js (App Router) with Tailwind CSS.

## Directory structure

```
fof-page-package/
├── page.tsx              # The page component (drop into any route)
├── public/
│   ├── coinModel.glb     # 3D coin GLTF model
│   ├── bakedCoin.webp    # Baked texture for coin faces
│   └── bakedRidges.webp  # Baked texture for coin ridges
└── README.md
```

## Setup instructions

### 1. Install dependencies

```bash
npm install three @react-three/fiber @react-three/drei motion
npm install -D @types/three
```

Tested versions:
- `three` — ^0.178.0
- `@react-three/fiber` — ^9.2.0
- `@react-three/drei` — ^10.5.0
- `motion` — ^12.16.0
- `@types/three` — ^0.178.1

### 2. Copy assets to your `public/` directory

Copy the three files from `public/` in this package into your project's `public/` folder (the Next.js static assets root):

```bash
cp fof-page-package/public/* your-project/public/
```

This places `coinModel.glb`, `bakedCoin.webp`, and `bakedRidges.webp` at the root of your public directory so the component can load them at `/coinModel.glb`, `/bakedCoin.webp`, and `/bakedRidges.webp`.

### 3. Add the page to a route

Copy `page.tsx` into any App Router route directory, e.g.:

```bash
cp fof-page-package/page.tsx your-project/src/app/fof/page.tsx
```

Then visit `/fof` in your browser.

### 4. Tailwind CSS requirement

This component uses Tailwind CSS utility classes. Your project must have Tailwind CSS configured and the route's content directory included in the Tailwind config's `content` array.

### 5. Next.js config — transpile packages (if needed)

If you hit module resolution issues with `three` or `@react-three/*`, add them to `transpilePackages` in `next.config.ts`:

```ts
const nextConfig = {
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
};
```

## Customization

- **Text content**: Edit the `content` object at the top of `page.tsx` to change the heading, subtext, and button label.
- **Link destination**: The "Go Back Home" button links to `/` — change the `href` in the `<Link>` component.
- **Component name**: The default export is `FourOhFourPage` — rename as needed for your route.
